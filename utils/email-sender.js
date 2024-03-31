const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/../config.env` });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(options) {
  // send mail with defined transport object
  await transporter.sendMail({
    from: options.sender, // sender address
    to: options.recipient, // list of receivers
    subject: options.subject,
    text: options.text, // plain text body
  });
}

module.exports = sendMail;
