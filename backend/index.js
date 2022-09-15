//dodato
const cors = require('cors');
const express = require('express');
let app = express();
app.use(cors());
app.options('*', cors());
/////////////////////////////

// const express = require('express')
const bodyParser = require('body-parser')
// const app = express()
// const cors = require('cors');
const db = require('./queries')
const port = 3000

//app.options('*', cors())
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, token');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', false);

//     // Pass to next layer of middleware
//     next();
// });

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.post('/insertTicket', db.insertTicket)
app.delete('/deleteTicket', db.deleteTicket)
app.post('/selectEmail', db.selectEmail)
app.put('/sendCodeToEmail', db.sendCodeToEmail);
app.post('/checkVerificationCode', db.checkVerificationCode)

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})