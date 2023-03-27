import {
  isEmpty,
  isNumber,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function MinValidator(
  min: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'minValidator',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!isEmpty(value)) {
            if (!isNumber(value, { allowInfinity: false, allowNaN: false }))
              return false;
            return +value >= min;
          }

          return true;
        },
      },
    });
  };
}
