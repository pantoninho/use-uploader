export function useUploader({ threads, uploadFile, onUploadStart, onUploadComplete }?: {
    threads?: number;
    uploadFile?: (file: File, to: string) => Promise<unknown>;
    onUploadStart?: (upload: UploadRequest) => void;
    onUploadComplete?: (upload: UploadRequest) => void;
}): Uploader;


export interface Uploader {
    upload: (request: UploadRequest) => string;
    upload: (request: UploadRequest[]) => string[];
    isUploading: boolean;
    uploads: Mapping<string, FileUploadState>;
};

export interface UploadRequest {
    file: File;
    to: string;
};

export interface FileUploadState {
    file: File;
    isUploading: boolean;
    progress: number;
    loaded: number;
    total: number;
    error: Error;
    data: unknown;
    promise: Promise<unknown>;
};
