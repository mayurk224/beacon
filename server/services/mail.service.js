import nodemailer from 'nodemailer'
import { verificationEmailTemplate, passwordResetEmailTemplate, inviteEmailTemplate } from '../utils/emailTemplate.js'
import config from '../config/config.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.GOOGLE_USER,
        pass: config.GOOGLE_APP_PASS,
    },
});

transporter.verify()
    .then(() => console.error('Email server is ready to send messages'))
    .catch((err) => console.log('Error connecting to email server:', err))

export const sendVerificationEmail = async ({ name, email, token }) => {
    if (process.env.NODE_ENV === 'test') return;
    const baseUrl = config.SERVER_URL || `http://localhost:${config.PORT || 3000}`
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

    const html = verificationEmailTemplate({ name, verificationUrl, expiryHours: 1 })

    await transporter.sendMail({
        from: `"Beacon. " <${config.GOOGLE_USER}>`,
        to: email,
        subject: 'Verify your email address — Beacon.',
        html,
    })
}

export const sendResetPasswordEmail = async ({ name, email, resetToken }) => {
    if (process.env.NODE_ENV === 'test') return;
    const resetUrl = `${config.CLIENT_URL}/reset-password?token=${resetToken}`

    const html = passwordResetEmailTemplate({ name, resetUrl, expiryMinutes: 15 })

    await transporter.sendMail({
        from: `"Beacon Security" <${config.GOOGLE_USER}>`,
        to: email,
        subject: 'Reset your password — Beacon.',
        html,
    })
}

export const sendInviteEmail = async ({ email, organizationName, inviteLink, role }) => {
    if (process.env.NODE_ENV === 'test') return;
    const html = inviteEmailTemplate({ organizationName, inviteLink, role, expiryHours: 24 })

    await transporter.sendMail({
        from: `"Beacon" <${config.GOOGLE_USER}>`,
        to: email,
        subject: `You've been invited to join ${organizationName} on Beacon`,
        html,
    })
}