import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { LANGUAGE_DEFAULT } from '../../../constants';
import { generateValidationMessage } from '../../../utils';
import { IsBooleanValidator } from '../../../validators/boolean.validator';
import { DateStringValidator } from '../../../validators/date.string.validator';
import { LengthValidator } from '../../../validators/length.validator';

export class CreateScheduleDto {
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
  @Transform((params) => params.value ?? false)
  @IsBooleanValidator({
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [published] không hợp lệ.'),
  })
  published?: boolean = false;

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
