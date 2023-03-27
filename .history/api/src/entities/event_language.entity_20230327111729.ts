import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LANGUAGE_DEFAULT } from '../constants';
import { EventEntity } from './event.entity';
import { FileEntity } from './file.entity';
import { LanguageEntity } from './language.entity';
import { RootEntity } from './root.entity';

@Entity('event_languages')
export class EventLanguageEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EventEntity, (event) => event.event_languages)
  @JoinColumn([
    {
      name: 'event_id',
      referencedColumnName: 'id',
    },
  ])
  event: EventEntity | null;

  @Column('uuid', {
    name: 'event_id',
    nullable: false,
  })
  event_id: string;

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

  @Column('uuid', {
    name: 'file_id',
    nullable: false,
  })
  file_id: string;

  @Column('varchar', {
    name: 'language_id',
    nullable: false,
  })
  language_id?: string = LANGUAGE_DEFAULT;

  file: FileEntity | null;

  language: LanguageEntity | null;
}
