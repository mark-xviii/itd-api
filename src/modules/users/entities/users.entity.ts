import { RolesEnum } from 'src/enums/roles.enum';
import { SessionsEntity } from 'src/modules/sessions/entities/sessions.entity';
import Utils from 'src/utils';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class UsersEntity extends Utils.DatabaseEntities.BaseEntityExtended {
  @Column({ unique: true, nullable: false })
  login: string;

  @Column({ nullable: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: RolesEnum })
  role: RolesEnum;

  @Column({ nullable: true })
  organizationTitle: string;

  @Column({ nullable: true, type: 'int', default: 0 })
  maxScoreRecord: number;

  @OneToMany(() => SessionsEntity, (session) => session.user)
  sessions: SessionsEntity[];
}
