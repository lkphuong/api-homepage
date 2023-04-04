import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ScheduleEntity } from './schedule.entity';
import { RootEntity } from './root.entity';
import { LANGUAGE_DEFAULT } from '../constants';

@Entity('schedule_languages')
export class ScheduleLanguageEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ScheduleEntity, (schedule) => schedule.schedule_languages)
  @JoinColumn([
    {
      name: 'schedule_id',
      referencedColumnName: 'id',
    },
  ])
  schedule: ScheduleEntity | null;

  @Column('uuid', {
    name: 'schedule_id',
    nullable: false,
  })
  schedule_id: string;

  @Column('varchar', {
    name: 'title',
    nullable: false,
    length: 255,
  })
  title: string;

  @Column('varchar', {
    name: 'slug',
    nullable: true,
    length: 255,
  })
  slug: string;

  @Column('varchar', {
    name: 'content',
    nullable: false,
  })
  content: string;

  @Column('varchar', {
    name: 'location',
    nullable: true,
    length: 500,
  })
  location: string; // Địa điểm tham dự

  @Column('varchar', {
    name: 'attendee',
    nullable: true,
    length: 500,
  })
  attendee: string; // Thành phần tham dự

  @Column('varchar', {
    name: 'language_id',
    nullable: false,
  })
  language_id?: string = LANGUAGE_DEFAULT;
}
