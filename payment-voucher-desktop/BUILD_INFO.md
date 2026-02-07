# Payment Voucher Generator - Build Information

## Build Date: February 7, 2026

## Version: 1.0.0

## Build Status: ✅ SUCCESS

---

## What's New in This Build

### Fixed Issues:
1. ✅ **Cheque Number Styling** - Removed bold formatting from cheque number display
   - Preview section now shows cheque number in normal weight
   - PDF exports show cheque number in normal weight
   - Print outputs show cheque number in normal weight

### Confirmed Features:
1. ✅ **Separate PV Numbers per Company**
   - Mentari Infiniti: MI-0001, MI-0002, etc.
   - NES Solution: NES-0001, NES-0002, etc.
   - Each company maintains independent counter

2. ✅ **All Existing Features Working**
   - Local database storage
   - PDF export
   - Excel export
   - Signature uploads
   - Voucher history and search
   - Professional templates

---

## Installation Files

### Main Installer:
📦 **File**: `Payment Voucher Generator Setup 1.0.0.exe`
📍 **Location**: `dist-electron/Payment Voucher Generator Setup 1.0.0.exe`
💾 **Size**: ~80 MB

### Installation Instructions:

1. **Locate the installer**:
   - Navigate to: `dist-electron` folder
   - Find: `Payment Voucher Generator Setup 1.0.0.exe`

2. **Install the application**:
   - Double-click the EXE file
   - Follow the installation wizard
   - The app will be installed to: `C:\Users\{YourUsername}\AppData\Local\Programs\payment-voucher-generator`

3. **Launch the application**:
   - Desktop shortcut will be created
   - Or find it in Start Menu under "Payment Voucher Generator"

4. **First Run**:
   - The application will create a database folder automatically
   - Database location: `C:\Users\{YourUsername}\AppData\Roaming\payment-voucher-desktop`

---

## Distribution

### To Share with Others:

**Option 1: Share the Installer** (Recommended)
- Send the file: `Payment Voucher Generator Setup 1.0.0.exe`
- Recipients run the installer on their Windows PC
- Each user gets their own local database

**Option 2: Share the Unpacked Version**
- Zip the `win-unpacked` folder
- Recipients extract and run `Payment Voucher Generator.exe`
- No installation required, but less convenient

---

## Database Information

### Database Location:
```
C:\Users\{Username}\AppData\Roaming\payment-voucher-desktop\
├── vouchers.db          (All voucher records)
└── settings.db          (PV counters and settings)
```

### Backup Your Data:
1. Open the application
2. Go to: **File → Backup Database**
3. Choose a location to save the backup
4. File will be saved as: `vouchers-backup-YYYY-MM-DD.db`

### Restore from Backup:
1. Close the application
2. Navigate to database folder (see location above)
3. Replace `vouchers.db` with your backup file
4. Restart the application

---

## System Requirements

- **Operating System**: Windows 10 or Windows 11
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 200MB for installation
- **Display**: 1000x700 minimum resolution (1400x900 recommended)

---

## Keyboard Shortcuts

- **Ctrl + N** - New Voucher
- **Ctrl + S** - Save Voucher
- **Ctrl + H** - Manage Vouchers / History
- **Ctrl + P** - Export to PDF

---

## Troubleshooting

### Issue: "Windows protected your PC" message
**Solution**: 
1. Click "More info"
2. Click "Run anyway"
3. This is normal for unsigned applications

### Issue: Application won't start
**Solution**:
1. Right-click the EXE → Properties
2. Check "Unblock" at the bottom
3. Click Apply → OK
4. Try running again

### Issue: Database not saving
**Solution**:
1. Check if you have write permissions to AppData folder
2. Try running as Administrator
3. Check antivirus isn't blocking the app

### Issue: PDF export not working
**Solution**:
1. Make sure you have write permissions to the export location
2. Try exporting to a different folder (e.g., Desktop)

---

## Support

For issues or questions:
- Contact: NES Solution and Network Sdn Bhd
- Check the README.md file for more information

---

## Next Steps: Online Version

This is the desktop version. For multi-user online access:
- See: `WEB_MIGRATION_PLAN.md`
- Timeline: 10-15 days
- Cost: FREE (Firebase free tier)

---

## Build Details

**Build Command**: `npm run dist:win`
**Build Tool**: electron-builder
**Build Time**: ~2-3 minutes
**Exit Code**: 0 (Success)

**Files Generated**:
- ✅ Payment Voucher Generator Setup 1.0.0.exe (Installer)
- ✅ Payment Voucher Generator Setup 1.0.0.exe.blockmap (Update metadata)
- ✅ win-unpacked/ (Portable version)

---

**Built on**: February 7, 2026, 5:28 PM (GMT+8)
**Developer**: NES Solution and Network Sdn Bhd
