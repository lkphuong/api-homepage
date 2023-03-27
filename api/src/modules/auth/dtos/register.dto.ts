import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { generateValidationMessage } from '../../../utils';
import { IsBooleanValidator } from '../../../validators/boolean.validator';
import { LengthValidator } from '../../../validators/length.validator';

export class RegisterDto {
  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [tên đăng nhập].'),
  })
  @LengthValidator(1, 255, {
    message: (arg) =>
      generateValidationMessage(
        arg,
        '[Tên đăng nhập độ dài tối đa] độ dài tối đa 255 kí tự.',
      ),
  })
  username: string;

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
