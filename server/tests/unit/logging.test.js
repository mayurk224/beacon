import { redactUrl } from '../../utils/logger.js';

describe('Logging Security Verification', () => {
    test('redactUrl should redact sensitive query parameters', () => {
        const sensitiveUrls = [
            '/api/auth/verify-email?token=abcdef123456',
            '/api/auth/reset-password?token=secret-token-789',
            '/api/auth/callback?code=google-code-xyz&state=some-state',
            '/login?password=mysecretpassword123'
        ];

        sensitiveUrls.forEach(url => {
            const result = redactUrl(url);
            
            expect(result).not.toContain('abcdef123456');
            expect(result).not.toContain('secret-token-789');
            expect(result).not.toContain('google-code-xyz');
            expect(result).not.toContain('mysecretpassword123');
            expect(result).toContain('REDACTED');
        });
    });

    test('redactUrl should preserve non-sensitive parameters', () => {
        const url = '/search?q=beacon&page=1';
        const result = redactUrl(url);

        expect(result).toContain('q=beacon');
        expect(result).toContain('page=1');
        expect(result).not.toContain('REDACTED');
    });

    test('redactUrl should handle URLs without parameters', () => {
        const url = '/api/health';
        const result = redactUrl(url);
        expect(result).toBe('/api/health');
    });
});
