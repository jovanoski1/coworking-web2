require('dotenv').config({ path: '../.env' });

//sendGrid api config
const sendGridMail = require('@sendgrid/mail');
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

var QRCode = require('qrcode')
const ticket = require('./ticket')


//creating mail body with verification code
function verificationCodeMailBody(email, code) {
    const body = 'Your code for redeeming ticket for BeoSeats is: ' + code;
    return {
        to: email,
        from: 'beoseats@gmail.com',
        subject: 'BeoSeat verification code',
        text: body,
        html: `<strong>${body}</strong>`,
    };
}


//sending verification code to mail
async function sendVerificationCodeToMail(email, code) {
    try {
        await sendGridMail.send(verificationCodeMailBody(email, code));
        console.log('Test email sent successfully');
    } catch (error) {
        console.error('Error sending test email');
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
    }
}


//creating mail with embeded ticket 
function generateTicketForMail(email, imageb64, date) {
    return {

        to: email,
        from: 'beoseats@gmail.com',
        subject: 'BeoSeat verification code',
        html: ticket.generateTicket(email, date),

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

//sending ticket to email
async function sendTicketToEmail(email, hash, date) {
    try {
        QRCode.toDataURL(hash, function (err, url) {

            imageb64 = url.replace('data:image/png;base64,', '');
            sendGridMail.send(generateTicketForMail(email, imageb64, date));
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

module.exports = {
    sendVerificationCodeToMail,
    sendTicketToEmail,
}