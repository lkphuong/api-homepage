import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { LANGUAGE_DEFAULT } from '../../../constants';
import { generateValidationMessage } from '../../../utils';
import { IsBooleanValidator } from '../../../validators/boolean.validator';
import { LengthValidator } from '../../../validators/length.validator';

export class CreateEmployeeDto {
  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [tên nhân sự].'),
  })
  @LengthValidator(1, 255, {
    message: (arg) =>
      generateValidationMessage(arg, '[Tên nhân sự] độ dài tối đa 255 kí tự.'),
  })
  name: string;

  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng chọn [hình ảnh].'),
  })
  @IsUUID('all', {
    message: (arg) =>
      generateValidationMessage(arg, '[Hình ảnh] không hợp lệ.'),
  })
  file_id: string;

  @IsOptional()
  @Transform((params) => params.value ?? false)
  @IsBooleanValidator({
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [published] không hợp lệ.'),
  })
  published?: boolean = false;

  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [học vị].'),
  })
  @LengthValidator(1, 255, {
    message: (arg) =>
      generateValidationMessage(arg, '[Học vị] có độ dài tối đa 255 kí tự.'),
  })
  academic_degree: string;

  @IsOptional()
  @Transform((params) => params.value ?? false)
  @IsBooleanValidator({
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [active] không hợp lệ.'),
  })
  active?: boolean = true;

  @IsOptional()
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng chọn [ngôn ngữ].'),
  })
  language_id?: string = LANGUAGE_DEFAULT;
}
