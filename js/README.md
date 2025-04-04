# Mario Game

This directory contains the Mario game, a JavaScript clone of Super Marios Bros., which is hosted on GitHub Pages. This README guides you through setting up and deploying the game.

## Quick Start

The play the game locally:

1. Navigate to the `js` directory:

```bash
cd js
```

2. Open the `index.html` file in your web browser:

```bash
open index.html
```

The game should load automatically.

## Configuration

### Backend URL

Mario communicates with a backend [Node.js server](../server) to store and retrieve game data. You must specify the URL of this backend server:

* Open `game.js` in this folder.
* Locate the following line at the top:

```js
const BACKEND_URL = 'https://your-backend-url.com';
```

* Replace `https://your-backend-url.com` with the actual URL of your backend server.

### Email Address Validation

You can configure the game to accept only non-Gmail addresses by setting the `work_emails` URL parameter when starting the game:

* Accept only non-Gmail addresses:

```bash
https://<username>.github.io/<repository>?work_emails=true
```

* Accept any email address:

```bash
https://<username>.github.io/<repository>?work_emails=false
```

## Deployment to GitHub Pages

Follow these steps to deploy the game to GitHub Pages:

1. Ensure your coded is committed and pushed to your GitHub repository.
2. In your repository, go to **Settings -> Pages**:
    - Select the branch you want to deploy from (`gh-pages`).
    - Choose the root directory (`/`) as the source.
3. Click **Save**.
4. Your game will be available at `https://<username>.github.io/<repository>`.

## Verify Deployment

1. Open your web browser and navigate to `https://<username>.github.io/<repository>`.
2. The game should load automatically.

## Troubleshooting

* **Backend URL Issues:** Ensure the backend URL is correct and accessible.
* **Email Validation Issues:** Ensure the `work_emails` parameter is set correctly in the URL.
* **Deployment Issues:** Verify that GitHub Pages settings point to the correct branch and directory.