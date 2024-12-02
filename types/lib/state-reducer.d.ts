import { UploadRequest } from "../..";

export interface UploaderState {
    queue: UploadRequest[];
    uploads: Mapping<string, Mapping<string, FileUploadState>>;
}

export interface Action {
    type: string;
    request: UploadRequest;
    event?: ProgressEvent;
    data?: unknown;
    error?: Error;
}

export function uploaderStateReducer(state: UploaderState, action: Action): UploaderState;

export const actions: {
    request: (request: UploadRequest) => { type: string; request: UploadRequest; };
    start: (request: UploadRequest) => { type: string; request: UploadRequest; };
    progress: (request: UploadRequest, event: ProgressEvent) => { type: string; request: UploadRequest; event: ProgressEvent; };
    complete: (request: UploadRequest, data: unknown) => { type: string; request: UploadRequest; data: unknown; };
    error: (request: UploadRequest, error: Error) => { type: string; request: UploadRequest; error: Error; };
};
