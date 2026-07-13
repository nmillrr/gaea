import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User";
import { Group } from "./Group";

export enum GroupMemberRole {
  OWNER = "owner",
  MEMBER = "member",
}

@Entity("group_members")
export class GroupMember {
  @PrimaryColumn()
  group_id: string;

  @PrimaryColumn()
  user_id: string;

  @Column({
    type: "enum",
    enum: GroupMemberRole,
    default: GroupMemberRole.MEMBER,
  })
  role: GroupMemberRole;

  @CreateDateColumn()
  joined_at: Date;

  // Relations
  @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "group_id" })
  group: Group;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "user_id" })
  user: User;
}
