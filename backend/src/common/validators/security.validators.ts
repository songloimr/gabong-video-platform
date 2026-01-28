import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { isSecureInput, isValidIdentifier } from '../constants';

/**
 * Custom validator to check for security exploits in input.
 */
@ValidatorConstraint({ name: 'isSecure', async: false })
export class IsSecureConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments): boolean {
        if (!value || typeof value !== 'string') {
            return true; // Let other validators handle empty values
        }
        return isSecureInput(value);
    }

    defaultMessage(args: ValidationArguments): string {
        return 'Input contains potentially dangerous characters';
    }
}

/**
 * Custom validator to check if value is a valid identifier (UUID or slug).
 */
@ValidatorConstraint({ name: 'isValidIdentifier', async: false })
export class IsValidIdentifierConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments): boolean {
        if (!value || typeof value !== 'string') {
            return true;
        }
        return isValidIdentifier(value);
    }

    defaultMessage(args: ValidationArguments): string {
        return 'Invalid identifier format';
    }
}

/**
 * Decorator to validate that input is secure (no SQL injection, XSS, etc.).
 */
export function IsSecure(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsSecureConstraint,
        });
    };
}

/**
 * Decorator to validate that input is a valid identifier.
 */
export function IsValidId(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidIdentifierConstraint,
        });
    };
}
