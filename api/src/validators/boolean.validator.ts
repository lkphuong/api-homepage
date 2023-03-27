import {
  isBoolean,
  isEmpty,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function IsBooleanValidator(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isBooleanValidator',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!isEmpty(value)) return isBoolean(value);
          return true;
        },
      },
    });
  };
}
