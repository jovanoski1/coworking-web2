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
function insertNotification(email, msg, title, ticket_hash) {

    //date of the moment of calling the function
    var datetime = new Date();

    pool.query('INSERT INTO notifications (user_id, message, received, date, title, ticket_hash) VALUES ($1, $2, $3, $4, $5, $6)', [email, msg, false, datetime, title, ticket_hash], (error, results) => {
        if (error) {
            throw error
        }
    })
}


//selects all cards for specified user (by email addrs)
const selectAllNotifacations = (request, response) => {
    const { email } = request.body

    pool.query('SELECT id, message, received, date, title, ticket_hash FROM notifications WHERE user_id = $1 order by date desc', [email], (error, selectResult) => {
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


//notificaqtion is considered unread when its column "received" is false in db
//thus notification is considered unread when its not received
//function return number of unread or read notifications depending on passed isReceived value
const numberOfUnreadNotification = (request, response) => {
    const { email, isReceived } = request.body

    pool.query('SELECT DISTINCT COUNT(received) as result FROM notifications WHERE received = $2 AND user_id = $1', [email, isReceived], (error, selectResult) => {
        if (error) {
            throw error
        }

        response.status(200).send(selectResult.rows);
    })
}


module.exports = {
    insertNotification,
    selectAllNotifacations,
    updateNotification,
    numberOfUnreadNotification
}