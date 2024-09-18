import { describe, expect, it, vi } from 'vitest';
import { concurrent } from '../../lib/concurrent.js';

describe('lib/concurrent', () => {
    it('should return an array of the job results in the same order', async () => {
        const jobs = [
            async () => 1,
            async () => 2,
            async () => 3,
            async () => 4,
            async () => 5,
            async () => 6,
            async () => 7,
            async () => 8,
            async () => 9,
        ];

        const results = await concurrent({ threads: 10, jobs });
        expect(results).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should not exceed the thread limit', { timeout: 10000 }, async () => {
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const jobs = [
            vi.fn(() => wait(1000)),
            vi.fn(() => wait(2000)),
            vi.fn(() => wait(3000)),
            vi.fn(() => wait(4000)),
        ];

        const resultsPromise = concurrent({ threads: 2, jobs });

        expect(jobs[0]).toHaveBeenCalled();
        expect(jobs[1]).toHaveBeenCalled();
        expect(jobs[2]).not.toHaveBeenCalled();
        expect(jobs[3]).not.toHaveBeenCalled();

        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(jobs[2]).toHaveBeenCalled();
        expect(jobs[3]).not.toHaveBeenCalled();

        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(jobs[3]).toHaveBeenCalled();

        await resultsPromise;
    });
});
