// utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use 'smtp.office365.com', etc.
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends contact form data to the organization's email.
 * @param {Object} param0
 */
const sendContactEmail = async ({ fullName, email, subject, message }) => {
  const mailOptions = {
    from: `"Zeelevate Contact Form" <${process.env.SMTP_USER}>`,
    to: process.env.ORG_EMAIL,
    subject: `📩 New Contact Form Submission - ${subject}`,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p style="font-size: 0.9em; color: #888;">Sent via zeelevate contact form</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendContactEmail };
