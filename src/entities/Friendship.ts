import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { User } from "./User";

export enum FriendshipStatus {
  PENDING = "pending",
  ACCEPTED = "accepted"
}

@Entity("friendships")
export class Friendship {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  friend_id: string;

  @Column({
    type: "enum",
    enum: FriendshipStatus,
    default: FriendshipStatus.PENDING
  })
  status: FriendshipStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.friendships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => User, (user) => user.friendOf, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "friend_id" })
  friend: User;
}