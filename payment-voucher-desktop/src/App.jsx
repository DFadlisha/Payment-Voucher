import React, { useState, useRef, useEffect } from 'react';
import { Printer, Plus, Trash2, Upload, Download, Save, FolderOpen, FileText, History, Search, X } from 'lucide-react';

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

// History Modal Component
const HistoryModal = ({ isOpen, onClose, onLoad }) => {
    const [vouchers, setVouchers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadVouchers();
        }
    }, [isOpen]);

    const loadVouchers = async () => {
        setLoading(true);
        if (ipcRenderer) {
            const result = await ipcRenderer.invoke('get-all-vouchers');
            if (result.success) {
                setVouchers(result.vouchers);
            }
        }
        setLoading(false);
    };

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (ipcRenderer) {
            const result = await ipcRenderer.invoke('search-vouchers', term);
            if (result.success) {
                setVouchers(result.vouchers);
            }
        }
    };

    const handleDelete = async (pvNumber, e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete ${pvNumber}?`)) {
            if (ipcRenderer) {
                const result = await ipcRenderer.invoke('delete-voucher', pvNumber);
                if (result.success) {
                    loadVouchers();
                }
            }
        }
    };

    const handleExportExcel = async () => {
        if (ipcRenderer) {
            const result = await ipcRenderer.invoke('export-vouchers-excel', vouchers);
            if (result.success) {
                alert(`Exported successfully to ${result.path}`);
            } else if (result.error) {
                alert(`Export failed: ${result.error}`);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <History size={24} className="text-blue-600" /> Voucher Management
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportExcel}
                            disabled={vouchers.length === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vouchers.length === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                                }`}
                        >
                            <Download size={18} />
                            Export Excel
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by PV Number, Pay To, or Company..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                            Loading Vouchers...
                        </div>
                    ) : vouchers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
                            <FileText size={48} className="text-gray-300 mb-4" />
                            <p className="text-lg">No vouchers found</p>
                            <p className="text-sm">Try a different search term or create a new voucher</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">PV Number</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Pay To</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Amount (RM)</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {vouchers.map((voucher) => (
                                        <tr
                                            key={voucher.id || voucher.pv_number}
                                            onClick={() => { onLoad(voucher); onClose(); }}
                                            className="hover:bg-blue-50 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{voucher.pv_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{voucher.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${voucher.company === 'mentari'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {voucher.company.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{voucher.pay_to}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                                {voucher.total_amount?.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={(e) => handleDelete(voucher.pv_number, e)}
                                                    className="text-red-400 hover:text-red-600 p-2 transition-colors rounded-full hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center text-sm text-gray-500">
                    <div>Total Vouchers: {vouchers.length}</div>
                    <div className="font-medium text-gray-800">
                        Total Amount: RM {vouchers.reduce((sum, v) => sum + (v.total_amount || 0), 0).toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaymentVoucherDesktop = () => {
    const [company, setCompany] = useState('mentari');
    const [pvNumber, setPvNumber] = useState('');
    const [pvCounter, setPvCounter] = useState(1);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [payTo, setPayTo] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cheque');
    const [items, setItems] = useState([{ description: '', invNo: '', amount: '' }]);
    const [preparedBy, setPreparedBy] = useState('');
    const [approvedBy, setApprovedBy] = useState('');
    const [receivedBy, setReceivedBy] = useState('');
    const [preparedSig, setPreparedSig] = useState(null);
    const [approvedSig, setApprovedSig] = useState(null);
    const [receivedSig, setReceivedSig] = useState(null);
    const [savedStatus, setSavedStatus] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    const preparedRef = useRef();
    const approvedRef = useRef();
    const receivedRef = useRef();

    const companies = {
        mentari: {
            name: 'MENTARI INFINITI SDN BHD',
            reg: '(1175141-K)',
            logo: new URL('mentari-logo.png', window.location.href).href
        },
        nes: {
            name: 'NES SOLUTION & NETWORK SDN BHD',
            reg: '(1545048-W)',
            logo: new URL('nes-logo.jpg', window.location.href).href
        }
    };

    // Initialize logic
    useEffect(() => {
        initApp();
    }, []);

    const initApp = async () => {
        if (ipcRenderer) {
            // Get next PV counter from DB
            const result = await ipcRenderer.invoke('get-next-pv-counter');
            if (result.success) {
                setPvCounter(result.counter);
            }
        }
    };

    // Generate automatic PV number
    const generatePVNumber = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const counter = String(pvCounter).padStart(3, '0');
        return `PV-${year}-${month}-${counter}`;
    };

    // Update PV number when counter changes
    useEffect(() => {
        setPvNumber(generatePVNumber());
    }, [pvCounter]);

    // Listen for menu events from Electron
    useEffect(() => {
        if (ipcRenderer) {
            ipcRenderer.on('new-voucher', handleNewVoucher);
            ipcRenderer.on('save-voucher', handleSaveVoucher);
            ipcRenderer.on('export-pdf', generatePDF);
            ipcRenderer.on('show-history', () => setShowHistory(true));

            return () => {
                ipcRenderer.removeAllListeners('new-voucher');
                ipcRenderer.removeAllListeners('save-voucher');
                ipcRenderer.removeAllListeners('export-pdf');
                ipcRenderer.removeAllListeners('show-history');
            };
        }
    }, []);

    const handleNewVoucher = async () => {
        if (confirm('Create new voucher? Any unsaved changes will be lost.')) {
            resetForm();
            if (ipcRenderer) {
                const result = await ipcRenderer.invoke('get-next-pv-counter');
                if (result.success) {
                    setPvCounter(result.counter);
                    showStatus('New voucher created');
                }
            }
        }
    };

    const resetForm = () => {
        setCompany('mentari');
        setDate(new Date().toISOString().split('T')[0]);
        setPayTo('');
        setPaymentMethod('cheque');
        setItems([{ description: '', invNo: '', amount: '' }]);
        setPreparedBy('');
        setApprovedBy('');
        setReceivedBy('');
        setPreparedSig(null);
        setApprovedSig(null);
        setReceivedSig(null);
    };

    const handleSaveVoucher = async () => {
        if (!ipcRenderer) {
            alert('Save feature only available in desktop app');
            return;
        }

        const voucherData = {
            company,
            pvNumber,
            date,
            payTo,
            paymentMethod,
            items,
            preparedBy,
            approvedBy,
            receivedBy,
            preparedSig,
            approvedSig,
            receivedSig
        };

        // Use database save
        const result = await ipcRenderer.invoke('save-voucher-db', voucherData);
        if (result.success) {
            showStatus('Voucher saved to database!');
        } else {
            alert('Error saving: ' + result.error);
        }
    };

    const handleLoadVoucher = (data) => {
        setCompany(data.company);
        setPvNumber(data.pv_number);
        // Extract counter from PV number if needed, or just keep current counter
        setDate(data.date);
        setPayTo(data.pay_to);
        setPaymentMethod(data.payment_method);
        setItems(data.items);
        setPreparedBy(data.prepared_by || '');
        setApprovedBy(data.approved_by || '');
        setReceivedBy(data.received_by || '');
        setPreparedSig(data.prepared_sig);
        setApprovedSig(data.approved_sig);
        setReceivedSig(data.received_sig);
        showStatus('Voucher loaded successfully!');
    };

    const showStatus = (message) => {
        setSavedStatus(message);
        setTimeout(() => setSavedStatus(''), 3000);
    };

    const addItem = () => {
        setItems([...items, { description: '', invNo: '', amount: '' }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleFileUpload = (e, setter) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);
    };

    const generatePDF = () => {
        const printContent = document.getElementById('voucher-preview');
        const newWindow = window.open('', '', 'width=800,height=600');

        newWindow.document.write(`
      <html>
        <head>
          <title>Payment Voucher - ${pvNumber}</title>
          <base href="${window.location.href}">
          <style>
            @page { size: A4; margin: 0; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              margin: 0;
              background: white;
            }
            .voucher {
              max-width: 800px;
              margin: 0 auto;
              border: 2px solid #333;
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 72px;
              font-weight: bold;
              color: #333;
              margin: 10px 0;
            }
            .company-name {
              font-size: 18px;
              font-weight: bold;
              margin: 5px 0;
            }
            .reg-number {
              font-size: 14px;
              color: #666;
            }
            .pv-number {
              position: absolute;
              top: 40px;
              right: 40px;
              font-size: 14px;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
            }
            .payment-methods {
              margin: 15px 0;
            }
            .checkbox {
              margin-right: 5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #333;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
              background-color: #e0e0e0;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 40px;
              border: 1px solid #333;
            }
            .sig-box {
              flex: 1;
              padding: 20px;
              text-align: center;
              border-right: 1px solid #333;
              min-height: 100px;
            }
            .sig-box:last-child {
              border-right: none;
            }
            .sig-image {
              max-width: 150px;
              max-height: 60px;
              margin: 10px auto;
            }
            .sig-label {
              font-weight: bold;
              margin-bottom: 10px;
            }
            @media print {
              body { padding: 0; }
              .pv-number { position: absolute; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              // Small delay to ensure all assets (especially logos) are rendered
              setTimeout(function() {
                window.print();
                // Close the print window after printing starts
                setTimeout(function() { window.close(); }, 500);
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
        newWindow.document.close();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with desktop controls */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Payment Voucher Generator
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={handleNewVoucher}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
                            title="New Voucher (Ctrl+N)"
                        >
                            <FileText size={18} />
                            New
                        </button>
                        <button
                            onClick={() => setShowHistory(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all shadow-sm"
                            title="Manage Vouchers (Ctrl+H)"
                        >
                            <FolderOpen size={18} />
                            Manage Vouchers
                        </button>
                        <button
                            onClick={handleSaveVoucher}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
                            title="Save Voucher (Ctrl+S)"
                        >
                            <Save size={18} />
                            Save
                        </button>
                        <button
                            onClick={generatePDF}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded flex items-center gap-2"
                            title="Export PDF (Ctrl+P)"
                        >
                            <Printer size={18} />
                            Print
                        </button>
                    </div>
                </div>

                {/* Status message */}
                {savedStatus && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {savedStatus}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-xl p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Input Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company
                                </label>
                                <select
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="mentari">Mentari Infiniti Sdn. Bhd</option>
                                    <option value="nes">NES Solution & Network Sdn. Bhd</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        PV Number (Auto-generated)
                                    </label>
                                    <input
                                        type="text"
                                        value={pvNumber}
                                        readOnly
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                                        placeholder="PV-YYYY-MM-XXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pay To
                                </label>
                                <input
                                    type="text"
                                    value={payTo}
                                    onChange={(e) => setPayTo(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Recipient name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method
                                </label>
                                <div className="flex gap-4">
                                    {['cheque', 'cash', 'online'].map((method) => (
                                        <label key={method} className="flex items-center">
                                            <input
                                                type="radio"
                                                value={method}
                                                checked={paymentMethod === method}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="mr-2"
                                            />
                                            <span className="capitalize">{method}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Items
                                    </label>
                                    <button
                                        onClick={addItem}
                                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                                    >
                                        <Plus size={16} /> Add Item
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex gap-2 items-start">
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                placeholder="Description"
                                                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={item.invNo}
                                                onChange={(e) => updateItem(index, 'invNo', e.target.value)}
                                                placeholder="Inv/Bill No"
                                                className="w-32 border border-gray-300 rounded px-3 py-2 text-sm"
                                            />
                                            <input
                                                type="number"
                                                value={item.amount}
                                                onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                                placeholder="Amount"
                                                className="w-28 border border-gray-300 rounded px-3 py-2 text-sm"
                                                step="0.01"
                                            />
                                            {items.length > 1 && (
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-600 hover:text-red-700 p-2"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prepared By
                                    </label>
                                    <input
                                        type="text"
                                        value={preparedBy}
                                        onChange={(e) => setPreparedBy(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                        placeholder="Name"
                                    />
                                    <input
                                        ref={preparedRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, setPreparedSig)}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => preparedRef.current.click()}
                                        className="mt-2 w-full text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded flex items-center justify-center gap-1"
                                    >
                                        <Upload size={14} /> Signature
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Approved By
                                    </label>
                                    <input
                                        type="text"
                                        value={approvedBy}
                                        onChange={(e) => setApprovedBy(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                        placeholder="Name"
                                    />
                                    <input
                                        ref={approvedRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, setApprovedSig)}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => approvedRef.current.click()}
                                        className="mt-2 w-full text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded flex items-center justify-center gap-1"
                                    >
                                        <Upload size={14} /> Signature
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Received By
                                    </label>
                                    <input
                                        type="text"
                                        value={receivedBy}
                                        onChange={(e) => setReceivedBy(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                        placeholder="Name"
                                    />
                                    <input
                                        ref={receivedRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, setReceivedSig)}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => receivedRef.current.click()}
                                        className="mt-2 w-full text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded flex items-center justify-center gap-1"
                                    >
                                        <Upload size={14} /> Signature
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                            <div id="voucher-preview" className="bg-white p-6 text-sm">
                                <div className="relative border-2 border-gray-800 p-6">
                                    <div className="text-right text-xs mb-4">
                                        PV No: {pvNumber} / {date.split('-')[1]} / {date.split('-')[0]}
                                    </div>

                                    <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
                                        <div className="text-sm font-semibold">PAYMENT VOUCHER 2026</div>
                                        <div className="flex justify-center my-3">
                                            <img src={companies[company].logo} alt={companies[company].name} className="h-20 object-contain" />
                                        </div>
                                        <div className="text-sm font-bold">{companies[company].name}</div>
                                        <div className="text-xs text-gray-600 mt-1">{companies[company].reg}</div>
                                    </div>

                                    <div className="flex justify-between mb-4">
                                        <div>
                                            <span className="font-semibold">Pay To:</span> {payTo || '_________________'}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Date:</span> {date}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="font-semibold mb-1">Payment by:</div>
                                        <div className="flex gap-4">
                                            <label>
                                                <input type="checkbox" checked={paymentMethod === 'cheque'} readOnly /> Cheque
                                            </label>
                                            <label>
                                                <input type="checkbox" checked={paymentMethod === 'cash'} readOnly /> Cash
                                            </label>
                                            <label>
                                                <input type="checkbox" checked={paymentMethod === 'online'} readOnly /> Online
                                            </label>
                                        </div>
                                    </div>

                                    <table className="w-full border-collapse text-xs mb-4">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-800 p-2 bg-gray-100">NO.</th>
                                                <th className="border border-gray-800 p-2 bg-gray-100">DESCRIPTION</th>
                                                <th className="border border-gray-800 p-2 bg-gray-100">INV/BILL NO.</th>
                                                <th className="border border-gray-800 p-2 bg-gray-100">AMOUNT (RM)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="border border-gray-800 p-2 text-center">{index + 1}</td>
                                                    <td className="border border-gray-800 p-2">{item.description}</td>
                                                    <td className="border border-gray-800 p-2">{item.invNo}</td>
                                                    <td className="border border-gray-800 p-2 text-right">
                                                        {item.amount && parseFloat(item.amount).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan="3" className="border border-gray-800 p-2 text-right font-bold bg-gray-200">
                                                    TOTAL RM
                                                </td>
                                                <td className="border border-gray-800 p-2 text-right font-bold bg-gray-200">
                                                    {calculateTotal()}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className="flex border border-gray-800">
                                        <div className="flex-1 border-r border-gray-800 p-3 text-center">
                                            <div className="font-semibold mb-2">PREPARED BY</div>
                                            {preparedSig && (
                                                <img src={preparedSig} alt="Signature" className="max-w-full h-12 mx-auto mb-2" />
                                            )}
                                            <div className="text-xs">{preparedBy}</div>
                                        </div>
                                        <div className="flex-1 border-r border-gray-800 p-3 text-center">
                                            <div className="font-semibold mb-2">APPROVED BY</div>
                                            {approvedSig && (
                                                <img src={approvedSig} alt="Signature" className="max-w-full h-12 mx-auto mb-2" />
                                            )}
                                            <div className="text-xs">{approvedBy}</div>
                                        </div>
                                        <div className="flex-1 p-3 text-center">
                                            <div className="font-semibold mb-2">RECEIVED BY</div>
                                            {receivedSig && (
                                                <img src={receivedSig} alt="Signature" className="max-w-full h-12 mx-auto mb-2" />
                                            )}
                                            <div className="text-xs">{receivedBy}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <HistoryModal
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onLoad={handleLoadVoucher}
            />
        </div>
    );
};

export default PaymentVoucherDesktop;
