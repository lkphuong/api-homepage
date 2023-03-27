import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LANGUAGE_DEFAULT } from '../constants';
import { EmployeeEntity } from './employee.entity';
import { FileEntity } from './file.entity';
import { LanguageEntity } from './language.entity';
import { RootEntity } from './root.entity';

@Entity('employee_languages')
export class EmployeeLanguageEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EmployeeEntity, (employee) => employee.employee_languages)
  @JoinColumn([
    {
      name: 'employee_id',
      referencedColumnName: 'id',
    },
  ])
  employee: EmployeeEntity | null;

  @Column('uuid', {
    name: 'employee_id',
    nullable: false,
  })
  employee_id: string;

  @Column('varchar', {
    name: 'name',
    nullable: false,
    length: 255,
  })
  name: string;

  @Column('varchar', {
    name: 'slug',
    nullable: true,
    length: 500,
  })
  slug: string;

  @Column('varchar', {
    name: 'academic_degree',
    nullable: true,
    length: 500,
  })
  academic_degree: string;

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
