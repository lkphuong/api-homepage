import { isEmpty, registerDecorator, ValidationOptions } from 'class-validator';

export function LengthValidator(
  min: number,
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'lengthValidator',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!isEmpty(value)) {
            if (typeof value === 'string' || value instanceof String) {
              return value.length >= min && value.length <= max;
            }

            return true;
          }

          return true;
        },
      },
    });
  };
}
