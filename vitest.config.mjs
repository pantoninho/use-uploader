import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environmentMatchGlobs: [['tests/index.test.js', 'jsdom']],
        coverage: {
            reporter: ['text', 'lcov'],
            reportsDirectory: './coverage',
            include: ['index.js', 'lib/**/*.js'],
        },
    },
});
