import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RootEntity } from './root.entity';
import { UserPermissionEntity } from './user_permission.entity';

@Entity('users')
export class UserEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    name: 'username',
    length: 255,
    nullable: false,
  })
  username: string;

  @Column('varchar', {
    name: 'password',
    length: 500,
    nullable: false,
  })
  password: string;

  @OneToMany(
    () => UserPermissionEntity,
    (user_permissions) => user_permissions.permission,
  )
  user_permissions: UserPermissionEntity[];
}
