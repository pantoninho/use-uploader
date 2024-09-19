import React from 'react';
import { concurrent } from './lib/concurrent.js';
import { uploaderStateReducer, actions } from './lib/state-reducer.js';

/**
 * @param {object} params params
 * @param {number} params.threads number of concurrent threads
 * @param {function({chunk: Blob, url: string, onProgress: function(ProgressEvent): void}): Promise<Response>} params.uploadChunk function to upload a chunk
 * @returns {Uploader}
 */
export function useUploader({ threads = 5, uploadChunk }) {
    const [state, dispatch] = React.useReducer(uploaderStateReducer, {
        isUploading: false,
        uploads: {},
    });

    async function upload({ file, to }) {
        dispatch(actions.start(file));

        try {
            const data = Array.isArray(to)
                ? await concurrentUploads({
                      file,
                      urls: to,
                      uploadChunk,
                      threads,
                      onProgress: (e) => dispatch(actions.progress(file, e)),
                  })
                : await uploadChunk({
                      chunk: file,
                      url: to,
                      onProgress: (e) => dispatch(actions.progress(file, e)),
                  });

            dispatch(actions.complete(file, data));
            return data;
        } catch (error) {
            dispatch(actions.error(file, error));
        }
    }

    return {
        state,
        upload,
    };
}

async function concurrentUploads({
    file,
    urls,
    uploadChunk,
    threads,
    onProgress,
}) {
    const bytesLoadedPerPart = [];
    const parts = createUploadParts({ file, urls });

    async function upload(part) {
        const { from, to, url } = part;

        return await uploadChunk({
            chunk: file.slice(from, to),
            url,
            onProgress: (event) => {
                bytesLoadedPerPart[part.index] = event.loaded;

                onProgress({
                    loaded: bytesLoadedPerPart.reduce(
                        (acc, loaded) => acc + loaded,
                        0,
                    ),
                    total: file.size,
                });
            },
        });
    }

    return await concurrent({
        threads,
        jobs: parts.map((part) => () => upload(part)),
    });
}

/**
 * @param {object} params params
 * @param {File} param.file file to split into parts
 * @param {String[]} param.urls urls to upload the parts to
 * @returns {Part[]} upload parts
 */
function createUploadParts({ file, urls }) {
    const chunkSize = Math.ceil(file.size / urls.length);

    return urls.map((url, i) => {
        return {
            url,
            index: i,
            from: i * chunkSize,
            to: Math.min((i + 1) * chunkSize, file.size),
        };
    });
}

/**
 * @typedef {Object} Part
 * @property {number} from the starting byte of the part.
 * @property {number} to the ending byte of the part.
 * @property {string} url the URL to upload the part to.
 * @property {string} verb the HTTP verb to use for the upload.
 * @property {number} index the index of the part.
 */

/**
 * @typedef {Object} Uploader
 * @property {function({file: File, to: string[] | string})} upload uploads a file to the specified URLs.
 * @property {Map<string, boolean>} isUploading whether the uploader is currently uploading a file, keyed by the file name.
 * @property {Map<string, any>} data the data returned by each upload, keyed by the file name.
 * @property {Map<string, Error>} errors errors that occurred during an upload, keyed by the file name.
 * @property {Map<String, Float>} progress the progress of each upload, keyed by the file name
 */
