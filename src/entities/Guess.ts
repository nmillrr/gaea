import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Photo } from "./Photo";

@Entity("guesses")
export class Guess {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  photo_id: string;

  @Column()
  user_id: string;

  @Column("float")
  guess_lat: number;

  @Column("float")
  guess_lng: number;

  @Column("float")
  distance_meters: number;

  @Column("integer")
  points: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Photo, (photo) => photo.guesses)
  @JoinColumn({ name: "photo_id" })
  photo: Photo;

  @ManyToOne(() => User, (user) => user.guesses)
  @JoinColumn({ name: "user_id" })
  user: User;
}