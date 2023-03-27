import {
  isEmail,
  isEmpty,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function EmailValidator(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'emailValidator',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!isEmpty(value)) return isEmail(value, {});
          return true;
        },
      },
    });
  };
}
