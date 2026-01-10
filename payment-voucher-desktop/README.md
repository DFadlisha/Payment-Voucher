# Payment Voucher Desktop App

A professional desktop application for creating and managing payment vouchers, built with Electron and React.

## Features

✅ **Native Desktop App** - Runs on Windows, Mac, and Linux
✅ **Beautiful Modern UI** - Glassmorphism design with smooth animations
✅ **Save/Load Vouchers** - Store vouchers as JSON files
✅ **PDF Export** - Export vouchers to PDF format
✅ **Keyboard Shortcuts** - Quick access to common actions
✅ **Offline Work** - No internet connection required
✅ **Professional Output** - Clean, printable voucher format

## Installation

### Prerequisites

- Node.js v18 or higher ([Download here](https://nodejs.org/))

### Setup

1. **Install Dependencies**

```bash
npm install
```

2. **Run in Development Mode**

```bash
npm run electron:dev
```

This will start the development server and open the app.

## Building for Distribution

### Windows

```bash
npm run dist:win
```

Creates an `.exe` installer in the `dist-electron` folder.

### Mac

```bash
npm run dist:mac
```

Creates a `.dmg` file in the `dist-electron` folder.

### Linux

```bash
npm run dist:linux
```

Creates `.AppImage` and `.deb` files in the `dist-electron` folder.

## Keyboard Shortcuts

- **Ctrl/Cmd + N** - New Voucher
- **Ctrl/Cmd + S** - Save Voucher
- **Ctrl/Cmd + O** - Load Voucher
- **Ctrl/Cmd + P** - Export to PDF

## Usage

1. **Create a New Voucher**
   - Fill in the PV number and date
   - Enter payee information
   - Add payment items with descriptions and amounts
   - Add notes and signatures

2. **Save Your Work**
   - Click "Save" or press Ctrl/Cmd + S
   - Choose a location to save the JSON file

3. **Load Existing Voucher**
   - Click "Load" or press Ctrl/Cmd + O
   - Select a previously saved JSON file

4. **Export to PDF**
   - Click "Export PDF" or press Ctrl/Cmd + P
   - Choose where to save the PDF file

## Project Structure

```
payment-voucher-desktop/
├── electron/           # Electron main process
│   └── main.js        # Main window and IPC handlers
├── src/               # React application
│   ├── App.jsx        # Main application component
│   └── main.jsx       # React entry point
├── build/             # Build resources
│   └── icon.png       # Application icon
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
└── package.json       # Project dependencies
```

## Troubleshooting

### Port Already in Use

If you get an error that port 5173 is already in use, change the port in `vite.config.js`:

```javascript
server: {
  port: 5174  // Change to any available port
}
```

### Dependencies Issues

If you encounter dependency errors:

```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

## Development

- Built with [Electron](https://www.electronjs.org/)
- UI framework: [React](https://react.dev/)
- Build tool: [Vite](https://vitejs.dev/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)
- Icons: [Lucide React](https://lucide.dev/)

## License

MIT License

## Support

For issues or questions, please contact NES Solution and Network Sdn Bhd.

---

**Version:** 1.0.0  
**Developer:** NES Solution and Network Sdn Bhd
