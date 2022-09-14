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
var QRCode = require('qrcode')


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

//remove data:image/png;base64,            

// const msg = {
//     to: 'example@gmail.com',
//     from: 'test@gmail.com',
//     subject: "image attached",
//     html :'<img src="cid:myimagecid"/>',
//     attachments: [
//       {
//         filename: "imageattachment.png",
//         content: imageb64,
//         content_id: "myimagecid",
//       }
//     ]
//   };

// sgMail.send(msg);

function getMessage2(email, imageb64, date) {

    var date_parts = date.split("/");

    return {
        to: email,
        from: 'beoseats@gmail.com',
        subject: 'BeoSeat verification code',
        // html: '<img align="top" style="display: block" src="cid:myimagecid"/>',
        html: `
        <!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    background: #DDD;
    font-family: 'Inknut Antiqua', serif;
    font-family: 'Ravi Prakash', cursive;
    font-family: 'Lora', serif;
    font-family: 'Indie Flower', cursive;
    font-family: 'Cabin', sans-serif;
}

.QR-text {
    font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    color: #8b98ff;
}

.item-QR {
    display: flex;
    justify-content: space-between;
    padding-left: 20px;
    padding-right: 20px;
    color: #8b98ff;
}

.item-QR-right {
    border-style: solid;
    border-width: 2px;
    border-color: white;
}

.item-QR-left {
    text-align: left;
    margin-top: 20px;
    margin-right: 15px;
    color: #8b98ff;
}

.item {
    width: 85%;
    padding: 0 20px;
    background: black;
    overflow: hidden;
    margin: 10px
}

.item-right,
.container .item-left {
    float: left;
    /* padding: 20px */
}

.container {
    color: #8b98ff;
}

.item-right .item-left .item-QR {
    display: inline-table;
}

.item-right {
    padding: 79px 50px;
    margin-right: 20px;
    width: 25%;
    position: relative;
    height: 286px
}

.item-right .up-border,
.container .item-right .down-border {
    padding: 14px 15px;
    background-color: #8b98ff;
    border-radius: 50%;
    position: absolute
}

.item-right .up-border {
    top: -12px;
    right: -36px;
}

.item-right .down-border {
    bottom: -22px;
    right: -36px;
}

.item-right .num {
    font-size: 60px;
    text-align: center;
    /* color: #111 */
}

.item-right .day,
.container .item-left .event {
    /* color: #555; */
    font-size: 20px;
    margin-bottom: 9px;
}

.item-right .day {
    text-align: center;
    font-size: 25px;
}

.valid {
    font-size: 15px;
}

.item-left {
    width: 71%;
    padding: 34px 0px 19px 0px;
    border-left: 3px dotted #999;
}

.item-left .title {
    color: #8b98ff;
    font-size: 34px;
    margin-bottom: 12px
}

.item-left .sce {
    margin-top: 5px;
    display: block
}

.container .item-left .sce .icon,
.container .item-left .sce p,
.container .item-left .loc .icon,
.container .item-left .loc p {
    float: left;
    word-spacing: 5px;
    letter-spacing: 1px;
    color: #888;
    margin-bottom: 10px;
}

.item-left .sce .icon,
.container .item-left .loc .icon {
    margin-right: 10px;
    font-size: 20px;
    color: #665
}

.item-left .loc {
    display: block
}

.fix {
    clear: both
}

.share {
    border: black;
}

.item .share {
    color: #fff;
    padding: 6px 14px;
    float: right;
    margin-top: 10px;
    margin-right: 18px;
    font-size: 18px;
    cursor: pointer
}

.item .share {
    /* background: #0a6efd; */
    color: #8b98ff;
    border-color: #8b98ff;
}

.title, .event {
	margin-left: 3%;
}

.father-div{
	padding-top: 10px;
    padding-right: 20px;
	width:1000px;
    height:350px;
}

@media only screen and (max-width: 1150px) {
    .item {
        width: 100%;
        margin-right: 20px
    }
}
</style>
</head>
<body>

<div class = 'father-div'>
	<div class='container'>
      <div class='item'>
        <div class='item-right'>
          <h3 class='valid'>Until:</h3>
          <h2 class='num'>${date_parts[0]}</h2>
          <p class='day'>${date_parts[1]}</p>
        </div>

        <div class='item-left'>
          <p class='title'>Enterance ticket</p>
          <h2 class='event'>Redeemed by: ${email}</h2>

          <div class='item-QR'>
            <div class='item-QR-left'>
              <p class='QR-text'> ${date}</p>
              <p class='QR-text'>Address: Masarikova 5, Beograd 11000</p>
            </div>
            <div class='item-QR-right'>
            <img align="top" style="display: block" src="cid:myimagecid" width = "150px" height = "150px/>
            </div>
          </div>

   

      </div>
    </div>
   </div>
</div>

</body>
</html> 
        `,
        attachments: [
            {
                filename: "ticketQR.png",
                content: imageb64,
                content_id: "myimagecid",
                disposition: "inline",
            }
        ]
    };
}

async function sendEmail2(email, hash, date) {
    try {
        QRCode.toDataURL(hash, function (err, url) {

            imageb64 = url.replace('data:image/png;base64,', '');
            sendGridMail.send(getMessage2(email, imageb64, date));
        })

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

    pool.query('SELECT code, email, TO_CHAR(end_date, \'dd/mm/yyyy\') AS result FROM tickets where code = $1 AND id = $2', [code, hash], (error, results) => {
        if (error) {
            throw error
        }

        if (results.rowCount > 0) {
            response.status(200).send("[{\"result\": \"valid_code\"}]")
            sendEmail2(results.rows[0].email, hash, results.rows[0].result);
        }
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