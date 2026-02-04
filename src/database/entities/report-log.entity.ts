import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('report_logs')
export class ReportLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string; // SUCCESS | FAILED | RETRYING

  @Column()
  generatedAt: string;

  @Column({ type: 'bigint', nullable: true })
  result: string;

  @Column({ default: 0 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
