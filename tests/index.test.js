import { renderHook } from '@testing-library/react';
import { useUploader } from '../index.js';
import { describe, expect, it, vi } from 'vitest';

const buffer = new ArrayBuffer(1024 * 1024 * 10);
const file = new File([buffer], 'test.png');

describe('useUploader', () => {
    it('should be able to upload a single file and provide the response', async () => {
        const URL = 'https://upload.example/';
        const uploadChunk = vi.fn(({ url }) => url);

        const { result: hook, rerender } = renderHook(() =>
            useUploader({ uploadChunk }),
        );
        await hook.current.upload({ file, to: URL });

        expect(uploadChunk).toHaveBeenCalledWith({
            chunk: file,
            url: URL,
            onProgress: expect.any(Function),
        });

        rerender();
        const state = hook.current.state.uploads[file.name];
        expect(state.data).toBe(URL);
        expect(state.error).toBeFalsy();
    });

    it('should be able to upload multiple chunks in parallel and provide results in order', async () => {
        const URLS = [
            'https://upload.example/part/1',
            'https://upload.example/part/2',
            'https://upload.example/part/3',
            'https://upload.example/part/4',
            'https://upload.example/part/5',
        ];

        const uploadChunk = vi.fn(async ({ url }) => {
            await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 1000),
            );

            return url;
        });

        const { result: hook, rerender } = renderHook(() =>
            useUploader({ threads: 2, uploadChunk }),
        );

        await hook.current.upload({ file, to: URLS });

        URLS.forEach((url, i) => {
            expect(uploadChunk.mock.calls[i]).toEqual([
                {
                    chunk: expect.any(Blob),
                    url,
                    onProgress: expect.any(Function),
                },
            ]);
        });

        rerender();
        const state = hook.current.state.uploads[file.name];
        expect(state.data).toEqual(URLS);
        expect(uploadChunk).toHaveBeenCalledTimes(URLS.length);
    });

    it('should handle errors', async () => {
        const URLS = [
            'https://upload.example/part/1',
            'https://upload.example/part/2',
            'https://upload.example/part/3',
            'https://upload.example/part/4',
            'https://upload.example/part/5',
        ];
        const error = new Error('Failed to upload');

        const uploadChunk = vi.fn(async ({ url }) => {
            await new Promise((resolve) =>
                setTimeout(resolve, Math.random() * 1000),
            );

            // force failure on the third URL
            if (url === URLS[2]) {
                throw error;
            }

            return url;
        });

        const { result: hook, rerender } = renderHook(() =>
            useUploader({ threads: 2, uploadChunk }),
        );

        await hook.current.upload({ file, to: URLS });

        rerender();
        const state = hook.current.state.uploads[file.name];
        expect(state.error).toBe(error);
        expect(state.data).toBeFalsy();
    });

    it('should provide per-file progress indicator', async () => {
        const URLS = [
            'https://upload.example/part/1',
            'https://upload.example/part/2',
            'https://upload.example/part/3',
            'https://upload.example/part/4',
            'https://upload.example/part/5',
        ];

        const uploadChunk = vi.fn(async ({ url, onProgress }) => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            onProgress({ loaded: 1024 * 1024 * 2, total: 1024 * 1024 * 2 });
            return url;
        });

        const { result, rerender } = renderHook(() =>
            useUploader({ threads: 2, uploadChunk }),
        );
        const { upload } = result.current;

        const resultsPromise = upload({ file, to: URLS });
        rerender();

        let state = result.current.state.uploads[file.name];
        expect(state.isUploading).toBe(true);
        expect(state.progress).toBe(0);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        state = result.current.state.uploads[file.name];
        expect(state.progress).toBeGreaterThan(0);

        await resultsPromise;
        rerender();
        state = result.current.state.uploads[file.name];
        expect(state.progress).toBe(1);
        expect(state.isUploading).toBe(false);
    });
});
