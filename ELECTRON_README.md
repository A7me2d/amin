# Electron Desktop Application

This project has been configured to run as a desktop application using Electron.

## What Was Done

1. **Installed Electron dependencies**:
   - `electron` - The Electron framework
   - `@electron-forge/cli` - Electron Forge command-line tool
   - `@electron-forge/maker-squirrel` - Windows installer maker
   - `@electron-forge/maker-zip` - ZIP maker for macOS

2. **Created `main.js`**: Electron entry point that loads the Angular application

3. **Updated `package.json`**:
   - Added `"main": "main.js"` entry point
   - Added Electron scripts
   - Added Electron Forge configuration

4. **Modified `angular.json`**: Changed `outputMode` to `static` for client-side rendering

## Available Scripts

### Development

```bash
# Run Angular dev server (browser)
npm start

# Build and run Electron app in development mode
npm run electron:dev
```

### Production Build

```bash
# Build the Angular application
npm run build

# Package the app (creates runnable app in out/ folder)
npm run package

# Create installer (creates setup.exe in out/make folder)
npm run make
```

## Output Files

After running `npm run make`, the installer is located at:

```
out/make/squirrel.windows/x64/amin-0.0.0 Setup.exe
```

This is the Windows installer that users can run to install the application on their PC.

## How to Distribute

1. Share the `amin-0.0.0 Setup.exe` file with users
2. Users run the installer to install the application
3. The app will be installed to their Program Files
4. A desktop shortcut and Start Menu entry will be created

## Configuration

The Electron Forge configuration is in `package.json` under the `config.forge` key. You can customize:

- **App name**: Change `"name": "Amin"` in the maker config
- **Authors**: Change `"authors"` field
- **Icon**: Update `"setupIcon"` path to your custom icon
- **Auto-update**: Can be configured with Electron Forge publishers

## Notes

- The app runs the Angular frontend as a desktop application
- Make sure your backend server (`d:\mongo\new-back-end\new-back-end`) is running if the app requires API calls
- For production, update the API URLs in your Angular app to point to the production backend
