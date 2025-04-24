import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
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

  // Relations
  @ManyToOne(() => Photo, (photo) => photo.comments)
  @JoinColumn({ name: "photo_id" })
  photo: Photo;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: "user_id" })
  user: User;
}