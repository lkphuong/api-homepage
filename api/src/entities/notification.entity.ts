import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { NotificationLanguageEntity } from './notification_language.entity';
import { RootEntity } from './root.entity';

@Entity('notifications')
export class NotificationEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('boolean', {
    name: 'published',
    nullable: true,
    default: false,
  })
  published?: boolean = false;

  @OneToMany(
    () => NotificationLanguageEntity,
    (notification_languages) => notification_languages.notification,
  )
  notification_languages: NotificationLanguageEntity[];
}
