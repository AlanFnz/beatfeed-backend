import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  eventId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  location: string;

  @Column({ name: 'cover_image', nullable: true })
  @IsString()
  @IsOptional()
  coverImage: string;

  @Column({ name: 'going_count', default: 0 })
  @IsNumber()
  @Min(0)
  goingCount: number;

  @Column({ name: 'likes_count', default: 0 })
  @IsNumber()
  @Min(0)
  likesCount: number;

  @Column({ name: 'comments_count', default: 0 })
  @IsNumber()
  @Min(0)
  commentsCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
