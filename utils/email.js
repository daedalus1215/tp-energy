require('dotenv').config();
const nodemailer = require('nodemailer');

const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.EMAIL_TO,
    subject: 'Electricity Notice',
    text: 'Replace Me With A Message'
};

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

module.exports = {
    transporter,
    mailOptions
}