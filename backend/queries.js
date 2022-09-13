const Pool = require('pg').Pool
var fs = require('fs');
require('dotenv').config({ path: '../.env' });

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

const sendGridMail = require('@sendgrid/mail');
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);


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

const insertTicket = (request, response) => {
    const { hash, endDate } = request.body

    pool.query('SELECT (id, end_date, email) FROM tickets WHERE id = ($1)', [hash], (error, selectResult) => {
        if (error) {
            throw error
        }

        if (selectResult.rowCount == 0) {
            pool.query('INSERT INTO tickets (id, end_date) VALUES ($1, $2)', [hash, endDate], (error, insertResult) => {
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

const updateTicket = (request, response) => {
    const { hash, email } = request.body

    pool.query(
        'UPDATE tickets SET email = $1 WHERE id = $2 AND email is null', [email, hash], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Ticket modified with ID: ${hash}`)
        }
    )
}

const deleteTicket = (request, response) => {
    const { hash } = request.body

    pool.query('DELETE FROM tickets WHERE id = $1', [hash], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User deleted with ID: ${hash}`)
    })
}

function getMessage(email, code) {
    const body = 'Your code for redeeming ticket for BeoSeats is: ' + code;
    return {
        to: email,
        from: 'beoseats@gmail.com',
        subject: 'BeoSeat verification code',
        text: body,
        html: `<strong>${body}</strong>`,
    };
}

async function sendEmail(email, code) {
    try {
        await sendGridMail.send(getMessage(email, code));
        console.log('Test email sent successfully');
    } catch (error) {
        console.error('Error sending test email');
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
    }
}

async function generateVerificationCode(request, response) {
    const { email, hash } = request.body

    const rand = Math.floor(Math.random() * (1000000 - 100000) + 100000); //rand in range [100000, 999999]

    pool.query(
        'UPDATE tickets SET code = $1 WHERE email = $2 AND id = $3', [rand, email, hash], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Code generated form email: ${email}`)
        }
    )

    await sendEmail(email, rand);
}

const checkVerificationCode = (request, response) => {
    const { code, hash } = request.body

    pool.query('SELECT code AS result FROM tickets where code = $1 AND id = $2', [code, hash], (error, results) => {
        if (error) {
            throw error
        }

        if (results.rowCount > 0)
            response.status(200).send("[{\"result\": \"valid_code\"}]")
        else
            response.status(200).send("[{\"result\": \"invalid_code\"}]")
    })
}


module.exports = {
    insertTicket,
    updateTicket,
    deleteTicket,
    selectEmail,
    generateVerificationCode,
    checkVerificationCode
}