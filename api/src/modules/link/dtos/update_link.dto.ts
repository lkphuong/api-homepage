import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { generateValidationMessage } from '../../../utils';
import { LengthValidator } from '../../../validators/length.validator';
import { IsUrlValidator } from '../../../validators/url.validator';

export class LinkItemDto {
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng chọn [sự kiện].'),
  })
  @IsUUID('all', {
    message: (arg) =>
      generateValidationMessage(arg, 'Giá trị [sự kiện] không hợp lệ.'),
  })
  id: string;

  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng chọn [liên kết].'),
  })
  @IsUrlValidator({
    message: (arg) =>
      generateValidationMessage(arg, '[Liên kết] không hợp lệ.'),
  })
  @LengthValidator(1, 500, {
    message: (arg) =>
      generateValidationMessage(arg, '[Liên kết] độ dài tối đa 500 kí tự.'),
  })
  url: string;
}

export class LinksDto {
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, '[Liên kết] không được để trống.'),
  })
  @ValidateNested({ each: true })
  @Type(() => LinkItemDto)
  links: LinkItemDto[];
}
