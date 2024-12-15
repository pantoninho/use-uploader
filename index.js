import React from 'react';
import axios from 'axios';
import { actions, uploaderStateReducer } from './lib/state-reducer.js';

/**
 * Use an uploader capable of concurrent uploads and progress tracking.
 * @param {object} params params
 * @param {number} [params.threads] maximum number of concurrent threads
 * @param {function} [params.uploadFile] function to upload a file
 * @returns {Uploader}
 */
export function useUploader({ threads = 5, uploadFile = axiosUpload } = {}) {
    const [state, dispatch] = React.useReducer(uploaderStateReducer, {
        uploads: {},
        queue: [],
    });

    const { uploads, queue } = state;

    async function startUpload(request) {
        const { file, to } = request;

        try {
            dispatch(actions.start(request));

            const data = await uploadFile(file, to, (e) =>
                dispatch(actions.progress(request, e)),
            );

            dispatch(actions.complete(request, data));
        } catch (err) {
            dispatch(actions.error(request, err));
        }
    }

    React.useEffect(() => {
        const isNotUploading = (request) =>
            !uploads[request.file.name][request.to].isUploading;
        const pendingUploads = queue.filter(isNotUploading);
        const buffer = Math.min(threads, pendingUploads.length);
        const nextUploads = pendingUploads.slice(0, buffer);

        nextUploads.forEach(startUpload);
    }, [queue.map((r) => `${r.file.name}:${r.to}`).join(',')]);

    return {
        isUploading: queue.length > 0,
        uploads,
        upload: (requests) => {
            const requestsArray = Array.isArray(requests)
                ? requests
                : [requests];

            requestsArray.forEach((r) => dispatch(actions.request(r)));
        },
    };
}

function axiosUpload(file, to, onUploadProgress) {
    const { data } = axios.put(to, file, { onUploadProgress });
    return data;
}

/**
 * @typedef {Object} UploadRequest
 * @property {File} file the file to upload
 * @property {string} to the URLs to upload the file to
 */

/**
 * @typedef {Object} Uploader
 * @property {function(UploadRequest|UploadRequest[])} upload upload a file or a set of files
 * @property {boolean} isUploading whether the uploader is currently uploading.
 * @property {Map<string, Map<string, FileUploadState>>} uploads the uploads handled by the uploader.
 */

/**
 * @typedef {Object} FileUploadState
 * @property {boolean} isUploading whether the file is currently uploading.
 * @property {number} progress the progress of the upload (0-1).
 * @property {number} loaded the number of bytes that have been uploaded.
 * @property {number} total the total number of bytes to upload.
 * @property {Error} error the error that occurred during the upload.
 * @property {any} data response data from the upload
 */
