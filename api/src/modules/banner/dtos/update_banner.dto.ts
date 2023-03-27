import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { generateValidationMessage } from '../../../utils';
import { BetweenValidator } from '../../../validators/between.validator';

import { IsBooleanValidator } from '../../../validators/boolean.validator';
import { DateStringValidator } from '../../../validators/date.string.validator';
import { LengthValidator } from '../../../validators/length.validator';

export class UpdateBannerDto {
  @IsOptional()
  @Transform((params) => params.value ?? false)
  @IsBooleanValidator({
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [published] không hợp lệ.'),
  })
  published?: boolean = false;

  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [ngày bắt đầu].'),
  })
  @DateStringValidator({
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [ngày bắt đầu] không hợp lệ.'),
  })
  start_date: string;

  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [ngày kết thúc].'),
  })
  @DateStringValidator({
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [ngày kết thúc] không hợp lệ.'),
  })
  end_date: string;

  @IsOptional()
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng chọn [banner].'),
  })
  @IsUUID('all', {
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [banner] không hợp lệ.'),
  })
  id: string;

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
  @Transform((params) => params.value ?? 0)
  @BetweenValidator(0, 1, {
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [deleted] không hợp lệ.'),
  })
  deleted?: number = 0;
}
