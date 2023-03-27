import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EmployeeLanguageEntity } from './employee_language.entity';
import { RootEntity } from './root.entity';

@Entity('employees')
export class EmployeeEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('boolean', {
    name: 'published',
    nullable: true,
    default: false,
  })
  published?: boolean = false;

  @OneToMany(
    () => EmployeeLanguageEntity,
    (employee_languages) => employee_languages.employee,
  )
  employee_languages: EmployeeLanguageEntity[];
}
