import {
  isEmpty,
  isNumber,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function IsNumberValidator(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isNumberValidator',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!isEmpty(value))
            return isNumber(value, { allowInfinity: false, allowNaN: false });
          return true;
        },
      },
    });
  };
}
