const nodemailer = require("nodemailer");

const generateOTP = () => Math.floor(10000 + Math.random() * 90000).toString();

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Registration",
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendOTP };
// service -> otpService.js
