const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',  // use 'gmail' as the service
    auth: {
        user: 'mrjyothiswaruban@gmail.com',
        pass: 'wwbj wtgb brkh hwdg'  // Use the app password here
    }
});

const sendEmail = (to, subject, text) => {
    let mailOptions = {
        from: 'mrjyothiswaruban@gmail.com',  // Replace with your sender email
        to: to,
        subject: subject,
        text: text
    };

    return transporter.sendMail(mailOptions)
        .then(info => {
            console.log('Email sent: ' + info.response);
            return { success: true, info: info.response };
        })
        .catch(error => {
            console.error('Error sending email: ' + error);
            return { success: false, error: error };
        });
};

module.exports = sendEmail;