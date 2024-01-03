// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1. Tạo 1 phương tiện vận chuyển
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2. Xác định các tùy chọn email
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };
  //3. Gửi email
  await transport.sendMail(mailOptions);
};
module.exports = sendEmail;
