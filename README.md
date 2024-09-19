# use-uploader

a react hook for uploading files with support for concurrent multipart uploads and progress tracking.

## installation

```sh
npm install @pantoninho/use-uploader
```

## usage

```jsx
import React from 'react';
import axios from 'axios';
import { useUploader } from '@pantoninho/use-uploader';

function App() {
    const { upload, state } = useUploader({
        threads: 5,
        uploadChunk: async ({ chunk, url, onProgress }) => {
            // Implement your chunk upload logic here
            return await axios.put(url, {
                body: chunk,
                onUploadProgress: onProgress,
            });
        },
    });

    const handleUpload = async (file) => {
        const url = [
            'https://upload.example/part/1',
            'https://upload.example/part/2',
            'https://upload.example/part/3',
        ];
        await upload({ file, to: url });
    };

    return (
        <div>
            <input
                type="file"
                onChange={(e) => handleUpload(e.target.files[0])}
            />
            {Object.keys(state.uploads).map((filename) => (
                <p key={filename}>
                    {state.uploads[filename].isUploading
                        ? `${filename}: ${state.uploads[filename].progress}`
                        : `${filename}: upload complete`}

                    {state.uploads[filename].error &&
                        `${filename}: ${state.uploads[filename].error.message}`}
                </p>
            ))}
        </div>
    );
}

export default App;
```

## API

### `useUploader(options)`

a hook for uploading files with support for concurrent multipart uploads and progress tracking.

#### arguments

1. `options` (`Object`): an object containing the following properties:
    - `threads` (`number`, optional): the number of concurrent uploads **per file**. defaults to `5`.
    - `uploadChunk` (`Function`): a function that uploads a chunk of a file. It receives an object with the following properties:
        - `chunk` (`Blob`): the chunk to upload.
        - `url` (`string`): the URL to upload the chunk to.
        - `onProgress` (`Function`): a function to call with the upload progress. it expects a `ProgressEvent` object as the argument.

#### returns

an object with the following properties:

-   `upload` (`Function`): a function that uploads a file. It receives an object with the following properties:
    -   `file` (`File`): the file to upload.
    -   `to` (`string | string[]`): URL or array of URLs to upload the file to. If an array is provided, the file will be split into chunks and uploaded to each URL concurrently.
-   `state` (`object`): uploader state, represented by the following properties:
    -   `isUploading` (`boolean`): a boolean indicating whether a file is being uploaded.
    -   `uploads` (`object`): a object containing the upload progress for each file. the keys are the filenames and the values are objects with the following properties:
        -   `data` (`any`): data returned by every `uploadChunk` call
        -   `error` (`Error`): error uploading a chunk. null if no error occurred.
        -   `progress` (`number`): the file upload progress as a number between `0` and `1`.
        -   `isUploading` (`boolean`): a boolean indicating whether the file is being uploaded.
