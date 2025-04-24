import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Photo } from "./Photo";
import { Guess } from "./Guess";
import { Comment } from "./Comment";
import { Friendship } from "./Friendship";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  avatar_url: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Photo, (photo) => photo.user)
  photos: Photo[];

  @OneToMany(() => Guess, (guess) => guess.user)
  guesses: Guess[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Friendship, (friendship) => friendship.user)
  friendships: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.friend)
  friendOf: Friendship[];
}