const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '.env' });

// generate a random number for using as OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// send mail to the mail address of registered user for email verification
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
      html: `<p>Hello, <strong>${body.name}</strong>, Please click the link button below to complete the registration process. If this is not you, you can safely ignore this email</p><a href="http://localhost:3000/verifyEmailSuccess/${body.name}">Click here</a>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
    return 'success';
  } catch (error) {
    console.log(error);
    return 'error';
  }
};

// generate otp,store it in a cookie and send it through an email to the user.
async function sendOTP(req, res, email) {
  try {
    const otp1 = generateOTP();
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
      subject: 'VerifY  your Email',
      text: `Your OTP: ${otp1}`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    const user = await User.findOne({ email });
    user.otpToken = otp1;
    user.tokenExpires = Date.now() + 300000;
    await user.save();
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// generate otp,store it in a cookie and send it through an email to the user.
async function resetOTP(req, res, document) {
  try {
    const otp1 = generateOTP();
    res.cookie('otpReset', otp1, { signed: true });
    res.cookie('usernameReset', document.email, { signed: true });
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
      to: document.email,
      subject: 'Enter this OTP to reset password',
      text: `Your OTP: ${otp1}`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return otp1;
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = {
  generateOTP,
  sendOTP,
  verifyEmail,
  resetOTP,
};
