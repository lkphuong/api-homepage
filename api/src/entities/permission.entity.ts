import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RootEntity } from './root.entity';
import { UserPermissionEntity } from './user_permission.entity';

@Entity('permissions')
export class PermissionEntity extends RootEntity {
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

  @OneToMany(
    () => UserPermissionEntity,
    (user_permissions) => user_permissions.permission,
  )
  user_permissions: UserPermissionEntity[];
}
