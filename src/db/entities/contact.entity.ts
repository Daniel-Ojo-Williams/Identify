import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'Contact' })
export class Contact {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ nullable: true })
  phoneNumber?: string

  @Column({ nullable: true })
  email?: string

  @ManyToOne(() => Contact)
  @JoinColumn({ name: 'linkedId' })
  linkedId?: number

  @Column({ type: 'enum', enum: ["secondary", "primary"] })
  linkPrecedence!: "secondary" | "primary";

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'NOW()' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'NOW()' })
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true, type: 'timestamp with time zone' })
  deletedAt?: Date;
}
