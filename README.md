Payment Voucher Desktop App
A professional desktop application for creating and managing payment vouchers, built with Electron and React.

Features
✅ Native Desktop App - Runs on Windows, Mac, and Linux ✅ Beautiful Modern UI - Glassmorphism design with smooth animations ✅ Save/Load Vouchers - Store vouchers as JSON files ✅ PDF Export - Export vouchers to PDF format ✅ Keyboard Shortcuts - Quick access to common actions ✅ Offline Work - No internet connection required ✅ Professional Output - Clean, printable voucher format

Installation
Prerequisites
Node.js v18 or higher (Download here)
Setup
Install Dependencies
npm install
Run in Development Mode
npm run electron:dev
This will start the development server and open the app.

Building for Distribution
Windows
npm run dist:win
Creates an .exe installer in the dist-electron folder.

Mac
npm run dist:mac
Creates a .dmg file in the dist-electron folder.

Linux
npm run dist:linux
Creates .AppImage and .deb files in the dist-electron folder.

Keyboard Shortcuts
Ctrl/Cmd + N - New Voucher
Ctrl/Cmd + S - Save Voucher
Ctrl/Cmd + O - Load Voucher
Ctrl/Cmd + P - Export to PDF
Usage
Create a New Voucher

Fill in the PV number and date
Enter payee information
Add payment items with descriptions and amounts
Add notes and signatures
Save Your Work

Click "Save" or press Ctrl/Cmd + S
Choose a location to save the JSON file
Load Existing Voucher

Click "Load" or press Ctrl/Cmd + O
Select a previously saved JSON file
Export to PDF

Click "Export PDF" or press Ctrl/Cmd + P
