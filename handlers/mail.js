const nodemailer = require('nodemailer');
require('dotenv').config({ path: 'variables.env' });

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const verifyEmail = async (body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.NM_EMAIL,
        pass: process.env.NM_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.AU_EMAIL,
      to: body.email,
      subject: 'Welcome to e-mart',
      html: `<p>Hello, <strong>${body.username}</strong>, Please click the link button below to complete the registration process. If this is not you, you can safely ignore this email</p><a href="http://localhost:3000/successemail/${body.username}">Click here</a>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
    return 'success';
  } catch (error) {
    console.log(error);
    return 'error';
  }
};

async function sendOTP(email, otp) {
  try {
    // Configure the email transport settings
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.NM_EMAIL,
        pass: process.env.NM_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Compose the email message
    const mailOptions = {
      from: process.env.NM_EMAIL,
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP: ${otp}`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = {
  generateOTP,
  sendOTP,
  verifyEmail,
};
