import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { RootEntity } from './root.entity';

@Entity('files')
export class FileEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    name: 'original_name',
    nullable: false,
    length: 500,
  })
  originalName: string;

  @Column('varchar', {
    name: 'file_name',
    nullable: false,
    length: 500,
  })
  fileName: string;

  @Column('varchar', {
    name: 'path',
    nullable: false,
    length: 500,
  })
  path: string;

  @Column('varchar', {
    name: 'url',
    nullable: false,
    length: 500,
  })
  url: string;

  @Column('varchar', {
    name: 'extension',
    nullable: false,
    length: 50,
  })
  extension: string;

  @Column('boolean', {
    name: 'drafted',
    nullable: true,
    default: true,
  })
  drafted?: boolean = true;
}
