import { Injectable, Logger } from '@nestjs/common';

// Lightweight mailer stub following the course's NestJS Mailer lecture.
// Swap the `send` implementation for @nestjs-modules/mailer + nodemailer
// once real SMTP credentials are available in .env (MAIL_HOST, MAIL_USER...).
@Injectable()
export class MailerService {
  private readonly logger = new Logger('MailerService');

  async send(to: string, subject: string, body: string) {
    this.logger.log(`Email -> ${to} | ${subject}\n${body}`);
    return true;
  }

  sendOrderConfirmation(to: string, orderId: string, total: number) {
    return this.send(
      to,
      `Order confirmed #${orderId.slice(0, 8)}`,
      `Thanks for your order! Total: $${total.toFixed(2)}. We'll notify you when it ships.`,
    );
  }

  sendOrderStatusUpdate(to: string, orderId: string, status: string) {
    return this.send(
      to,
      `Order #${orderId.slice(0, 8)} update`,
      `Your order status changed to: ${status}.`,
    );
  }
}
