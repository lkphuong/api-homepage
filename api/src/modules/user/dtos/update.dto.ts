import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { generateValidationMessage } from '../../../utils';
import { BetweenValidator } from '../../../validators/between.validator';
import { IsBooleanValidator } from '../../../validators/boolean.validator';
import { LengthValidator } from '../../../validators/length.validator';

export class PermissionDto {
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng upload file [minh chứng].'),
  })
  @IsUUID('all', {
    message: (arg) =>
      generateValidationMessage(arg, '[Tính năng truy cập] không tồn tại.'),
  })
  id: string;

  @IsOptional()
  @Transform((params) => params.value ?? 0)
  @BetweenValidator(0, 1, {
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [deleted] không hợp lệ.'),
  })
  deleted?: number = 0;
}

export class UpdateUserDto {
  @IsOptional()
  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [mật khẩu].'),
  })
  @LengthValidator(1, 100, {
    message: (arg) =>
      generateValidationMessage(
        arg,
        '[Mật khẩu độ dài tối đa] độ dài tối đa 100 kí tự.',
      ),
  })
  password: string;

  @IsOptional()
  @Transform((params) => params.value ?? false)
  @IsBooleanValidator({
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [active] không hợp lệ.'),
  })
  active?: boolean = true;

  @IsOptional()
  @ArrayNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng chọn [tính năng truy cập].'),
  })
  @IsUUID('all', {
    each: true,
    message: (arg) =>
      generateValidationMessage(arg, '[Tính năng truy cập] không tồn tại.'),
  })
  permissions: string[];
}
