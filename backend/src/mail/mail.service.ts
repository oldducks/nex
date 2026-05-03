import { Injectable } from '@nestjs/common';
import type { Transporter } from 'nodemailer';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const nodemailer = require('nodemailer') as typeof import('nodemailer');

type UpgradeSlipEmailPayload = {
  packageDisplayName: string;
  amount: number;
  userEmail: string;
  userId: number;
  orderId: number;
  slipUrl?: string;
  submittedAt: Date;
};

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
    // Configure with environment variables
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  }

  async sendPasswordResetEmail(to: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@namecard.com',
      to,
      subject: 'รีเซ็ตรหัสผ่าน - NEX Solution',
      html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #EEF0FF;">
                    <div style="background: #050579; padding: 28px 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <p style="margin: 0 0 8px; color: #D9E1F2; font-size: 12px; letter-spacing: 1.4px; font-weight: 700;">NEX SOLUTION</p>
                        <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">รีเซ็ตรหัสผ่าน</h1>
                    </div>
                    <div style="background: #FFFFFF; border: 1px solid #D9E1F2; border-top: none; padding: 30px; border-radius: 0 0 16px 16px; color: #0F172A;">
                        <p style="margin-bottom: 20px; line-height: 1.6;">
                            คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี NEX Solution ของคุณ
                        </p>
                        <p style="margin-bottom: 20px; line-height: 1.6;">
                            คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="display: inline-block; background: #FF6B00; color: #FFFFFF; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
                                ตั้งรหัสผ่านใหม่
                            </a>
                        </div>
                        <p style="margin-bottom: 10px; color: #64748B; font-size: 14px;">
                            หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:
                        </p>
                        <p style="word-break: break-all; background: #F6F8FF; border: 1px solid #D9E1F2; padding: 12px; border-radius: 8px; font-size: 12px; color: #050579;">
                            ${resetUrl}
                        </p>
                        <hr style="border: none; border-top: 1px solid #D9E1F2; margin: 30px 0;" />
                        <p style="color: #64748B; font-size: 12px; text-align: center;">
                            ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง<br/>
                            หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน สามารถเพิกเฉยอีเมลนี้ได้
                        </p>
                    </div>
                </div>
            `,
    };

    try {
      /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      await this.transporter.sendMail(mailOptions);
      /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      console.log(`[Mail] Password reset email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('[Mail] Failed to send email:', error);
      return false;
    }
  }

  async sendUpgradeSlipNotification(payload: UpgradeSlipEmailPayload) {
    const recipients = (
      process.env.UPGRADE_PLAN_NOTIFY_EMAILS ||
      process.env.SMTP_USER ||
      ''
    )
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!recipients.length) {
      console.warn(
        '[Mail] No recipients configured for upgrade slip notification',
      );
      return false;
    }

    const submittedAt = payload.submittedAt.toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@namecard.com',
      to: recipients.join(','),
      subject: `แจ้งอัปเกรดแพ็กเกจใหม่ #${payload.orderId}`,
      html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #0F172A;">
                    <div style="background: #050579; border-radius: 20px 20px 0 0; padding: 24px 28px;">
                        <h1 style="margin: 0; color: #FFFFFF; font-size: 24px;">มีการส่งสลิปอัปเกรดแพ็กเกจใหม่</h1>
                        <p style="margin: 8px 0 0; color: #D9E1F2; font-size: 14px;">ระบบ NEX Solution ได้รับคำขออัปเกรดแพ็กเกจเรียบร้อยแล้ว</p>
                    </div>
                    <div style="background: #FFFFFF; border: 1px solid #D9E1F2; border-top: none; border-radius: 0 0 20px 20px; padding: 28px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 10px 0; color: #64748B;">Order ID</td><td style="padding: 10px 0; font-weight: 700; color: #050579;">#${payload.orderId}</td></tr>
                            <tr><td style="padding: 10px 0; color: #64748B;">User ID</td><td style="padding: 10px 0; font-weight: 700;">${payload.userId}</td></tr>
                            <tr><td style="padding: 10px 0; color: #64748B;">อีเมลผู้ส่ง</td><td style="padding: 10px 0; font-weight: 700;">${payload.userEmail}</td></tr>
                            <tr><td style="padding: 10px 0; color: #64748B;">แพ็กเกจ</td><td style="padding: 10px 0; font-weight: 700;">${payload.packageDisplayName}</td></tr>
                            <tr><td style="padding: 10px 0; color: #64748B;">ยอดชำระ</td><td style="padding: 10px 0; font-weight: 700;">${payload.amount.toLocaleString('th-TH')} บาท</td></tr>
                            <tr><td style="padding: 10px 0; color: #64748B;">เวลาที่ส่ง</td><td style="padding: 10px 0; font-weight: 700;">${submittedAt}</td></tr>
                        </table>

                        ${
                          payload.slipUrl
                            ? `
                            <div style="margin-top: 24px; padding: 16px; border-radius: 16px; background: #F6F8FF; border: 1px solid #D9E1F2;">
                                <p style="margin: 0 0 8px; font-size: 13px; color: #64748B;">ลิงก์สลิปที่อัปโหลด</p>
                                <a href="${payload.slipUrl}" style="color: #050579; font-weight: 700; text-decoration: underline; word-break: break-all;">${payload.slipUrl}</a>
                            </div>
                        `
                            : ''
                        }
                    </div>
                </div>
            `,
    };

    try {
      /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      await this.transporter.sendMail(mailOptions);
      /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      console.log(
        `[Mail] Upgrade slip notification sent for order ${payload.orderId}`,
      );
      return true;
    } catch (error) {
      console.error('[Mail] Failed to send upgrade slip email:', error);
      return false;
    }
  }
}
