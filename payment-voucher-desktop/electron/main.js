const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const db = require('./database');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, '../build/icon.png')
    });

    // Load the app
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    createMenu();
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Voucher',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('new-voucher');
                    }
                },
                {
                    label: 'Save Voucher',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        mainWindow.webContents.send('save-voucher');
                    }
                },
                {
                    label: 'Voucher History',
                    accelerator: 'CmdOrCtrl+H',
                    click: () => {
                        mainWindow.webContents.send('show-history');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Export PDF',
                    accelerator: 'CmdOrCtrl+P',
                    click: () => {
                        mainWindow.webContents.send('export-pdf');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Backup Database',
                    click: async () => {
                        const { filePath } = await dialog.showSaveDialog({
                            title: 'Backup Database',
                            defaultPath: `vouchers-backup-${new Date().toISOString().split('T')[0]}.db`,
                            filters: [{ name: 'Database Files', extensions: ['db'] }]
                        });
                        if (filePath) {
                            const result = db.backupDatabase(filePath);
                            if (result.success) {
                                dialog.showMessageBox({
                                    type: 'info',
                                    title: 'Backup Complete',
                                    message: 'Database backed up successfully!'
                                });
                            }
                        }
                    }
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Database Location',
                    click: () => {
                        dialog.showMessageBox({
                            type: 'info',
                            title: 'Database Location',
                            message: 'Database File Location',
                            detail: db.getDatabasePath()
                        });
                    }
                },
                { type: 'separator' },
                {
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox({
                            type: 'info',
                            title: 'About Payment Voucher Generator',
                            message: 'Payment Voucher Generator',
                            detail: 'Version 1.0.0\n\nDeveloped by NES Solution and Network Sdn Bhd\n\nA professional payment voucher management system for desktop.'
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Database IPC Handlers

// Get next PV counter
ipcMain.handle('get-next-pv-counter', async (event, company) => {
    try {
        const counter = await db.getNextPVCounter(company);
        return { success: true, counter };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Save voucher to database
ipcMain.handle('save-voucher-db', async (event, voucherData) => {
    try {
        const result = await db.saveVoucher(voucherData);
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Get all vouchers
ipcMain.handle('get-all-vouchers', async () => {
    try {
        const vouchers = await db.getAllVouchers();
        return { success: true, vouchers };
    } catch (error) {
        return { success: false, error: error.message, vouchers: [] };
    }
});

// Get voucher by PV number
ipcMain.handle('get-voucher', async (event, pvNumber) => {
    try {
        const voucher = await db.getVoucherByPVNumber(pvNumber);
        if (voucher) {
            return { success: true, voucher };
        }
        return { success: false, error: 'Voucher not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Search vouchers
ipcMain.handle('search-vouchers', async (event, searchTerm) => {
    try {
        const vouchers = await db.searchVouchers(searchTerm);
        return { success: true, vouchers };
    } catch (error) {
        return { success: false, error: error.message, vouchers: [] };
    }
});

// Delete voucher
ipcMain.handle('delete-voucher', async (event, pvNumber) => {
    try {
        const result = await db.deleteVoucher(pvNumber);
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Clear all data
ipcMain.handle('clear-all-data', async () => {
    try {
        const result = await db.clearAllData();
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Get database stats
ipcMain.handle('get-db-stats', async () => {
    try {
        const stats = await db.getDatabaseStats();
        return { success: true, stats };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Legacy file-based handlers (kept for compatibility)
ipcMain.handle('save-voucher-data', async (event, data) => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'Export Voucher as JSON',
        defaultPath: `${data.pvNumber || 'voucher'}.json`,
        filters: [
            { name: 'JSON Files', extensions: ['json'] }
        ]
    });

    if (filePath) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            return { success: true, path: filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    return { success: false };
});

ipcMain.handle('load-voucher-data', async () => {
    const { filePaths } = await dialog.showOpenDialog({
        title: 'Import Voucher from JSON',
        filters: [
            { name: 'JSON Files', extensions: ['json'] }
        ],
        properties: ['openFile']
    });

    if (filePaths && filePaths.length > 0) {
        try {
            const data = fs.readFileSync(filePaths[0], 'utf8');
            return { success: true, data: JSON.parse(data) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    return { success: false };
});

// Handle Excel export
ipcMain.handle('export-vouchers-excel', async (event, vouchers) => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'Export Vouchers to Excel',
        defaultPath: `vouchers-export-${new Date().toISOString().split('T')[0]}.xlsx`,
        filters: [
            { name: 'Excel Files', extensions: ['xlsx'] }
        ]
    });

    if (filePath) {
        try {
            const XLSX = require('xlsx');

            // Format data for Excel
            const excelData = vouchers.map(v => {
                const dateParts = v.date.split('-');
                const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
                return {
                    'PV Number': v.pv_number,
                    'Company': v.company.toUpperCase(),
                    'Date': formattedDate,
                    'Pay To': v.pay_to,
                    'Payment Method': v.payment_method.toUpperCase(),
                    'Total Amount (RM)': v.total_amount,
                    'Prepared By': v.prepared_by,
                    'Approved By': v.approved_by,
                    'Received By': v.received_by,
                    'Items': v.items.map(item => `${item.description} (RM ${item.amount})`).join('; ')
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Vouchers');

            XLSX.writeFile(workbook, filePath);
            return { success: true, path: filePath };
        } catch (error) {
            console.error('Excel Export Error:', error);
            return { success: false, error: error.message };
        }
    }
    return { success: false };
});

// Handle specialized Voucher PDF export from HTML
ipcMain.handle('generate-voucher-pdf', async (event, { html, filename }) => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'Export Voucher to PDF',
        defaultPath: filename || 'payment-voucher.pdf',
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (!filePath) return { success: false };

    try {
        // Create a hidden window to render the HTML
        let workerWindow = new BrowserWindow({
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        // Use a data URL to load the HTML content
        await workerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        // Wait a bit for any styles/images/fonts to settle
        await new Promise(resolve => setTimeout(resolve, 2000));

        const pdfData = await workerWindow.webContents.printToPDF({
            printBackground: true,
            pageSize: 'A4',
            margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });

        fs.writeFileSync(filePath, pdfData);
        workerWindow.close();
        return { success: true, path: filePath };
    } catch (error) {
        console.error('PDF Generation Error:', error);
        return { success: false, error: error.message };
    }
});

// Handle PDF export of the current window (Legacy/Generic)
ipcMain.handle('export-pdf', async (event) => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'Export to PDF',
        defaultPath: 'payment-voucher.pdf',
        filters: [
            { name: 'PDF Files', extensions: ['pdf'] }
        ]
    });

    if (filePath) {
        try {
            const pdfData = await mainWindow.webContents.printToPDF({
                printBackground: true,
                pageSize: 'A4'
            });
            fs.writeFileSync(filePath, pdfData);
            return { success: true, path: filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    return { success: false };
});

// Initialize database when app is ready
app.whenReady().then(() => {
    db.initDatabase();
    createWindow();
});

app.on('window-all-closed', () => {
    db.closeDatabase();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    db.closeDatabase();
});
