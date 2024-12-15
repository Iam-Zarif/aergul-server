const twilio = require("twilio");
require("dotenv").config();

const phoneOtp = () => Math.floor(10000 + Math.random() * 90000).toString();

// Setup Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendPhoneOTP = async (phoneNumber, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP is: ${otp}. Please use it within 5 minutes. Do not share it with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to: phoneNumber, // Recipient's phone number
    });

    console.log("OTP sent successfully:", message.sid);
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    throw new Error("Failed to send OTP");
  }
};

module.exports = { phoneOtp, sendPhoneOTP };
