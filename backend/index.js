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
const notification = require('./notification_quaries')
const { DatabaseError } = require("pg");
const schedule = require('node-schedule');
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

app.post('/selectAllNotifacations', notification.selectAllNotifacations)
app.post('/updateNotification', notification.updateNotification)


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
        console.log(data.receiver_email + " : " + data.hash);

        let receiver_socket = user_map[data.receiver_email];

        //case when user is not present in user_map, thus the socket is undefined
        if (!(typeof receiver_socket === "undefined")) {
            console.log("Receiver socket: " + receiver_socket);
            receiver_socket.emit("card_received", (data.receiver_email + " received new card from: " + data.sender_email));

            console.log("Pozivanje fje");
            notification.insertNotification(data.receiver_email, "You got new card from " + data.sender_email, "Ticket received");
        }
        else
            console.log("Email: " + data.receiver_email + " is not present in user_map");
    })
});

http.listen(port, () => {
    console.log(`Server listening on ${port}`);
});




function datediff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

async function test() {
    let json = await db.selectAllTickets();
    let curr_date = new Date(); //todays date

    for (var i in json) {
        let ticket_end_date = json[i].end_date;
        let ticket_owner = json[i].email;
        let ticket_hash = json[i].id;

        //console.log("ticket_end_date: " + ticket_end_date);
        //console.log("curr_date " + curr_date);

        let days_to_expire = datediff(ticket_end_date, curr_date);
        if (days_to_expire > 0 && days_to_expire <= 2) {

            let user_socket = user_map[ticket_owner];

            if (!(typeof user_socket === "undefined")) {
                console.log(ticket_hash);
                user_socket.emit("card_received", ("Your card will expire in " + days_to_expire + " days"));

                notification.insertNotification(ticket_owner, "You ticket " + ticket_hash + " is expiring in 2 days!", "Ticket expiring");

                //TODO
                //upisati notifikaciju u bazu
                //handlovati received polje od notifikacije
            }

        }

    }

}

const daily_server_trigger = schedule.scheduleJob({ hour: 9, minute: 0 }, () => {
    test();
});

//setInterval(() => { test() }, 10000);