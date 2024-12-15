/**
 * Use an uploader capable of concurrent uploads and progress tracking.
 * @param {object} params params
 * @param {number} params.threads maximum number of concurrent threads
 * @returns {Uploader}
 */
export function useUploader({ threads }?: {
    threads: number;
    uploadFile: (file: File, to: string) => Promise<unknown>;
}): Uploader;

export interface UploadRequest {
    /**
     * the file to upload
     */
    file: File;
    /**
     * the URLs to upload the file to
     */
    to: string;
};
export interface Uploader {
    /**
     * queue an upload request
     */
    upload: (request: UploadRequest | UploadRequest[]) => void;
    /**
     * whether the uploader is currently uploading.
     */
    isUploading: boolean;
    /**
     * the uploads handled by the uploader.
     */
    uploads: Mapping<string, Mapping<string, FileUploadState>>;
};
export interface FileUploadState {
    /**
     * whether the file is currently uploading.
     */
    isUploading: boolean;
    /**
     * the progress of the upload (0-1).
     */
    progress: number;
    /**
     * the number of bytes that have been uploaded.
     */
    loaded: number;
    /**
     * the total number of bytes to upload.
     */
    total: number;
    /**
     * the error that occurred during the upload.
     */
    error: Error;
    /**
     * response data from the upload
     */
    data: unknown;
};
