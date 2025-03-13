# marioCB

This is an Electron application that packages a JavaScript game into a desktop application.

## 🛠 Developing the Electron App

To develop and test the Electron game locally, use:

```sh
npm start
```

This will launch the Electron app in development mode. Ensure that index.html and your game assets are present in the correct directory.

## 📦 Packaging the Electron App

### 1️⃣ Install Dependencies
Ensure you have **Node.js** installed, then install the required dependencies:
```sh
npm install
```

### 2️⃣ Run the App for Testing
To test the app before packaging:
```sh
npm start
```
This will launch the Electron app.

### 3️⃣ Install Electron Packager
If you haven't already installed `electron-packager`, install it as a development dependency:
```sh
npm install --save-dev electron-packager
```

### 4️⃣ Package the App
Run one of the following commands depending on your target platform:

#### Windows (64-bit)
```sh
npx electron-packager . marioCB --platform=win32 --arch=x64 --out=dist --overwrite --electron-version 34.3.3 --icon=icon.icns
```

#### macOS (Intel-based)
```sh
npx electron-packager . marioCB --platform=darwin --arch=x64 --out=dist --overwrite --electron-version 34.3.3 --icon=icon.icns
``` 

#### macOS (Apple Silicon M1/M2)
```sh
npx electron-packager . marioCB --platform=darwin --arch=arm64 --out=dist --overwrite --electron-version 34.3.3 --icon=icon.icns
```

#### Linux
```sh
npx electron-packager . marioCB --platform=linux --arch=x64 --out=dist --overwrite --electron-version 34.3.3 --icon=icon.icns
```

### 5️⃣ Locate the Packaged App
After running the packaging command, the packaged application will be located in the `dist/` directory.

For example:
```
dist/
  ├── marioCB-win32-x64/
  │   ├── marioCB.exe  # Windows executable
  │   ├── ...other files...
  ├── marioCB-darwin-x64/
  │   ├── marioCB.app  # macOS application
  │   ├── ...other files...
  ├── marioCB-linux-x64/
  │   ├── marioCB  # Linux executable
  │   ├── ...other files...
```

### 6️⃣ Running the Packaged App
Navigate to the packaged folder and run the app:

#### Windows
```sh
cd dist/marioCB-win32-x64
./marioCB.exe
```

#### macOS
```sh
cd dist/marioCB-darwin-x64
open marioCB.app
```

#### Linux
```sh
cd dist/marioCB-linux-x64
./marioCB
```

## 🛠 Additional Packaging Options

To include application icons, add the `--icon` flag with the path to an `.ico` (Windows), `.icns` (macOS), or `.png` (Linux) file:
```sh
npx electron-packager . marioCB --platform=win32 --arch=x64 --out=dist --icon=assets/icon.ico --overwrite
```

## 🚀 Distributing Your App

To distribute the app, zip the appropriate folder inside `dist/` and share it with users.

For creating installers, consider using:
- **Windows**: [`electron-builder`](https://www.electron.build/)
- **macOS**: [`electron-builder`](https://www.electron.build/) for `.dmg` files
- **Linux**: [`electron-installer-debian`](https://www.npmjs.com/package/electron-installer-debian) for `.deb` packages

## 🎉 Done!
Your Electron-based game is now packaged and ready for distribution!
