const cors = require('cors');
const express = require('express');
let app = express();
app.use(cors());
app.options('*', cors());

const bodyParser = require('body-parser')

const db = require('./ticket_queries')
const db2 = require('./user_quaries')
const port = 3000

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.post('/insertTicket', db.insertTicket)
app.delete('/deleteTicket', db.deleteTicket)
app.post('/selectEmail', db.selectEmail)
app.put('/sendCodeToEmail', db.sendCodeToEmail)
app.post('/checkVerificationCode', db.checkVerificationCode)
app.post('/selectUser', db2.selectUser)
app.post('/insertUser', db2.insertUser)
app.post('/updateAvatar', db2.updateAvatar)
app.post('/deleteUser', db2.deleteUser)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})