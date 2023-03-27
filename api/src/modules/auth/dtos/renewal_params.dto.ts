import { IsNotEmpty } from 'class-validator';
import { generateValidationMessage } from '../../../utils';

export class RenewalParamsDto {
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [refresh_token].'),
  })
  refresh_token: string;
}
