import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BannerLanguageEntity } from './banner_language.entity';
import { RootEntity } from './root.entity';

@Entity('banners')
export class BannerEntity extends RootEntity {
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

  @OneToMany(() => BannerLanguageEntity, (banner) => banner.banner)
  banner_languages: BannerLanguageEntity[];
}
