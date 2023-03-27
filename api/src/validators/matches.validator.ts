import {
  isEmpty,
  matches,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function RegexValidator(
  regex: RegExp,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'regexValidator',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!isEmpty(value)) return matches(value, regex);
          return true;
        },
      },
    });
  };
}
