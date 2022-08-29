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

const insertTicket = (request, response) => {
    const { hash, endDate } = request.body

    pool.query('INSERT INTO tickets (id, end_date) VALUES ($1, $2)', [hash, endDate], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`Ticket inserted successfully`)
    })
}

const updateTicket = (request, response) => {
    const { hash, email } = request.body

    pool.query(
        'UPDATE tickets SET email = $1 WHERE id = $2', [email, hash], (error, results) => {
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

module.exports = {
    insertTicket,
    updateTicket,
    deleteTicket
}