const socket = require("socket.io")
const cors = require('cors');
const express = require('express');
let app = express();
const http = require('http').Server(app);
app.use(cors());
app.options('*', cors());
const bodyParser = require('body-parser')

const db = require('./ticket_queries')
const db2 = require('./user_quaries');
const { DatabaseError } = require("pg");
const port = 3000

const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

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

app.post('/shareTicket', db.shareTicket)
app.post('/activateTicket', db.activateTicket)
app.post('/selectTicktes', db.selectTicktes)


let user_map = {};

socketIO.on('connection', (socket) => {
    console.log("socket connected:" + socket.id);

    socket.on("user_connected", (data) => {

        //TODO:
        //Ukoliko mejl vec postoji u mapi, znaci da je korisnik bio offline i da je sada online sa novim socketom
        //potrebno je prikazati obavestenja koja su se desila dok je bio offline - realizacija preko baze
        user_map[data] = socket;
        console.log("user " + data + " : " + user_map[data]);
    })

    setInterval(() => { socket.emit("hello from server") }, 5000);

    socket.on("shared_ticket", (data) => {
        console.log(data.email + " : " + data.hash);

        let receiver_socket = user_map[data.email];

        //case when user is not present in user_map, thus the socket is undefined
        if (!(typeof receiver_socket === "undefined")) {
            console.log("Receiver socket: " + receiver_socket);
            receiver_socket.emit("card_received", ("You have received new card from: " + data.email));
        }
        else
            console.log("Email: " + data.email + " is not present in user_map");
    })
});

http.listen(port, () => {
    console.log(`Server listening on ${port}`);
});

