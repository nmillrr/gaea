import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { Guess } from "./Guess";
import { Comment } from "./Comment";

@Entity("photos")
export class Photo {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  user_id: string;

  @Column()
  s3_key: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  caption: string | null;

  @Column("float")
  latitude: number;

  @Column("float")
  longitude: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.photos)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Guess, (guess) => guess.photo)
  guesses: Guess[];

  @OneToMany(() => Comment, (comment) => comment.photo)
  comments: Comment[];
}