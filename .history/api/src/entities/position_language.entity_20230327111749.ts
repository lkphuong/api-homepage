import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LanguageEntity } from './language.entity';
import { RootEntity } from './root.entity';
import { PositionEntity } from './position.entity';

import { LANGUAGE_DEFAULT } from '../constants';

@Entity('position_languages')
export class PositionLanguageEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PositionEntity, (position) => position.position_languages)
  @JoinColumn([
    {
      name: 'position_id',
      referencedColumnName: 'id',
    },
  ])
  position: PositionEntity | null;

  @Column('uuid', {
    name: 'position_id',
    nullable: false,
  })
  position_id: string;

  @Column('varchar', {
    name: 'language_id',
    nullable: false,
  })
  language_id?: string = LANGUAGE_DEFAULT;

  @Column('varchar', {
    name: 'name',
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

  language: LanguageEntity | null;
}
