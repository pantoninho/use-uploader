import React from 'react';
import axios from 'axios';
import {
    actions,
    resolvablePromise,
    uploaderStateReducer,
} from './lib/state-reducer.js';

/**
 * Use an uploader capable of concurrent uploads and progress tracking.
 * @param {object} params params
 * @param {number} [params.threads] maximum number of concurrent threads
 * @param {function} [params.uploadFile] function to upload a file
 * @param {function} [params.onUploadStart] function called when a upload starts
 * @param {function} [params.onUploadComplete] function called when a upload completes
 * @returns {Uploader}
 */
export function useUploader({
    threads = 5,
    uploadFile = axiosUpload,
    onUploadStart = () => {},
    onUploadComplete = () => {},
} = {}) {
    const [state, dispatch] = React.useReducer(uploaderStateReducer, {
        uploads: {},
        queue: [],
    });

    const { uploads, queue } = state;

    async function startUpload(request) {
        const { file, to } = request;

        try {
            dispatch(actions.start(request));
            onUploadStart(request);

            const data = await uploadFile(file, to, (e) =>
                dispatch(actions.progress(request, e)),
            );

            onUploadComplete(request);
            dispatch(actions.complete(request, data));
        } catch (err) {
            dispatch(actions.error(request, err));
        }
    }

    React.useEffect(() => {
        const isNotUploading = (request) => !uploads[request.id].isUploading;
        const pendingUploads = queue.filter(isNotUploading);
        const buffer = Math.min(threads, pendingUploads.length);
        const nextUploads = pendingUploads.slice(0, buffer);
        nextUploads.forEach(startUpload);
    }, [queue.map((request) => request.id).join(',')]);

    return {
        isUploading: queue.length > 0,
        uploads,
        upload: (requests, { onComplete = () => {} } = {}) => {
            const isArray = Array.isArray(requests);
            requests = isArray ? requests : [requests];

            requests = requests.map((r) => ({
                ...r,
                id: `${crypto.randomUUID()}`,
                promise: resolvablePromise(),
            }));

            requests.forEach((r) => dispatch(actions.request(r)));

            onCompleteCallbackController(
                requests.map((r) => r.promise),
                (responses) => onComplete(isArray ? responses : responses[0]),
            );

            if (!isArray) {
                return requests[0].id;
            }

            return requests.map((r) => r.id);
        },
    };
}

async function axiosUpload(file, to, onUploadProgress) {
    const { data } = await axios.put(to, file, { onUploadProgress });
    return data;
}

function onCompleteCallbackController(promises, onComplete) {
    Promise.allSettled(promises)
        .then((settled) =>
            settled.map((promise) => ({
                data: promise.status === 'fulfilled' ? promise.value : null,
                error: promise.status === 'rejected' ? promise.reason : null,
            })),
        )
        .then(onComplete);
}

/**
 * @typedef {Object} UploadRequest
 * @property {File} file the file to upload
 * @property {string} to the URL to upload the file to
 */

/**
 * @typedef {Object} Uploader
 * @property {function(UploadRequest|UploadRequest[])} upload upload a file or a set of files
 * @property {boolean} isUploading whether the uploader is currently uploading.
 * @property {Map<string, FileUploadState>} uploads the uploads handled by the uploader.
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
