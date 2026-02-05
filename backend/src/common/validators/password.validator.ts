import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isStrongPassword',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
                ...validationOptions,
            },
            validator: {
                validate(value: string) {
                    if (!value) return false;
                    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
                    return regex.test(value);
                },
            },
        });
    };
}
