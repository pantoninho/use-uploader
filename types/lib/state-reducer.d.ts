export function uploaderStateReducer(state: any, action: any): any;
export const actions: {
    [x: string]: ((request: any) => {
        type: string;
        request: any;
    }) | ((request: any, e: any) => {
        type: string;
        request: any;
        event: any;
    }) | ((request: any, data: any) => {
        type: string;
        request: any;
        data: any;
    }) | ((request: any, error: any) => {
        type: string;
        request: any;
        error: any;
    });
};
