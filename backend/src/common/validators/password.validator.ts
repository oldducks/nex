import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isStrongPassword',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
                ...validationOptions,
            },
            validator: {
                validate(value: string) {
                    if (!value) return false;
                    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
                    return regex.test(value);
                },
            },
        });
    };
}

export function IsBasicPassword(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isBasicPassword',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: 'Password must be at least 4 characters and contain only letters or numbers',
                ...validationOptions,
            },
            validator: {
                validate(value: string) {
                    if (!value) return false;
                    const regex = /^[A-Za-z0-9]{4,}$/;
                    return regex.test(value);
                },
            },
        });
    };
}
