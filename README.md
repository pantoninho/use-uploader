[![Codacy Badge](https://app.codacy.com/project/badge/Grade/3c3d99235106488c8fc1294baa609fa8)](https://app.codacy.com/gh/pantoninho/use-uploader/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/3c3d99235106488c8fc1294baa609fa8)](https://app.codacy.com/gh/pantoninho/use-uploader/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

# use-uploader

A small React hook for uploading files with concurrent requests and progress tracking. It supports single or multiple uploads, exposes per-upload state, and lets you customize the upload function (defaults to Axios PUT).

## Installation

```sh
npm install @pantoninho/use-uploader
```

Peer requirement: React 18.

## Example usage

### Single file upload with progress

```jsx
import React from 'react';
import { useUploader } from '@pantoninho/use-uploader';

export default function Uploader() {
    const { upload, uploads, isUploading } = useUploader({ threads: 3 });

    function onSelectFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const id = upload({ file, to: 'https://upload.example/1' });
        console.log('upload id:', id);
    }

    return (
        <div>
            <input type="file" onChange={onSelectFile} />
            {isUploading && <p>Uploading…</p>}
            {Object.entries(uploads).map(([id, u]) => (
                <p key={id}>
                    {u.error
                        ? `Error: ${u.error.message}`
                        : u.isUploading
                        ? `Progress: ${Math.round((u.progress || 0) * 100)}%`
                        : 'Done'}
                </p>
            ))}
        </div>
    );
}
```

### Multiple uploads with onComplete callback

```jsx
import React from 'react';
import { useUploader } from '@pantoninho/use-uploader';

export default function MultiUploader() {
    const { upload, isUploading } = useUploader();

    async function onSelectFiles(e) {
        const files = Array.from(e.target.files || []);
        const requests = files.map((file, i) => ({
            file,
            to: `https://upload.example/${i + 1}`,
        }));

        upload(requests, {
            onComplete: (results) => {
                // results: [{ data, error }, ...]
                console.log('all done:', results);
            },
        });
    }

    return (
        <div>
            <input type="file" multiple onChange={onSelectFiles} />
            {isUploading && <p>Uploading…</p>}
        </div>
    );
}
```

---

API at a glance

- `useUploader(options?)`
  - **options**: `{ threads = 5, uploadFile, onUploadStart, onUploadComplete }`
  - **returns**: `{ upload, uploads, isUploading }`
- `upload(request | request[], opts?)`
  - **request**: `{ file: File, to: string }`
  - **opts.onComplete**: called with `{ data, error }` for single request, or an array for multiple
  - returns an upload id (string) for single request, or an array of ids for multiple
- `uploads`
  - a map of `id -> { isUploading, progress, loaded, total, error, data }`

## Coverage reporting to Codacy

This project is set up to generate lcov and upload it to Codacy.

1) Generate coverage:

```sh
npm run coverage
```

2) Upload to Codacy (requires `CODACY_PROJECT_TOKEN` in CI env):

```sh
CODACY_PROJECT_TOKEN=your_token npm run codacy:coverage
```

In CI, run tests first to produce `coverage/lcov.info`, then upload. See the example GitHub Actions workflow in `.github/workflows/codacy-coverage.yml`.