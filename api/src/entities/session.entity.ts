import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RootEntity } from './root.entity';

@Entity('sessions')
export class SessionEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    name: 'user_id',
    nullable: false,
    default: 0,
  })
  user_id: string;

  @Column('varchar', {
    name: 'username',
    nullable: false,
    length: 255,
  })
  username: string;

  @Column('varchar', {
    name: 'access_token',
    nullable: true,
    default: 0,
    length: 500,
  })
  access_token: string;

  @Column('varchar', {
    name: 'refresh_token',
    nullable: true,
    default: 0,
    length: 500,
  })
  refresh_token: string;

  @Column('timestamp without time zone', {
    name: 'login_time',
    nullable: false,
  })
  login_time: Date;

  @Column('timestamp without time zone', {
    name: 'expired_time',
    nullable: true,
  })
  expired_time: Date;

  @Column('timestamp without time zone', {
    name: 'logout_time',
    nullable: true,
  })
  logout_time: Date;
}
