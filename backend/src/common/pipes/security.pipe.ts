import {
    PipeTransform,
    Injectable,
    BadRequestException,
    ArgumentMetadata,
} from '@nestjs/common';
import { isSecureInput, isValidIdentifier } from '../constants';

/**
 * Pipe to validate that a param is a valid identifier (UUID, slug, or short code).
 * Also checks for security exploits like SQL injection and path traversal.
 */
@Injectable()
export class ValidateIdentifierPipe implements PipeTransform<string, string> {
    transform(value: string, metadata: ArgumentMetadata): string {
        if (!value || typeof value !== 'string') {
            throw new BadRequestException('Invalid identifier');
        }

        // Trim whitespace
        const trimmed = value.trim();

        // Check for security issues
        if (!isSecureInput(trimmed)) {
            throw new BadRequestException('Invalid characters in identifier');
        }

        // Validate format
        if (!isValidIdentifier(trimmed)) {
            throw new BadRequestException('Invalid identifier format');
        }

        return trimmed;
    }
}

/**
 * Pipe to sanitize and validate string input.
 * Checks for security exploits and optionally limits length.
 */
@Injectable()
export class SanitizeStringPipe implements PipeTransform<string, string> {
    constructor(private readonly maxLength?: number) { }

    transform(value: string, metadata: ArgumentMetadata): string {
        if (!value || typeof value !== 'string') {
            return value;
        }

        // Trim whitespace
        let sanitized = value.trim();

        // Check for security issues
        if (!isSecureInput(sanitized)) {
            throw new BadRequestException('Input contains invalid characters');
        }

        // Apply max length if specified
        if (this.maxLength && sanitized.length > this.maxLength) {
            sanitized = sanitized.substring(0, this.maxLength);
        }

        return sanitized;
    }
}
