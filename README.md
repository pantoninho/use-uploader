# use-uploader

A React hook for uploading files with support for concurrent multipart uploads and progress tracking.

## Installation

```sh
npm install @pantoninho/use-uploader
```

## Usage

```jsx
import React from 'react';
import axios from 'axios';
import { useUploader } from '@pantoninho/use-uploader';

function App() {
    const { upload, data, error, progress, isUploading } = useUploader({
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
            {isUploading && <p>Uploading... {Math.round(progress * 100)}%</p>}
            {data && <p>Upload successful: {JSON.stringify(data)}</p>}
            {error && <p>Error: {error.message}</p>}
        </div>
    );
}

export default App;
```

## API

### `useUploader(options)`

A hook for uploading files with support for concurrent multipart uploads and progress tracking.

#### Arguments

1. `options` (`Object`): An object containing the following properties:
    - `threads` (`number`, optional): The number of concurrent uploads. Defaults to `5`.
    - `uploadChunk` (`Function`): A function that uploads a chunk of a file. It receives an object with the following properties:
        - `chunk` (`Blob`): The chunk to upload.
        - `url` (`string`): The URL to upload the chunk to.
        - `onProgress` (`Function`): A function to call with the upload progress. it expects a ProgressEvent object as the argument.

#### Returns

An object with the following properties:

-   `upload` (`Function`): A function that uploads a file. It receives an object with the following properties:
    -   `file` (`File`): The file to upload.
    -   `to` (`string | string[]`): URL or array of URLs to upload the file to. If an array is provided, the file will be split into chunks and uploaded to each URL concurrently.
-   `data` (`any`): The data returned by the `uploadChunk` function.
-   `error` (`Error`): The error thrown by the `uploadChunk` function.
-   `progress` (`number`): The upload progress as a number between `0` and `1`.
-   `isUploading` (`boolean`): A boolean indicating whether the file is being uploaded.
