import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum MarketingAnalyticsEvent {
  PAGE_VIEW = 'PAGE_VIEW',
  VIDEO_IMPRESSION = 'VIDEO_IMPRESSION',
  VIDEO_PLAY = 'VIDEO_PLAY',
  VIDEO_AUTOPLAY = 'VIDEO_AUTOPLAY',
  VIDEO_COMPLETE = 'VIDEO_COMPLETE',
}

@Entity('marketing_analytics_logs')
export class MarketingAnalyticsLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  page_key: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  video_key: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  visitor_id: string | null;

  @Column({
    type: 'enum',
    enum: MarketingAnalyticsEvent,
  })
  event_type: MarketingAnalyticsEvent;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;
}
