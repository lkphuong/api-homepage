import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ContentEntity } from './content.entity';
import { RootEntity } from './root.entity';

@Entity('footer_languages')
export class FooterLanguageEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    name: 'language_id',
    nullable: false,
  })
  language_id: string;

  content: ContentEntity | null;
}
