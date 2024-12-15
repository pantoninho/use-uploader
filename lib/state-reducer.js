const ACTION_TYPES = {
    REQUEST: 'request',
    START: 'start',
    PROGRESS: 'progress',
    COMPLETE: 'complete',
    ERROR: 'error',
};

export const actions = {
    // prettier-ignore
    [ACTION_TYPES.REQUEST]: (request) => ({ type: ACTION_TYPES.REQUEST, request }),
    // prettier-ignore
    [ACTION_TYPES.START]: (request) => ({ type: ACTION_TYPES.START, request }),
    // prettier-ignore
    [ACTION_TYPES.PROGRESS]: (request, e) => ({ type: ACTION_TYPES.PROGRESS, request, event: e }),
    // prettier-ignore
    [ACTION_TYPES.COMPLETE]: (request, data) => ({ type: ACTION_TYPES.COMPLETE, request, data }),
    // prettier-ignore
    [ACTION_TYPES.ERROR]: (request, error) => ({ type: ACTION_TYPES.ERROR, request, error }),
};

export function uploaderStateReducer(state, action) {
    const { request } = action;
    const { file, to, id } = request;
    const { uploads, queue } = state;

    switch (action.type) {
        case ACTION_TYPES.REQUEST:
            return {
                ...state,
                queue: [...queue, { file, to, id }],
                uploads: mergeUploadState(uploads, request, {
                    file,
                    isUploading: false,
                    progress: 0,
                    loaded: 0,
                    total: file.size,
                    data: null,
                    error: null,
                }),
            };
        case ACTION_TYPES.START:
            return {
                ...state,
                uploads: mergeUploadState(uploads, request, {
                    isUploading: true,
                }),
            };
        case ACTION_TYPES.PROGRESS:
            return {
                ...state,
                uploads: mergeUploadState(uploads, request, {
                    isUploading: true,
                    progress: action.event.loaded / action.event.total,
                    loaded: action.event.loaded,
                }),
            };
        case ACTION_TYPES.COMPLETE:
            return {
                ...state,
                queue: removeRequestFromQueue(queue, request),
                uploads: mergeUploadState(uploads, request, {
                    progress: 1,
                    loaded: file.size,
                    isUploading: false,
                    data: action.data,
                }),
            };
        case ACTION_TYPES.ERROR:
            return {
                ...state,
                queue: removeRequestFromQueue(queue, request),
                uploads: mergeUploadState(uploads, request, {
                    isUploading: false,
                    error: action.error,
                }),
            };
        default:
            return state;
    }
}

function mergeUploadState(uploads, request, state) {
    const { id } = request;
    return {
        ...uploads,
        [id]: {
            ...uploads[id],
            ...state,
        },
    };
}

function removeRequestFromQueue(queue, request) {
    return queue.filter(
        (r) => r.file.name !== request.file.name || r.to !== request.to,
    );
}
