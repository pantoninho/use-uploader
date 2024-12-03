# use-uploader

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/2cbcbe1525fd4ca19d0035db3eb51efa)](https://app.codacy.com/gh/pantoninho/use-uploader?utm_source=github.com&utm_medium=referral&utm_content=pantoninho/use-uploader&utm_campaign=Badge_Grade)

a react hook for uploading files with support for concurrent multipart uploads and progress tracking.

## installation

```sh
npm install @pantoninho/use-uploader
```

## API

### `useUploader(options)`

a hook for uploading files with support for concurrent multipart uploads and progress tracking.

#### arguments

1. `options` (`Object`): an object containing the following properties:
    - `threads` (`number`, optional): the number of concurrent uploads **per file**. defaults to `5`.

#### returns

an object with the following properties:

-   `upload` (`Function`): a function that uploads a file. It receives an object or an array of objects with the following properties:
    -   `file` (`File`): the file to upload.
    -   `to` (`string`): URL to upload the file to.
-   `uploads` (`object`): a object containing the upload progress for each file. the keys are the filenames and their destinations, and the values are objects with the following properties:
    -   `key` (`string`): a unique key for the upload.
    -   `isUploading` (`boolean`): a boolean indicating whether the file is being uploaded.
    -   `progress` (`number`): the file upload progress as a number between `0` and `1`.
    -   `loaded` (`number`): the number of bytes uploaded.
    -   `total` (`number`): the total file size in bytes.
    -   `data` (`any`): data returned by the response
    -   `error` (`Error`): error returned by the response

## example

```jsx
import React from 'react';
import { useUploader } from '@pantoninho/use-uploader';

function App() {
    const { upload, uploads } = useUploader();

    const handleUpload = async (file) => {
        const requests = [{ file, to: 'https://upload.example/1' }];
        await upload(requests);
    };

    return (
        <div>
            <input
                type="file"
                onChange={(e) => handleUpload(e.target.files[0])}
            />
            {Object.keys(state.uploads).map((filename) =>
                Object.keys(state.uploads[filename]).map((destination) => {
                    const upload = state.uploads[filename][destination];

                    return (
                        <p key={upload.key}>
                            {upload.isUploading
                                ? `${filename}: ${upload.progress}`
                                : `${filename}: upload complete`}

                            {upload.error &&
                                `${filename}: ${upload.error.message}`}
                        </p>
                    );
                }),
            )}
        </div>
    );
}

export default App;
```
