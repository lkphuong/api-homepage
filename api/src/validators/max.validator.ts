import {
  isEmpty,
  isNumber,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function MaxValidator(
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'maxValidator',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!isEmpty(value)) {
            if (!isNumber(value, { allowInfinity: false, allowNaN: false }))
              return false;
            return +value <= max;
          }

          return true;
        },
      },
    });
  };
}
