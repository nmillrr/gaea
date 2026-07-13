import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { GroupMember } from "./GroupMember";

@Entity("groups")
export class Group {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 60 })
  name: string;

  /** The user who created the group. */
  @Column()
  owner_id: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "owner_id" })
  owner: User;

  @OneToMany(() => GroupMember, (gm) => gm.group)
  members: GroupMember[];
}
