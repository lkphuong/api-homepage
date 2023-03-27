import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationEntity } from './notification.entity';
import { LanguageEntity } from './language.entity';
import { RootEntity } from './root.entity';
import { LANGUAGE_DEFAULT } from '../constants';

@Entity('notification_languages')
export class NotificationLanguageEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => NotificationEntity,
    (notification) => notification.notification_languages,
  )
  @JoinColumn([
    {
      name: 'notification_id',
      referencedColumnName: 'id',
    },
  ])
  notification: NotificationEntity | null;

  @Column('uuid', {
    name: 'notification_id',
    nullable: false,
  })
  notification_id: string;

  @Column('varchar', {
    name: 'language_id',
    nullable: false,
  })
  language_id?: string = LANGUAGE_DEFAULT;

  @Column('varchar', {
    name: 'title',
    nullable: false,
    length: 255,
  })
  title: string;

  @Column('varchar', {
    name: 'slug',
    nullable: true,
    length: 500,
  })
  slug: string;

  @Column('varchar', {
    name: '_slug',
    nullable: true,
    length: 500,
  })
  _slug: string;

  language: LanguageEntity | null;
}
