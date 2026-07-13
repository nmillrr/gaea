import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Photo } from "./Photo";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  photo_id: string;

  @Column()
  user_id: string;

  @Column("text")
  text: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Photo, (photo) => photo.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "photo_id" })
  photo: Photo;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "user_id" })
  user: User;
}