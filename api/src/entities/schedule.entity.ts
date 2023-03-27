import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RootEntity } from './root.entity';
import { ScheduleLanguageEntity } from './schedule_language.entity';

@Entity('schedules')
export class ScheduleEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('timestamp', {
    name: 'timeframe',
    nullable: false,
  })
  timeframe: string;

  @Column('boolean', {
    name: 'published',
    nullable: true,
    default: false,
  })
  published?: boolean = false;

  @OneToMany(() => ScheduleLanguageEntity, (schedule) => schedule.schedule)
  schedule_languages: ScheduleLanguageEntity[];
}
