import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventLanguageEntity } from './event_language.entity';

import { RootEntity } from './root.entity';

@Entity('events')
export class EventEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date', {
    name: 'start_date',
    nullable: false,
  })
  start_date: Date;

  @Column('date', {
    name: 'end_date',
    nullable: false,
  })
  end_date: Date;

  @Column('boolean', {
    name: 'published',
    nullable: true,
    default: false,
  })
  published?: boolean = false;

  @OneToMany(
    () => EventLanguageEntity,
    (event_languages) => event_languages.event,
  )
  event_languages: EventLanguageEntity[];
}
