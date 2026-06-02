import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const emailLogPath = path.join(__dirname, '../../data/email-log.json');

async function readLog() {
  try {
    return JSON.parse(await fs.readFile(emailLogPath, 'utf-8'));
  } catch {
    return [];
  }
}

export async function sendMail({ to, subject, message, type }) {
  const smtpReady = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    to,
    subject,
    message,
    type,
    provider: smtpReady ? 'smtp' : 'not-configured',
    status: smtpReady ? 'pending' : 'not-sent',
    createdAt: new Date().toISOString()
  };

  if (smtpReady) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        text: message
      });

      entry.status = 'sent';
    } catch (error) {
      entry.status = 'failed';
      entry.error = error.message;
    }
  }

  const log = await readLog();
  log.push(entry);
  await fs.mkdir(path.dirname(emailLogPath), { recursive: true });
  await fs.writeFile(emailLogPath, JSON.stringify(log, null, 2));
  return entry;
}

export async function listMailLog() {
  return readLog();
}
