import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger('MailerService');
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD } = process.env;
    if (MAIL_HOST && MAIL_USER && MAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: Number(MAIL_PORT) || 587,
        secure: Number(MAIL_PORT) === 465,
        auth: { user: MAIL_USER, pass: MAIL_PASSWORD },
      });
    }
  }

  async send(to: string, subject: string, body: string) {
    if (!this.transporter) {
      // No SMTP configured - fall back to logging so local dev still works
      // without requiring a real mail account.
      this.logger.log(`Email -> ${to} | ${subject}\n${body}`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || 'OneSpace <no-reply@onespace.test>',
        to,
        subject,
        text: body,
      });
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${(err as Error).message}`);
      // Also log the content so nothing is silently lost in dev.
      this.logger.log(`Email (failed to send) -> ${to} | ${subject}\n${body}`);
      return false;
    }
  }

  sendOrderConfirmation(to: string, orderId: string, total: number) {
    return this.send(
      to,
      `Order confirmed #${orderId.slice(0, 8)}`,
      `Thanks for your order! Total: ${total.toFixed(2)}. We'll notify you when it ships.`,
    );
  }

  sendOrderStatusUpdate(to: string, orderId: string, status: string) {
    return this.send(
      to,
      `Order #${orderId.slice(0, 8)} update`,
      `Your order status changed to: ${status}.`,
    );
  }

  sendVerificationEmail(to: string, verifyUrl: string) {
    return this.send(
      to,
      'Verify your email',
      `Welcome! Please verify your email by visiting this link: ${verifyUrl}`,
    );
  }
}
