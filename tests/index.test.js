import { renderHook } from '@testing-library/react';
import { useUploader } from '../index.js';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
    ...[
        http.put('https://upload.example/error', () => {
            return HttpResponse.error('Failed to upload');
        }),
        http.put('https://upload.example/*', ({ request }) => {
            return HttpResponse.text(request.url);
        }),
    ],
);
const buffer = new ArrayBuffer(1024 * 1024 * 10);
const file = new File([buffer], 'test.png');

describe('useUploader', () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('should be able to upload a single file and provide the response', async () => {
        const URL = 'https://upload.example/';

        const { result: hook, rerender } = renderHook(() => useUploader());
        await hook.current.upload({ file, to: URL });
        rerender();

        while (!hook.current.uploads[file.name][URL].data) {
            rerender();
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const state = hook.current.uploads[file.name][URL];
        expect(state.progress).toBe(1);
        expect(state.data).toBe(URL);
        expect(state.error).toBeNull();
        expect(state.isUploading).toBe(false);
    });

    it('should be able to upload multiple files concurrently', async () => {
        const requests = [
            { file, to: 'https://upload.example/1' },
            { file, to: 'https://upload.example/2' },
            { file, to: 'https://upload.example/3' },
            { file, to: 'https://upload.example/4' },
            { file, to: 'https://upload.example/5' },
        ];

        const { result: hook, rerender } = renderHook(() => useUploader());
        await hook.current.upload(requests);
        rerender();

        while (hook.current.isUploading) {
            rerender();
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        requests.forEach((r) => {
            expect(hook.current.uploads[r.file.name][r.to].progress).toBe(1);
            expect(hook.current.uploads[r.file.name][r.to].data).toBe(r.to);
        });
    });

    it('should gracefully handle errors', async () => {
        const requests = [
            { file, to: 'https://upload.example/1' },
            { file, to: 'https://upload.example/2' },
            { file, to: 'https://upload.example/error' },
            { file, to: 'https://upload.example/4' },
            { file, to: 'https://upload.example/5' },
        ];

        const { result: hook, rerender } = renderHook(() => useUploader());

        await hook.current.upload(requests);
        rerender();

        while (hook.current.isUploading) {
            rerender();
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // check that one upload had error but others were successful
        requests.forEach((r) => {
            if (r.to === 'https://upload.example/error') {
                expect(
                    hook.current.uploads[r.file.name][r.to].error,
                ).toBeTruthy();
            } else {
                expect(hook.current.uploads[r.file.name][r.to].progress).toBe(
                    1,
                );
                expect(hook.current.uploads[r.file.name][r.to].data).toBe(r.to);
            }
        });
    });

    it('should respect number of threads', async () => {
        const requests = [
            { file, to: 'https://upload.example/1' },
            { file, to: 'https://upload.example/2' },
            { file, to: 'https://upload.example/3' },
            { file, to: 'https://upload.example/4' },
            { file, to: 'https://upload.example/5' },
            { file, to: 'https://upload.example/6' },
            { file, to: 'https://upload.example/7' },
            { file, to: 'https://upload.example/8' },
        ];

        const { result, rerender } = renderHook(() =>
            useUploader({ threads: 2 }),
        );

        result.current.upload(requests);
        rerender();

        const isUploading = (request) =>
            result.current.uploads[request.file.name][request.to].isUploading;

        // at most 2 uploads should be active at any time
        while (result.current.isUploading) {
            const numberOfActiveUploads = requests.filter(isUploading).length;
            expect(numberOfActiveUploads).toBeLessThanOrEqual(2);
            rerender();
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    });
});
