import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { RootEntity } from './root.entity';

@Entity('languages')
export class LanguageEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    name: 'code',
    length: 20,
    nullable: false,
  })
  code: string;

  @Column('varchar', {
    name: 'name',
    length: 255,
    nullable: false,
  })
  name: string;

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

  @Column('boolean', {
    name: 'published',
    nullable: true,
    default: false,
  })
  published?: boolean = false;
}
