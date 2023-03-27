import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { generateValidationMessage } from '../../../utils';
import { IsBooleanValidator } from '../../../validators/boolean.validator';
import { LengthValidator } from '../../../validators/length.validator';

export class CreateNotificationDto {
  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [tiêu đề].'),
  })
  @LengthValidator(1, 255, {
    message: (arg) =>
      generateValidationMessage(arg, '[Tiêu đề] độ dài tối đa 255 kí tự.'),
  })
  title: string;

  @IsOptional()
  @Transform((params) => params.value ?? false)
  @IsBooleanValidator({
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [published] không hợp lệ.'),
  })
  published?: boolean = false;
}
