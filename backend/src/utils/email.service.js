const nodemailer = require("nodemailer");

function getMailFrom() {
  return process.env.MAIL_FROM || process.env.MAIL_USER;
}

function getTransporter() {
  if (!process.env.MAIL_HOST || !process.env.MAIL_PORT || !process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
    throw new Error("Email environment variables MAIL_HOST, MAIL_PORT, MAIL_USER, and MAIL_PASSWORD are required");
  }

  const transporterOptions = {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: Number(process.env.MAIL_PORT) === 465,
    requireTLS: Number(process.env.MAIL_PORT) === 587,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  };

  if (process.env.MAIL_SERVICE) {
    transporterOptions.service = process.env.MAIL_SERVICE;
  }

  if (process.env.MAIL_HOST === "smtp.gmail.com") {
    transporterOptions.service = transporterOptions.service || "gmail";
    transporterOptions.tls = {
      rejectUnauthorized: false,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    transporterOptions.logger = true;
    transporterOptions.debug = true;
  }

  return nodemailer.createTransport(transporterOptions);
}

async function sendEmail({ to, subject, text, html }) {
  const transporter = getTransporter();

  await transporter.verify();

  const info = await transporter.sendMail({
    from: getMailFrom(),
    to,
    subject,
    text,
    html,
  });

  return info;
}

module.exports = { sendEmail };
