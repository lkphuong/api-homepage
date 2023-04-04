import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LANGUAGE_DEFAULT } from '../constants';
import { BannerEntity } from './banner.entity';
import { FileEntity } from './file.entity';
import { LanguageEntity } from './language.entity';
import { RootEntity } from './root.entity';

@Entity('banner_languages')
export class BannerLanguageEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BannerEntity, (banner) => banner.banner_languages)
  @JoinColumn([
    {
      name: 'banner_id',
      referencedColumnName: 'id',
    },
  ])
  banner: BannerEntity | null;

  @Column('uuid', {
    name: 'banner_id',
    nullable: false,
  })
  banner_id: string;

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
