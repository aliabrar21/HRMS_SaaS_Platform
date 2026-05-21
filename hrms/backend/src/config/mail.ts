import nodemailer from 'nodemailer';
import { env } from './env.js';
import { logger } from '../common/utils/logger.js';

export const mailTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> => {
  try {
    await mailTransporter.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    logger.info('Transactional email sent', {
      to: options.to,
      subject: options.subject,
    });
  } catch (error) {
    logger.error('Failed to send email:', error);
    // We don't throw the error so that the app doesn't crash if SMTP is unconfigured in dev
  }
};
