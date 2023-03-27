import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { LANGUAGE_DEFAULT } from '../../../constants';
import { generateValidationMessage } from '../../../utils';
import { BetweenValidator } from '../../../validators/between.validator';

import { IsBooleanValidator } from '../../../validators/boolean.validator';
import { DateStringValidator } from '../../../validators/date.string.validator';
import { LengthValidator } from '../../../validators/length.validator';

export class UpdateScheduleDto {
  @IsOptional()
  @Transform((params) => params.value ?? false)
  @IsBooleanValidator({
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [published] không hợp lệ.'),
  })
  published?: boolean = false;

  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng chọn [thời gian diễn ra].'),
  })
  @DateStringValidator({
    message: (arg) =>
      generateValidationMessage(arg, '[Thời gian diễn ra] không hợp lệ.'),
  })
  timeframe: string;

  @IsOptional()
  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng chọn [ngôn ngữ].'),
  })
  @LengthValidator(1, 20, {
    message: (arg) =>
      generateValidationMessage(arg, '[Ngôn ngữ] độ dài tối đa 20 kí tự.'),
  })
  language_id?: string = LANGUAGE_DEFAULT;

  @IsOptional()
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng chọn [lịch công tác].'),
  })
  @IsUUID('all', {
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [lịch công tác] không hợp lệ.'),
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

  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [nội dung].'),
  })
  @LengthValidator(1, 500, {
    message: (arg) =>
      generateValidationMessage(
        arg,
        '[Nội dung độ dài tối đa] độ dài tối đa 500 kí tự.',
      ),
  })
  content: string;

  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [địa điểm].'),
  })
  @LengthValidator(1, 500, {
    message: (arg) =>
      generateValidationMessage(
        arg,
        '[Địa điểm độ dài tối đa] độ dài tối đa 500 kí tự.',
      ),
  })
  location: string;

  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [thành phần tham dự].'),
  })
  @LengthValidator(1, 500, {
    message: (arg) =>
      generateValidationMessage(
        arg,
        '[Thành phần tham dự độ dài tối đa] độ dài tối đa 500 kí tự.',
      ),
  })
  attendee: string;

  @IsOptional()
  @Transform((params) => params.value ?? 0)
  @BetweenValidator(0, 1, {
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [deleted] không hợp lệ.'),
  })
  deleted?: number = 0;
}
