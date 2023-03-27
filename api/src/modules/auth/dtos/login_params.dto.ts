import { IsNotEmpty } from 'class-validator';
import { generateValidationMessage } from '../../../utils';

export class LoginParamsDto {
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [username].'),
  })
  username: string;

  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [password].'),
  })
  password: string;
}
