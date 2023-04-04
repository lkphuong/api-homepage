import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RootEntity } from './root.entity';

@Entity('contents')
export class ContentEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    name: 'source_id',
    nullable: true,
  })
  source_id: string;

  @Column('varchar', {
    name: 'content',
    nullable: false,
  })
  content: string;
}
