import nodemailer from "nodemailer"

export async function sendMail(subject: string, toEmail: string, otpText: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
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

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            throw new Error(String(error));
        } else {
            return true;
        }
    });
}