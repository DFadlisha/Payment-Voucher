# Quick Start Guide

## 🚀 Getting Started

### 1. Development Mode (Testing)

Run the app in development mode to test it:

```bash
npm run electron:dev
```

This will:
- Start the Vite development server on http://localhost:5173
- Open the Electron app window
- Enable hot-reload (changes update automatically)
- Open developer tools for debugging

### 2. Building for Production

#### Windows Installer
```bash
npm run dist:win
```
Output: `dist-electron/Payment Voucher Generator Setup.exe`

#### Mac DMG
```bash
npm run dist:mac
```
Output: `dist-electron/Payment Voucher Generator.dmg`

#### Linux AppImage/DEB
```bash
npm run dist:linux
```
Output: `dist-electron/Payment Voucher Generator.AppImage` and `.deb`

## 📝 How to Use

### Creating a Voucher

1. **Fill Basic Info**
   - Enter PV Number (e.g., PV-2026-001)
   - Select date

2. **Add Payee Details**
   - Name/Company
   - Address
   - Phone & Email

3. **Add Payment Items**
   - Click "Add Item" to add more rows
   - Enter description and amount for each item
   - Total is calculated automatically

4. **Add Signatures**
   - Prepared By
   - Approved By
   - Received By

5. **Save or Export**
   - **Save**: Stores as JSON file (can be loaded later)
   - **Export PDF**: Creates a printable PDF

### Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| New Voucher | Ctrl + N | Cmd + N |
| Save Voucher | Ctrl + S | Cmd + S |
| Load Voucher | Ctrl + O | Cmd + O |
| Export PDF | Ctrl + P | Cmd + P |

## 🎨 Features

✅ **Beautiful UI** - Modern glassmorphism design
✅ **Live Preview** - See your voucher as you type
✅ **Auto-calculation** - Total amount updates automatically
✅ **Save/Load** - Store vouchers for later editing
✅ **PDF Export** - Professional printable output
✅ **Offline** - Works without internet

## 🔧 Troubleshooting

### App won't start in dev mode

1. Make sure port 5173 is not in use
2. Try changing the port in `vite.config.js`
3. Delete `node_modules` and run `npm install` again

### Build fails

1. Make sure you have the latest Node.js (v18+)
2. Check that `build/icon.png` exists
3. Try running `npm run build` first to test the build

### PDF export not working

- The PDF export uses Electron's built-in print-to-PDF
- Make sure you're running the Electron app (not just the web version)

## 📦 File Formats

### JSON Save Format
Vouchers are saved as JSON files that can be loaded back into the app:
```json
{
  "pvNumber": "PV-2026-001",
  "date": "2026-01-10",
  "payTo": "ABC Company",
  ...
}
```

### PDF Export
Creates a standard A4 PDF suitable for printing or emailing.

## 🎯 Next Steps

Want to add more features? Consider:
- **Database Integration** - SQLite for storing all vouchers
- **Search & Filter** - Find old vouchers quickly
- **Templates** - Save common payment types
- **Multi-currency** - Support different currencies
- **Reports** - Monthly/yearly payment summaries
- **Auto-backup** - Automatic data backup

---

**Need Help?** Contact NES Solution and Network Sdn Bhd
