import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntityExtended extends BaseEntity {
  @PrimaryGeneratedColumn('identity')
  id: string;

  @Column({ nullable: false })
  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: false })
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: false })
  @DeleteDateColumn()
  deletedAt: Date;
}
