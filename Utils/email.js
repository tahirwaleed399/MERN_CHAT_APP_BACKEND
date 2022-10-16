const nodemailer = require('nodemailer');

exports.sendMail =async function(email,subject,text){
    

const transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    secure:false,
    service: 'gmail',
    port:587,
    auth: {
        user:process.env.EMAIL_USERNAME,
        pass:process.env.EMAIL_PASSWORD
    }
});

const mailOptions={
    from: process.env.APP_NAME, // sender address
    to: email, // List of recipients
    subject: subject, // Subject line
    text: text
  }


  let res = await transporter.sendMail(mailOptions);
  return res
  
}