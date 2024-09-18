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
                files: {
                    ...state.files,
                    [action.file.name]: {
                        isUploading: true,
                        progress: 0,
                        sent: 0,
                        total: action.file.size,
                    },
                },
            };
        case ACTION_TYPES.PROGRESS:
            return {
                ...state,
                files: {
                    ...state.files,
                    [action.file.name]: {
                        ...state.files[action.file.name],
                        progress: action.event.loaded / action.event.total,
                        loaded: action.event.loaded,
                        total: action.event.total,
                    },
                },
            };
        case ACTION_TYPES.COMPLETE:
            return {
                ...state,
                files: {
                    ...state.files,
                    [action.file.name]: {
                        ...state.files[action.file.name],
                        progress: 1,
                        isUploading: false,
                        data: action.data,
                    },
                },
            };
        case ACTION_TYPES.ERROR:
            return {
                ...state,
                files: {
                    ...state.files,
                    [action.file.name]: {
                        ...state.files[action.file.name],
                        isUploading: false,
                        error: action.error,
                    },
                },
            };
        default:
            return state;
    }
}
