import nodemailer from "nodemailer";

export async function sendMail(subject: string, toEmail: string, otpText: string) {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PW,
        },
    });

    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: toEmail,
        subject: subject,
        text: otpText,
    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error enviando el correo: ", error);
        } else {
            console.log("Correo enviado: ", info.response);
        }
    });
}