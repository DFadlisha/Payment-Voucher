# Payment Voucher Desktop App

A professional desktop application for creating and managing payment vouchers, built with Electron and React.

## Features

✅ **Local Database** - Persistent storage for vouchers using NeDB
✅ **Excel Export** - Batch export all or filtered vouchers to professional spreadsheets
✅ **Voucher Management** - History view with search, summary, and deletion
✅ **Auto PV Numbering** - Automatic sequence management for PV numbers
✅ **Signature Support** - Upload and display digital signatures
✅ **PDF Export** - Export individual vouchers to PDF format
✅ **Native Desktop App** - optimized for Windows desktop environment
✅ **Professional Output** - Branding for Mentari Infiniti and NES Solution

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
- **Ctrl/Cmd + S** - Save to Database
- **Ctrl/Cmd + H** - Manage Vouchers / History
- **Ctrl/Cmd + P** - Print / Export to PDF

## Usage

1. **Create a New Voucher**
   - PV number is auto-generated based on the current sequence
   - Choose company (Mentari or NES)
   - Fill in date, payee, and payment method
   - Add items (Description, Invoice No, Amount)
   - Upload signatures for Prepared, Approved, and Received

2. **Save and Manage**
   - Click "Save" (Ctrl+S) to store the voucher in the internal database
   - Click "Manage Vouchers" (Ctrl+H) to see all previous records
   - Use the Search bar to find specific vouchers by PV number or Name
   - Export the entire list to Excel using the "Export Excel" button

3. **Output and Printing**
   - Review the preview on the right side of the screen
   - Click "Print" (Ctrl+P) to export the current voucher as a professional PDF

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
