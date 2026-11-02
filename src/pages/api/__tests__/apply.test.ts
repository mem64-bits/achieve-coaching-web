import { describe, it, expect } from 'vitest';
import { validateEmail, validateAndCleanPhone, validateAndCleanInstagram } from '../apply';

describe('Apply API Validation Helpers', () => {
    describe('validateEmail', () => {
        it('validates correct email addresses', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name+tag@sub.domain.co.uk')).toBe(true);
        });

        it('invalidates malformed email addresses', () => {
            expect(validateEmail('plainstring')).toBe(false);
            expect(validateEmail('missing@domain')).toBe(false);
            expect(validateEmail('@missinguser.com')).toBe(false);
            expect(validateEmail('')).toBe(false);
        });
    });

    describe('validateAndCleanPhone', () => {
        it('validates and cleans correct international phone numbers', () => {
            const res1 = validateAndCleanPhone('+353 87 123 4567');
            expect(res1.isValid).toBe(true);
            expect(res1.cleanDigits).toBe('353871234567');

            const res2 = validateAndCleanPhone('+1 (555) 123-4567');
            expect(res2.isValid).toBe(true);
            expect(res2.cleanDigits).toBe('15551234567');
        });

        it('invalidates invalid or short phone numbers', () => {
            expect(validateAndCleanPhone('12345').isValid).toBe(false);
            expect(validateAndCleanPhone('').isValid).toBe(false);
        });
    });

    describe('validateAndCleanInstagram', () => {
        it('validates and extracts Instagram handles from usernames or URLs', () => {
            const res1 = validateAndCleanInstagram('@bobbyok_');
            expect(res1.isValid).toBe(true);
            expect(res1.handle).toBe('bobbyok_');
            expect(res1.url).toBe('https://instagram.com/bobbyok_');

            const res2 = validateAndCleanInstagram('https://instagram.com/bobbyok_/?igshid=abc');
            expect(res2.isValid).toBe(true);
            expect(res2.handle).toBe('bobbyok_');
            expect(res2.url).toBe('https://instagram.com/bobbyok_');

            const res3 = validateAndCleanInstagram('');
            expect(res3.isValid).toBe(true);
            expect(res3.handle).toBe('');
        });

        it('invalidates malformed Instagram handles', () => {
            expect(validateAndCleanInstagram('invalid user name!').isValid).toBe(false);
        });
    });
});
