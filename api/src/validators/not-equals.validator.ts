import {
  isEmpty,
  isNumber,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function NotEqualsValidator(
  compared: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'NotEqualsValidator',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!isEmpty(value)) {
            if (!isNumber(value, { allowInfinity: false, allowNaN: false }))
              return false;
            return +value !== compared;
          }

          return true;
        },
      },
    });
  };
}
