import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

// QRCode 实体：用于保存每一个生成的 QR 记录（属于某ผู้ใช้หนึ่งคน）
@Entity('qr_codes')
export class QRCode {
  @PrimaryGeneratedColumn()
  id: number;

  // 拥有者用户 ID（多租户隔离ตาม user）
  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // ชื่อเรียก QR ในระบบ (เช่น “QR หน้าโปรโมชันก.พ.”)
  @Column({ length: 255 })
  name: string;

  // ประเภท QR: landing_page / form / external_url
  @Column({ length: 50 })
  qr_type: string;

  // target_id: ถ้าเป็น landing_page หรือ form สามารถเก็บ id เอาไว้ผูกย้อนกลับ
  @Column({ type: 'int', nullable: true })
  target_id?: number | null;

  // target_url: ลิงก์ปลายทางจริงที่จะถูกฝังใน QR
  @Column({ length: 500 })
  target_url: string;

  // qr_data: ที่เก็บข้อมูลรูปแบบ URL ของภาพ QR (เช่น ลิงก์ไปยังบริการสร้าง QR)
  @Column({ type: 'text' })
  qr_data: string;

  // ขนาด (small / medium / large)
  @Column({ length: 20, default: 'medium' })
  size: string;

  // นับจำนวนการสแกนเบื้องต้น
  @Column({ type: 'int', default: 0 })
  scan_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

