import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PositionLanguageEntity } from './position_language.entity';
import { RootEntity } from './root.entity';

@Entity('positions')
export class PositionEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('boolean', {
    name: 'published',
    nullable: true,
    default: false,
  })
  published?: boolean = false;

  @OneToMany(
    () => PositionLanguageEntity,
    (position_languages) => position_languages.position,
  )
  position_languages: PositionLanguageEntity[];
}
