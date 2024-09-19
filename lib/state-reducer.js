const ACTION_TYPES = {
    START: 'start',
    PROGRESS: 'progress',
    COMPLETE: 'complete',
    ERROR: 'error',
};

export const actions = {
    [ACTION_TYPES.START]: (file) => ({ type: ACTION_TYPES.START, file }),
    // prettier-ignore
    [ACTION_TYPES.PROGRESS]: (file, e) => ({ type: ACTION_TYPES.PROGRESS, file, event: e }),
    // prettier-ignore
    [ACTION_TYPES.COMPLETE]: (file, data) => ({ type: ACTION_TYPES.COMPLETE, file, data }),
    // prettier-ignore
    [ACTION_TYPES.ERROR]: (file, error) => ({ type: ACTION_TYPES.ERROR, file, error }),
};

export function uploaderStateReducer(state, action) {
    switch (action.type) {
        case ACTION_TYPES.START:
            return {
                ...state,
                isUploading: true,
                uploads: {
                    ...state.uploads,
                    [action.file.name]: {
                        isUploading: true,
                        progress: 0,
                        loaded: 0,
                        total: action.file.size,
                        data: null,
                    },
                },
            };
        case ACTION_TYPES.PROGRESS:
            return {
                ...state,
                isUploading: true,
                uploads: {
                    ...state.uploads,
                    [action.file.name]: {
                        ...state.uploads[action.file.name],
                        isUploading: true,
                        progress: action.event.loaded / action.event.total,
                        loaded: action.event.loaded,
                    },
                },
            };
        case ACTION_TYPES.COMPLETE:
            return {
                ...state,
                isUploading: Object.values(state.uploads)
                    .filter((f) => f.name !== action.file.name)
                    .some((file) => file.isUploading),
                uploads: {
                    ...state.uploads,
                    [action.file.name]: {
                        ...state.uploads[action.file.name],
                        progress: 1,
                        isUploading: false,
                        data: action.data,
                    },
                },
            };
        case ACTION_TYPES.ERROR:
            return {
                ...state,
                isUploading: Object.values(state.uploads)
                    .filter((f) => f.name !== action.file.name)
                    .some((file) => file.isUploading),
                uploads: {
                    ...state.uploads,
                    [action.file.name]: {
                        ...state.uploads[action.file.name],
                        isUploading: false,
                        error: action.error,
                    },
                },
            };
        default:
            return state;
    }
}
