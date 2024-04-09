const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const pug = require('pug');
const htmlToText = require('html-to-text');

dotenv.config({ path: `${__dirname}/../config.env` });

module.exports = class EmailSender {
  constructor(user, url) {
    this.email = user.email;
    this.name = user.name.split(' ')[0];
    this.url = url;
  }

  createTranporter() {
    // if (process.env.DEV_STATUS === 'DEVELOPMENT') {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    // }

    return transporter;
  }

  async sendEmail(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        email: this.email,
        name: this.name,
        url: this.url,
      }
    );

    const options = {
      from: '"Alex Foo Koch 👻" <docent@ethereal.email>', // sender address
      to: this.email, // list of receivers
      subject: subject,
      html,
      text: htmlToText.convert(html), // plain text body
    };

    await this.createTranporter().sendMail(options);
  }

  async sendWelcomeMessage() {
    await this.sendEmail('welcomeEmail', 'Welcome to our resource!');
  }

  async sendPasswordRecoveryMessage() {
    await this.sendEmail(
      'passwordRecovary',
      'Your password recovery next steps'
    );
  }
};
