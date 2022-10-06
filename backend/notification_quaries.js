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


//inserts notification to db, with passed email and notification msg
function insertNotification(email, msg) {

    //date of the moment of calling the function
    var datetime = new Date();

    pool.query('INSERT INTO notifications (user_id, message, received, date) VALUES ($1, $2, $3, $4)', [email, msg, false, datetime], (error, results) => {
        if (error) {
            throw error
        }
    })
}


//selects all cards for specified user (by email addrs)
const selectAllNotifacations = (request, response) => {
    const { email } = request.body

    pool.query('SELECT id, message, received, date FROM notifications WHERE user_id = $1 ', [email], (error, selectResult) => {
        if (error) {
            throw error
        }

        if (selectResult.rowCount == 0) {
            response.status(200).send("[{\"result\": \"no notifications\"}]");
        }
        else
            response.status(208).send(selectResult.rows);
    })
}


//updates received column if notification is seen in app fronted
const updateNotification = (request, response) => {
    const { notification_id } = request.body

    pool.query(
        'UPDATE notifications SET received = $2 WHERE id = $1', [notification_id, true], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Notification modified with id: ${notification_id}`)
        }
    )
}

module.exports = {
    insertNotification,
    selectAllNotifacations,
    updateNotification
}