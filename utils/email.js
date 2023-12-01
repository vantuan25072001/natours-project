// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1. Tạo 1 phương tiện vận chuyển
  const transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'd8aaedf5ad2f51',
      pass: '8c9f1371637231',
    },
  });
  //2. Xác định các tùy chọn email
  const mailOptions = {
    from: 'Nguyễn Văn Tuấn <vantuan@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };
  //3. Gửi email
  await transport.sendMail(mailOptions);
};
module.exports = sendEmail;
