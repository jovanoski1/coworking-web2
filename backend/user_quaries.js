const Pool = require('pg').Pool
var fs = require('fs');
require('dotenv').config({ path: '../.env' });

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


//selects info about user with passed email
const selectUser = (request, response) => {
    const { email } = request.body

    pool.query('SELECT (avatar) as result FROM users WHERE LOWER(email) = LOWER(($1))', [email], (error, selectResult) => {
        if (error) {
            throw error
        }

        if (selectResult.rowCount == 0) {
            response.status(200).send("[{\"result\": \"user not existing\"}]");
        }
        else
            response.status(208).send(selectResult.rows);
    })
}

//checks if user exists in db
const checkUser = (request, response) => {
    const { email } = request.body

    pool.query('SELECT (email) as result FROM users WHERE LOWER(email) = LOWER(($1))', [email], (error, selectResult) => {
        if (error) {
            throw error
        }

        if (selectResult.rowCount == 0) {
            response.status(404).send();
        }
        else
            response.status(200).send();
    })
}


//inserts user to db, with passed email and avatar
const insertUser = (request, response) => {
    const { email, avatar } = request.body

    pool.query('INSERT INTO users (email, avatar) VALUES (LOWER($1), LOWER($2))', [email, avatar], (error, insertResult) => {
        if (error) {
            throw error
        }
        response.status(201).send(`User inserted successfully`)
    })
}


//updates avatar column for passed email
const updateAvatar = (request, response) => {
    const { email, avatar } = request.body

    pool.query(
        'UPDATE users SET avatar = $2 WHERE LOWER(email) = LOWER($1)', [email, avatar], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Avatar modified for user with email: ${email}`)
        }
    )
}


//deletes user from db with passed email
const deleteUser = (request, response) => {
    const { email } = request.body

    pool.query('DELETE FROM users WHERE LOWER(email) = LOWER($1)', [email], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User deleted with email: ${email}`)
    })
}


module.exports = {
    selectUser,
    checkUser,
    insertUser,
    updateAvatar,
    deleteUser
}