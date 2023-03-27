import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { RootEntity } from './root.entity';
import { UserEntity } from './user.entity';

@Entity('user_permissions')
export class UserPermissionEntity extends RootEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => PermissionEntity,
    (permission) => permission.user_permissions,
  )
  @JoinColumn([
    {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  ])
  permission: PermissionEntity | null;

  @Column('uuid', {
    name: 'permission_id',
    nullable: false,
  })
  permission_id: string;

  @ManyToOne(() => UserEntity, (user) => user.user_permissions)
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  ])
  user: UserEntity | null;

  @Column('uuid', {
    name: 'user_id',
    nullable: false,
  })
  user_id: string;
}
