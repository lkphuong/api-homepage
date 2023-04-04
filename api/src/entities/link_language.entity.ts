import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { RootEntity } from './root.entity';
import { LANGUAGE_DEFAULT } from '../constants';

@Entity('link_languages')
export class LinkLanguageEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    name: 'language_id',
    nullable: true,
  })
  language_id?: string = LANGUAGE_DEFAULT;

  @Column('varchar', {
    name: 'title',
    nullable: true,
    length: 255,
  })
  title: string;

  @Column('varchar', {
    name: 'url',
    nullable: true,
    length: 500,
  })
  url: string;
}
