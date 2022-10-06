const Pool = require('pg').Pool
var fs = require('fs');
require('dotenv').config({ path: '../.env' });
const mailClient = require('./mail_api');


//db parameters
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {
        ca: fs.readFileSync('ca-certificate.crt')
    }
})


//select redeemer for ticket if exist
//if not "Not redeemed" is returned
const selectEmail = (request, response) => {
    const { hash } = request.body

    pool.query('SELECT COALESCE(email, \'Not redeemed\') AS result FROM tickets where id= $1', [hash], (error, results) => {
        if (error) {
            throw error
        }

        if (results.rowCount > 0)
            response.status(200).send(results.rows)
        else
            response.status(200).send("[{\"result\": \"no_hashes\"}]")
    })
}


//inserting ticket into db, unless it already exists
//if ticket exists and someone redeemed it, insertion should not happen (because of Web3 implementation)
const insertTicket = (request, response) => {
    const { hash, endDate } = request.body

    pool.query('SELECT (id, end_date, email) FROM tickets WHERE id = ($1)', [hash], (error, selectResult) => {
        if (error) {
            throw error
        }

        if (selectResult.rowCount == 0) {

            const rand = Math.floor(Math.random() * (1000000 - 100000) + 100000); //rand in range [100000, 999999]
            pool.query('INSERT INTO tickets (id, end_date, code) VALUES ($1, $2, $3)', [hash, endDate, rand], (error, insertResult) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`Ticket inserted successfully`)
            })
        }
        else
            response.status(208).send('Ticket already exists')
    })
}


//deleting ticket from db
const deleteTicket = (request, response) => {
    const { hash } = request.body

    pool.query('DELETE FROM tickets WHERE id = $1', [hash], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User deleted with ID: ${hash}`)
    })
}


//sending verification code for redeeming ticket
async function sendCodeToEmail(request, response) {
    const { email, hash } = request.body

    pool.query('SELECT code FROM tickets where id= $1', [hash], (error, results) => {
        if (error) {
            throw error
        }

        if (results.rowCount > 0) {
            response.status(200).send("Code sent to email successfully");
            mailClient.sendVerificationCodeToMail(email, results.rows[0].code);
        }
        else
            response.status(200).send("Sending code failed");
    })
}


//checking if user entered valid code and sending ticket to mail
//ticket is not redeemed if email == NULL
const checkVerificationCode = (request, response) => {
    const { code, hash, email } = request.body

    pool.query('SELECT code, TO_CHAR(end_date, \'dd/mm/yyyy\') AS result FROM tickets where code = $1 AND id = $2 AND email is NULL', [code, hash], (error, results) => {
        if (error) {
            throw error
        }

        if (results.rowCount > 0) {
            pool.query(
                'UPDATE tickets SET email = $1 WHERE id = $2 AND email is null', [email, hash], (error, results) => {
                    if (error) {
                        throw error
                    }
                    response.status(200).send(`Ticket modified with ID: ${hash}`)
                }
            )
            mailClient.sendTicketToEmail(email, hash, results.rows[0].result);
        }
        else
            response.status(202).send("[{\"result\": \"invalid_code or already redeemed\"}]")
    })

}


//updating email column to set new potential owner of card
//email becomes final owner of card when column active is set to true (that happens after redeeaming card - activateTicket function)
const shareTicket = (request, response) => {
    const { hash, email } = request.body

    pool.query(
        'UPDATE tickets SET email = $1 WHERE id = $2 AND activated = false', [email, hash], (error, results) => {
            if (error) {
                throw error
            }

            if (results.rowCount == 1)
                response.status(201).send(`Potential redeemer seted for ticket with id: ${hash}`)
            else
                response.status(200).send(`Ticket with id already activated, id: ${hash}`)
        }
    )

}


//updating email column to set new potential owner of card
//email becomes final owner of card when column active is set to true (that happens after redeeaming card)
const activateTicket = (request, response) => {
    const { hash, email } = request.body

    pool.query(
        'UPDATE tickets SET activated = $3 WHERE id = $2 AND email = $1', [email, hash, true], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Ticket activated with id: ${hash}`)
        }
    )

}


//selects all tickets for user thah has passed email
const selectTicktes = (request, response) => {
    const { email } = request.body

    pool.query('SELECT id, end_date, activated FROM tickets where email = $1', [email], (error, results) => {
        if (error) {
            throw error
        }

        if (results.rowCount > 0)
            response.status(200).send(results.rows)
        else
            response.status(200).send("[{\"result\": \"no_tickets\"}]")
    })
}


//selects all ticket 
//result will be past in index js for emitting custom notification
async function selectAllTickets() {

    var ret;
    ret = await pool.query('SELECT id, email, end_date, activated FROM tickets WHERE email IS NOT NULL', []);


    return ret.rows;
}

module.exports = {
    insertTicket,
    deleteTicket,
    selectEmail,
    sendCodeToEmail,
    checkVerificationCode,
    shareTicket,
    activateTicket,
    selectTicktes,
    selectAllTickets
}