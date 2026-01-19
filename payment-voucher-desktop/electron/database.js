const Datastore = require('nedb-promises');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

let db = {};

// Get database path
function getDatabasePath() {
    const userDataPath = app.getPath('userData');
    if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
    }
    return userDataPath;
}

// Initialize database
function initDatabase() {
    const dbPath = getDatabasePath();

    // Create collections
    db.vouchers = Datastore.create({ filename: path.join(dbPath, 'vouchers.db'), autoload: true });
    db.settings = Datastore.create({ filename: path.join(dbPath, 'settings.db'), autoload: true });

    console.log('Database initialized at:', dbPath);

    // Initialize settings if empty
    initializeSettings();

    return db;
}

async function initializeSettings() {
    try {
        const mentariCounter = await db.settings.findOne({ key: 'pv_counter_mentari' });
        if (!mentariCounter) {
            await db.settings.insert({ key: 'pv_counter_mentari', value: 1 });
        }
        const nesCounter = await db.settings.findOne({ key: 'pv_counter_nes' });
        if (!nesCounter) {
            await db.settings.insert({ key: 'pv_counter_nes', value: 1 });
        }
    } catch (err) {
        console.error('Error initializing settings:', err);
    }
}

// Get next PV counter
async function getNextPVCounter(company = 'mentari') {
    try {
        const key = `pv_counter_${company.toLowerCase()}`;
        const doc = await db.settings.findOne({ key });
        const counter = doc ? parseInt(doc.value) : 1;

        // Increment counter
        await db.settings.update(
            { key },
            { $set: { value: counter + 1 } },
            { upsert: true }
        );

        return counter;
    } catch (error) {
        console.error('Error getting counter:', error);
        return 1;
    }
}

// Save voucher
async function saveVoucher(voucherData) {
    try {
        const totalAmount = voucherData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

        const doc = {
            pv_number: voucherData.pvNumber,
            company: voucherData.company,
            date: voucherData.date,
            pay_to: voucherData.payTo,
            payment_method: voucherData.paymentMethod,
            cheque_number: voucherData.chequeNumber,
            total_amount: totalAmount,
            items: voucherData.items,
            prepared_by: voucherData.preparedBy,
            approved_by: voucherData.approvedBy,
            received_by: voucherData.receivedBy,
            prepared_sig: voucherData.preparedSig,
            approved_sig: voucherData.approvedSig,
            received_sig: voucherData.receivedSig,
            created_at: voucherData.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Check if exists
        const exists = await db.vouchers.findOne({ pv_number: voucherData.pvNumber });

        if (exists) {
            await db.vouchers.update({ pv_number: voucherData.pvNumber }, { $set: doc });
        } else {
            await db.vouchers.insert(doc);
        }

        return { success: true, pvNumber: voucherData.pvNumber };
    } catch (error) {
        console.error('Error saving voucher:', error);
        return { success: false, error: error.message };
    }
}

// Get all vouchers
async function getAllVouchers() {
    try {
        const vouchers = await db.vouchers.find({}).sort({ created_at: -1 });
        return vouchers;
    } catch (error) {
        console.error('Error getting vouchers:', error);
        return [];
    }
}

// Get voucher by PV number
async function getVoucherByPVNumber(pvNumber) {
    try {
        const voucher = await db.vouchers.findOne({ pv_number: pvNumber });
        return voucher;
    } catch (error) {
        console.error('Error getting voucher:', error);
        return null;
    }
}

// Search vouchers
async function searchVouchers(searchTerm) {
    try {
        const regex = new RegExp(searchTerm, 'i');
        const vouchers = await db.vouchers.find({
            $or: [
                { pv_number: regex },
                { pay_to: regex },
                { company: regex }
            ]
        }).sort({ created_at: -1 });

        return vouchers;
    } catch (error) {
        console.error('Error searching vouchers:', error);
        return [];
    }
}

// Delete voucher
async function deleteVoucher(pvNumber) {
    try {
        await db.vouchers.remove({ pv_number: pvNumber }, { multi: false });
        return { success: true };
    } catch (error) {
        console.error('Error deleting voucher:', error);
        return { success: false, error: error.message };
    }
}

// Get database stats
async function getDatabaseStats() {
    try {
        const vouchers = await db.vouchers.find({});
        const totalVouchers = vouchers.length;
        const totalAmount = vouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0);
        const counterDoc = await db.settings.findOne({ key: 'pv_counter' });

        return {
            totalVouchers,
            totalAmount,
            nextPVNumber: counterDoc ? counterDoc.value : 1
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        return { totalVouchers: 0, totalAmount: 0, nextPVNumber: 1 };
    }
}

// Backup database
function backupDatabase(backupPath) {
    try {
        const dbPath = getDatabasePath();
        const vouchersPath = path.join(dbPath, 'vouchers.db');
        // For NeDB, just copy the file
        fs.copyFileSync(vouchersPath, backupPath);
        return { success: true };
    } catch (error) {
        console.error('Error backing up database:', error);
        return { success: false, error: error.message };
    }
}

// Clear all data
async function clearAllData() {
    try {
        await db.vouchers.remove({}, { multi: true });
        await db.settings.remove({}, { multi: true });
        await initializeSettings();
        return { success: true };
    } catch (error) {
        console.error('Error clearing database:', error);
        return { success: false, error: error.message };
    }
}

// Close database
function closeDatabase() {
    if (db.vouchers) db.vouchers.compactDatafile();
    if (db.settings) db.settings.compactDatafile();
}

module.exports = {
    initDatabase,
    getNextPVCounter,
    saveVoucher,
    getAllVouchers,
    getVoucherByPVNumber,
    searchVouchers,
    deleteVoucher,
    getDatabaseStats,
    backupDatabase,
    closeDatabase,
    getDatabasePath,
    clearAllData
};

