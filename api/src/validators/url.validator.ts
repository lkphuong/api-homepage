import {
  isEmpty,
  isURL,
  registerDecorator,
  type ValidationOptions,
} from 'class-validator';

export function IsUrlValidator(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'urlValidator',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!isEmpty(value)) return isURL(value, {});
          return true;
        },
      },
    });
  };
}
