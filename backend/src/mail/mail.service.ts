import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Configure with environment variables
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendPasswordResetEmail(to: string, resetToken: string) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@namecard.com',
            to,
            subject: 'รีเซ็ตรหัสผ่าน - Digital Namecard',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🔐 รีเซ็ตรหัสผ่าน</h1>
                    </div>
                    <div style="background: #18181b; padding: 30px; border-radius: 0 0 16px 16px; color: #e4e4e7;">
                        <p style="margin-bottom: 20px; line-height: 1.6;">
                            คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี Digital Namecard ของคุณ
                        </p>
                        <p style="margin-bottom: 20px; line-height: 1.6;">
                            คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">
                                ตั้งรหัสผ่านใหม่
                            </a>
                        </div>
                        <p style="margin-bottom: 10px; color: #a1a1aa; font-size: 14px;">
                            หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:
                        </p>
                        <p style="word-break: break-all; background: #27272a; padding: 12px; border-radius: 8px; font-size: 12px; color: #7C3AED;">
                            ${resetUrl}
                        </p>
                        <hr style="border: none; border-top: 1px solid #3f3f46; margin: 30px 0;" />
                        <p style="color: #71717a; font-size: 12px; text-align: center;">
                            ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง<br/>
                            หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน สามารถเพิกเฉยอีเมลนี้ได้
                        </p>
                    </div>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`[Mail] Password reset email sent to ${to}`);
            return true;
        } catch (error) {
            console.error('[Mail] Failed to send email:', error);
            return false;
        }
    }
}
