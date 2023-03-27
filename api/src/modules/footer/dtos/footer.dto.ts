import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { LANGUAGE_DEFAULT } from '../../../constants';
import { generateValidationMessage } from '../../../utils';
import { LengthValidator } from '../../../validators/length.validator';

export class FooterDto {
  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [nội dung].'),
  })
  content: string;

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
}
