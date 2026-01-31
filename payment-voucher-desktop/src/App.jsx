import React, { useState, useRef, useEffect } from 'react';
import { Printer, Plus, Trash2, Upload, Download, Save, FolderOpen, FileText, History, Search, X } from 'lucide-react';

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

// History Modal Component
const HistoryModal = ({ isOpen, onClose, onLoad, companies }) => {
    const [vouchers, setVouchers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    useEffect(() => {
        if (isOpen) {
            loadVouchers();
            setSelectedIds(new Set());
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

    const toggleSelectAll = () => {
        if (selectedIds.size === vouchers.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(vouchers.map(v => v.pv_number)));
        }
    };

    const toggleSelect = (pvNumber, e) => {
        e.stopPropagation();
        const newSelected = new Set(selectedIds);
        if (newSelected.has(pvNumber)) {
            newSelected.delete(pvNumber);
        } else {
            newSelected.add(pvNumber);
        }
        setSelectedIds(newSelected);
    };

    const handleResetDatabase = async () => {
        if (confirm('CRITICAL ACTION: Are you sure you want to delete ALL data in the database? This will remove all vouchers and reset counters to 1. This action cannot be undone.')) {
            if (ipcRenderer) {
                const result = await ipcRenderer.invoke('clear-all-data');
                if (result.success) {
                    alert('Database has been completely reset.');
                    loadVouchers();
                } else {
                    alert('Error resetting database: ' + result.error);
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

    const handleExportPDFSelected = async () => {
        const selectedVouchers = vouchers.filter(v => selectedIds.has(v.pv_number));
        if (selectedVouchers.length === 0) return;

        const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(tag => tag.outerHTML)
            .join('\n');

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const parts = dateString.split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        };

        const renderVoucherHTML = (v) => {
            const companyData = companies[v.company];
            const totalAmount = v.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);

            return `
                <div class="print-voucher-wrapper page-break" style="margin-bottom: 40px; background: white; width: 100%;">
                    <div class="bg-white p-6 text-sm">
                        <div class="relative border-2 border-gray-800 p-6">
                            <div class="text-right text-sm mb-4">
                                PV No: ${v.pv_number}
                            </div>

                            <div class="text-center border-b-2 border-gray-800 pb-4 mb-4">
                                <div style="font-size: 16px; font-weight: bold;">PAYMENT VOUCHER 2026</div>
                                <div class="flex justify-center my-3">
                                    <img src="${companyData.logo}" alt="${companyData.name}" crossorigin="anonymous" style="height: 80px; object-fit: contain;" />
                                </div>
                                <div class="text-base font-bold">${companyData.name}</div>
                                <div class="text-sm text-gray-800 mt-1 font-bold">${companyData.reg}</div>
                            </div>

                            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid #000; padding-bottom: 8px; font-size: 14px;">
                                <div><span class="font-semibold">Pay To:</span> ${v.pay_to || ''}</div>
                                <div><span class="font-semibold">Date:</span> ${formatDate(v.date)}</div>
                            </div>

                            <div class="mb-4 text-sm font-medium">
                                <span class="font-semibold">Payment by:</span> <span class="capitalize ml-1">${v.payment_method}</span>
                                ${v.payment_method === 'cheque' ? `<div style="margin-top: 4px; font-weight: 600; font-style: italic;">Cheque No: ${v.cheque_number || ''}</div>` : ''}
                                ${v.payment_method === 'online' ? `<div style="margin-top: 4px; font-style: italic;">Bank: ${v.bank_name || ''}</div>` : ''}
                            </div>

                            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
                                <thead>
                                    <tr>
                                        <th style="border: 1px solid black; padding: 8px; background: #f3f4f6; text-align: center; width: 40px;">NO.</th>
                                        <th style="border: 1px solid black; padding: 8px; background: #f3f4f6; text-align: left;">DESCRIPTION</th>
                                        <th style="border: 1px solid black; padding: 8px; background: #f3f4f6; text-align: left; width: 120px;">INV/BILL NO.</th>
                                        <th style="border: 1px solid black; padding: 8px; background: #f3f4f6; text-align: right; width: 100px;">AMOUNT (RM)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${v.items.map((item, idx) => `
                                        <tr>
                                            <td style="border: 1px solid black; padding: 6px; text-align: center;">${idx + 1}</td>
                                            <td style="border: 1px solid black; padding: 6px;">${item.description}</td>
                                            <td style="border: 1px solid black; padding: 6px;">${item.invNo}</td>
                                            <td style="border: 1px solid black; padding: 6px; text-align: right;">${item.amount ? parseFloat(item.amount).toFixed(2) : ''}</td>
                                        </tr>
                                    `).join('')}
                                    <tr style="background: #e5e7eb;">
                                        <td colspan="3" style="border: 1px solid black; padding: 8px; text-align: right; font-weight: bold;">TOTAL RM</td>
                                        <td style="border: 1px solid black; padding: 8px; text-align: right; font-weight: bold;">${totalAmount}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style="display: flex; border: 1px solid black; margin-top: 20px;">
                                <div style="flex: 1; border-right: 1px solid black; padding: 10px; text-align: center;">
                                    <div style="font-weight: bold; font-size: 13px; margin-bottom: 5px;">PREPARED BY</div>
                                    ${v.prepared_sig ? `<img src="${v.prepared_sig}" crossorigin="anonymous" style="height: 50px; max-width: 100%; object-fit: contain; margin: 0 auto;" />` : `<div style="height: 50px;"></div>`}
                                    <div style="font-size: 12px; margin-top: 5px;">${v.prepared_by || ''}</div>
                                </div>
                                <div style="flex: 1; border-right: 1px solid black; padding: 10px; text-align: center;">
                                    <div style="font-weight: bold; font-size: 13px; margin-bottom: 5px;">APPROVED BY</div>
                                    ${v.approved_sig ? `<img src="${v.approved_sig}" crossorigin="anonymous" style="height: 50px; max-width: 100%; object-fit: contain; margin: 0 auto;" />` : `<div style="height: 50px;"></div>`}
                                    <div style="font-size: 12px; margin-top: 5px;">${v.approved_by || ''}</div>
                                </div>
                                <div style="flex: 1; padding: 10px; text-align: center;">
                                    <div style="font-weight: bold; font-size: 13px; margin-bottom: 5px;">RECEIVED BY</div>
                                    ${v.received_sig ? `<img src="${v.received_sig}" crossorigin="anonymous" style="height: 50px; max-width: 100%; object-fit: contain; margin: 0 auto;" />` : `<div style="height: 50px;"></div>`}
                                    <div style="font-size: 12px; margin-top: 5px;">${v.received_by || ''}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };

        const allVouchersContent = selectedVouchers.map(v => renderVoucherHTML(v)).join('');

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Print Payment Vouchers</title>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
                    ${styleTags}
                    <style>
                        @page { size: A4; margin: 0; }
                        body { 
                            margin: 0; 
                            padding: 20px; 
                            background: white !important; 
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important;
                            font-family: 'Roboto', Arial, sans-serif;
                            height: auto !important; 
                            overflow: visible !important;
                        }
                        /* FORCE VISIBILITY */
                        * { visibility: visible !important; opacity: 1 !important; }
                        .page-break { page-break-after: always; break-after: page; }
                        .print-voucher-wrapper { width: 100%; max-width: 800px; margin: 0 auto; display: block !important; }
                        img { -webkit-print-color-adjust: exact; display: block !important; }
                    </style>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body>
                    ${allVouchersContent}
                </body>
            </html>
        `;

        if (ipcRenderer) {
            const result = await ipcRenderer.invoke('generate-voucher-pdf', {
                html,
                filename: `Vouchers-Batch-${new Date().getTime()}.pdf`
            });
            if (result.success) {
                alert(`PDF exported successfully to: ${result.path}`);
            } else if (result.error) {
                alert(`PDF export failed: ${result.error}`);
            }
        }
    };

    const handlePrintSelected = () => {
        const selectedVouchers = vouchers.filter(v => selectedIds.has(v.pv_number));
        if (selectedVouchers.length === 0) return;

        const newWindow = window.open('', '_blank', 'width=850,height=1100');

        // Collect all styles but prioritize Tailwind and fonts
        const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(tag => tag.outerHTML)
            .join('\n');

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const parts = dateString.split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        };

        const renderVoucherHTML = (v) => {
            const companyData = companies[v.company];
            const totalAmount = v.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);

            return `
                <div class="print-voucher-wrapper page-break" style="margin-bottom: 40px; background: white; width: 100%;">
                    <div class="bg-white p-6 text-sm">
                        <div class="relative border-2 border-gray-800 p-6">
                            <div class="text-right text-sm mb-4">
                                PV No: ${v.pv_number}
                            </div>

                            <div class="text-center border-b-2 border-gray-800 pb-4 mb-4">
                                <div style="font-size: 16px; font-weight: bold;">PAYMENT VOUCHER 2026</div>
                                <div class="flex justify-center my-3">
                                    <img src="${companyData.logo}" alt="${companyData.name}" crossorigin="anonymous" style="height: 80px; object-fit: contain;" />
                                </div>
                                <div class="text-base font-bold">${companyData.name}</div>
                                <div class="text-sm text-gray-800 mt-1 font-bold">${companyData.reg}</div>
                            </div>

                            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 2px solid #000; padding-bottom: 8px;">
                                <div><span class="font-semibold">Pay To:</span> ${v.pay_to || ''}</div>
                                <div><span class="font-semibold">Date:</span> ${formatDate(v.date)}</div>
                            </div>

                            <div class="mb-4 text-sm font-medium">
                                <span class="font-semibold">Payment by:</span> <span class="capitalize ml-1">${v.payment_method}</span>
                                ${v.payment_method === 'cheque' ? `<div style="margin-top: 4px; font-weight: 600; font-style: italic;">Cheque No: ${v.cheque_number || ''}</div>` : ''}
                                ${v.payment_method === 'online' ? `<div style="margin-top: 4px; font-style: italic;">Bank: ${v.bank_name || ''}</div>` : ''}
                            </div>

                            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
                                <thead>
                                    <tr>
                                        <th style="border: 1px solid black; padding: 8px; background: #f3f4f6; text-align: center; width: 40px;">NO.</th>
                                        <th style="border: 1px solid black; padding: 8px; background: #f3f4f6; text-align: left;">DESCRIPTION</th>
                                        <th style="border: 1px solid black; padding: 8px; background: #f3f4f6; text-align: left; width: 120px;">INV/BILL NO.</th>
                                        <th style="border: 1px solid black; padding: 8px; background: #f3f4f6; text-align: right; width: 100px;">AMOUNT (RM)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${v.items.map((item, idx) => `
                                        <tr>
                                            <td style="border: 1px solid black; padding: 6px; text-align: center;">${idx + 1}</td>
                                            <td style="border: 1px solid black; padding: 6px;">${item.description}</td>
                                            <td style="border: 1px solid black; padding: 6px;">${item.invNo}</td>
                                            <td style="border: 1px solid black; padding: 6px; text-align: right;">${item.amount ? parseFloat(item.amount).toFixed(2) : ''}</td>
                                        </tr>
                                    `).join('')}
                                    <tr style="background: #e5e7eb;">
                                        <td colspan="3" style="border: 1px solid black; padding: 8px; text-align: right; font-weight: bold;">TOTAL RM</td>
                                        <td style="border: 1px solid black; padding: 8px; text-align: right; font-weight: bold;">${totalAmount}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style="display: flex; border: 1px solid black; margin-top: 20px;">
                                <div style="flex: 1; border-right: 1px solid black; padding: 10px; text-align: center;">
                                    <div style="font-weight: bold; font-size: 13px; margin-bottom: 5px;">PREPARED BY</div>
                                    ${v.prepared_sig ? `<img src="${v.prepared_sig}" crossorigin="anonymous" style="height: 50px; max-width: 100%; object-fit: contain; margin: 0 auto;" />` : `<div style="height: 50px;"></div>`}
                                    <div style="font-size: 12px; margin-top: 5px;">${v.prepared_by || ''}</div>
                                </div>
                                <div style="flex: 1; border-right: 1px solid black; padding: 10px; text-align: center;">
                                    <div style="font-weight: bold; font-size: 13px; margin-bottom: 5px;">APPROVED BY</div>
                                    ${v.approved_sig ? `<img src="${v.approved_sig}" crossorigin="anonymous" style="height: 50px; max-width: 100%; object-fit: contain; margin: 0 auto;" />` : `<div style="height: 50px;"></div>`}
                                    <div style="font-size: 12px; margin-top: 5px;">${v.approved_by || ''}</div>
                                </div>
                                <div style="flex: 1; padding: 10px; text-align: center;">
                                    <div style="font-weight: bold; font-size: 13px; margin-bottom: 5px;">RECEIVED BY</div>
                                    ${v.received_sig ? `<img src="${v.received_sig}" crossorigin="anonymous" style="height: 50px; max-width: 100%; object-fit: contain; margin: 0 auto;" />` : `<div style="height: 50px;"></div>`}
                                    <div style="font-size: 12px; margin-top: 5px;">${v.received_by || ''}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        };

        const allVouchersContent = selectedVouchers.map(v => renderVoucherHTML(v)).join('');

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Print Payment Vouchers</title>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
                    ${styleTags}
                    <style>
                        @page { size: A4; margin: 0; }
                        body { 
                            margin: 0; 
                            padding: 20px; 
                            background: white !important; 
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important;
                            font-family: 'Roboto', Arial, sans-serif;
                            height: auto !important; 
                            overflow: visible !important;
                        }
                        .page-break { page-break-after: always; break-after: page; }
                        .print-voucher-wrapper { width: 100%; max-width: 800px; margin: 0 auto; display: block !important; }
                        img { -webkit-print-color-adjust: exact; }
                    </style>
                </head>
                <body>
                    ${allVouchersContent}
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                setTimeout(function() { window.close(); }, 500);
                            }, 1500);
                        };
                    </script>
                </body>
            </html>
        `;

        newWindow.document.open();
        newWindow.document.write(html);
        newWindow.document.close();
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
                            onClick={handlePrintSelected}
                            disabled={selectedIds.size === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedIds.size === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm'
                                }`}
                        >
                            <Printer size={18} />
                            Print Selected ({selectedIds.size})
                        </button>
                        <button
                            onClick={handleExportPDFSelected}
                            disabled={selectedIds.size === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedIds.size === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                }`}
                        >
                            <Download size={18} />
                            PDF Selected ({selectedIds.size})
                        </button>
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
                        <button
                            onClick={handleResetDatabase}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors"
                            title="Completely reset the database"
                        >
                            <Trash2 size={18} />
                            Reset DB
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by PV Number, Pay To, or Company..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                            />
                        </div>
                        <button
                            onClick={toggleSelectAll}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 bg-white"
                        >
                            {selectedIds.size === vouchers.length ? 'Deselect All' : 'Select All'}
                        </button>
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
                                        <th className="px-4 py-3 w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.size === vouchers.length && vouchers.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                            />
                                        </th>
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
                                            className={`hover:bg-blue-50 cursor-pointer transition-colors group ${selectedIds.has(voucher.pv_number) ? 'bg-blue-50/50' : ''}`}
                                        >
                                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(voucher.pv_number)}
                                                    onChange={(e) => toggleSelect(voucher.pv_number, e)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{voucher.pv_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {(() => {
                                                    const parts = voucher.date.split('-');
                                                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                                })()}
                                            </td>
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
                    <div>Total Vouchers: {vouchers.length} | Selected: {selectedIds.size}</div>
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
    const [chequeNumber, setChequeNumber] = useState('');
    const [items, setItems] = useState([{ description: '', invNo: '', amount: '' }]);
    const [bankName, setBankName] = useState('');
    const [isOtherBank, setIsOtherBank] = useState(false);
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

    const [logoBase64, setLogoBase64] = useState({
        mentari: new URL('mentari-logo.png', window.location.href).href,
        nes: new URL('nes-logo.jpg', window.location.href).href
    });

    useEffect(() => {
        const loadLogos = async () => {
            const loadLogo = async (url) => {
                try {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                } catch (e) {
                    console.error("Failed to load logo", url, e);
                    return url;
                }
            };

            // Only load if we are likely in an environment where fetch works (browser/electron renderer)
            const mentari = await loadLogo(new URL('mentari-logo.png', window.location.href).href);
            const nes = await loadLogo(new URL('nes-logo.jpg', window.location.href).href);
            setLogoBase64({ mentari, nes });
        };
        loadLogos();
    }, []);

    const companies = {
        mentari: {
            name: 'MENTARI INFINITI SDN BHD',
            reg: '(1175141-K)',
            logo: logoBase64.mentari
        },
        nes: {
            name: 'NES SOLUTION & NETWORK SDN BHD',
            reg: '(1545048-W)',
            logo: logoBase64.nes
        }
    };

    // Initialize logic
    useEffect(() => {
        initApp(company);
    }, [company]);

    const initApp = async (currentCompany) => {
        if (ipcRenderer) {
            // Get next PV counter from DB
            const result = await ipcRenderer.invoke('get-next-pv-counter', currentCompany);
            if (result.success) {
                setPvCounter(result.counter);
            }
        }
    };

    // Generate automatic PV number
    const generatePVNumber = () => {
        const companyCode = company === 'mentari' ? 'MI' : 'NES';
        const counter = String(pvCounter).padStart(4, '0');
        return `${companyCode}-${counter}`;
    };

    // Format date for display d/m/y
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
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
            ipcRenderer.on('export-pdf', handleExportPDF);
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
                const result = await ipcRenderer.invoke('get-next-pv-counter', company);
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
        setChequeNumber('');
        setItems([{ description: '', invNo: '', amount: '' }]);
        setBankName('');
        setIsOtherBank(false);
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
            chequeNumber,
            bankName,
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

    const handleSaveAsVoucher = async () => {
        if (!ipcRenderer) {
            alert('Save feature only available in desktop app');
            return;
        }

        if (confirm('Save this as a NEW voucher? (Will generate a new PV Number)')) {
            // Get next counter for current company
            const resultCounter = await ipcRenderer.invoke('get-next-pv-counter', company);
            if (resultCounter.success) {
                const newCounter = resultCounter.counter;
                // Generate new PV Number
                const counterStr = String(newCounter).padStart(4, '0');
                const companyCode = company === 'mentari' ? 'MI' : 'NES';
                const newPvNumber = `${companyCode}-${counterStr}`;

                const voucherData = {
                    company,
                    pvNumber: newPvNumber,
                    date,
                    payTo,
                    paymentMethod,
                    chequeNumber,
                    bankName,
                    items,
                    preparedBy,
                    approvedBy,
                    receivedBy,
                    preparedSig,
                    approvedSig,
                    receivedSig,
                    createdAt: new Date().toISOString() // Force new creation date
                };

                const resultSave = await ipcRenderer.invoke('save-voucher-db', voucherData);
                if (resultSave.success) {
                    setPvCounter(newCounter);
                    setPvNumber(newPvNumber);
                    showStatus(`Saved as new voucher: ${newPvNumber}`);
                } else {
                    alert('Error saving: ' + resultSave.error);
                }
            }
        }
    };

    const handleLoadVoucher = (data) => {
        setCompany(data.company);
        setPvNumber(data.pv_number);
        // Extract counter from PV number if needed, or just keep current counter
        setDate(data.date);
        setPayTo(data.pay_to);
        setPaymentMethod(data.payment_method);
        setChequeNumber(data.cheque_number || '');
        const loadedBank = data.bank_name || '';
        const predefinedBanks = ['Maybank', 'CIMB', 'Public Bank', 'RHB', 'Hong Leong', 'AmBank', 'UOB', 'OCBC', 'Alliance Bank', 'Affin Bank', 'BSN', 'Bank Islam', 'Bank Muamalat'];
        setBankName(loadedBank);
        setIsOtherBank(loadedBank !== '' && !predefinedBanks.includes(loadedBank));
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

    // Helper to get HTML for printing/PDF
    const getVoucherHTML = () => {
        const printContent = document.getElementById('voucher-preview');
        if (!printContent) return null;

        const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(tag => tag.outerHTML)
            .join('\n');

        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Payment Voucher - ${pvNumber}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
                    ${styleTags}
                    <style>
                        @page { size: A4; margin: 0; }
                        body {
                            margin: 0;
                            padding: 40px;
                            background: white !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            font-family: 'Roboto', Arial, sans-serif;
                            height: auto !important;
                            overflow: visible !important;
                        }
                        /* FORCE VISIBILITY - This fixes the blank PDF issue */
                        * { visibility: visible !important; opacity: 1 !important; }
                        .print-container {
                            width: 100%;
                            max-width: 800px;
                            margin: 0 auto;
                            display: block !important;
                        }
                        #voucher-preview { padding: 0 !important; }
                        img { -webkit-print-color-adjust: exact; display: block !important; }
                    </style>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="bg-white">
                    <div class="print-container">
                        ${printContent.innerHTML}
                    </div>
                </body>
            </html>
        `;
    };

    const handlePrint = () => {
        const html = getVoucherHTML();
        if (!html) return;

        const printWindow = window.open('', '_blank', 'width=850,height=1100');
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                setTimeout(() => printWindow.close(), 500);
            }, 1000);
        };
    };

    const handleExportPDF = async () => {
        const html = getVoucherHTML();
        if (!html) return;

        if (ipcRenderer) {
            setSavedStatus('Generating PDF...');
            const result = await ipcRenderer.invoke('generate-voucher-pdf', {
                html,
                filename: `Payment-Voucher-${pvNumber}.pdf`
            });

            if (result.success) {
                setSavedStatus(`PDF saved successfully to: ${result.path}`);
                setTimeout(() => setSavedStatus(''), 5000);
            } else if (result.error) {
                alert(`Export failed: ${result.error}`);
                setSavedStatus('');
            } else {
                setSavedStatus('');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with desktop controls */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-center items-center">
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
                            title="Save current voucher (Ctrl+S)"
                        >
                            <Save size={18} />
                            Save
                        </button>
                        <button
                            onClick={handlePrint}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2"
                            title="Print current preview"
                        >
                            <Printer size={18} />
                            Print
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded flex items-center gap-2"
                            title="Save as PDF now"
                        >
                            <Download size={18} />
                            Export PDF
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
                                        placeholder="XXX-000"
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
                                {paymentMethod === 'cheque' && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={chequeNumber}
                                            onChange={(e) => setChequeNumber(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                            placeholder="Enter Cheque Number"
                                        />
                                    </div>
                                )}
                                {paymentMethod === 'online' && (
                                    <div className="mt-2">
                                        <select
                                            value={isOtherBank ? 'Other' : bankName}
                                            onChange={(e) => {
                                                if (e.target.value === 'Other') {
                                                    setIsOtherBank(true);
                                                    setBankName('');
                                                } else {
                                                    setIsOtherBank(false);
                                                    setBankName(e.target.value);
                                                }
                                            }}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                        >
                                            <option value="">Select Bank</option>
                                            <option value="Maybank">Maybank</option>
                                            <option value="CIMB">CIMB Bank</option>
                                            <option value="Public Bank">Public Bank</option>
                                            <option value="RHB">RHB Bank</option>
                                            <option value="Hong Leong">Hong Leong Bank</option>
                                            <option value="AmBank">AmBank</option>
                                            <option value="UOB">UOB Bank</option>
                                            <option value="OCBC">OCBC Bank</option>
                                            <option value="Alliance Bank">Alliance Bank</option>
                                            <option value="Affin Bank">Affin Bank</option>
                                            <option value="BSN">BSN</option>
                                            <option value="Bank Islam">Bank Islam</option>
                                            <option value="Bank Muamalat">Bank Muamalat</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {isOtherBank && (
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                                placeholder="Enter Bank Name"
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                            />
                                        )}
                                    </div>
                                )}
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
                                    <div className="flex gap-1 mt-2">
                                        <button
                                            onClick={() => preparedRef.current.click()}
                                            className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded flex items-center justify-center gap-1"
                                        >
                                            <Upload size={14} /> Signature
                                        </button>
                                        {preparedSig && (
                                            <button
                                                onClick={() => setPreparedSig(null)}
                                                className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded"
                                                title="Clear Signature"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
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
                                    <div className="flex gap-1 mt-2">
                                        <button
                                            onClick={() => approvedRef.current.click()}
                                            className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded flex items-center justify-center gap-1"
                                        >
                                            <Upload size={14} /> Signature
                                        </button>
                                        {approvedSig && (
                                            <button
                                                onClick={() => setApprovedSig(null)}
                                                className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded"
                                                title="Clear Signature"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
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
                                    <div className="flex gap-1 mt-2">
                                        <button
                                            onClick={() => receivedRef.current.click()}
                                            className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded flex items-center justify-center gap-1"
                                        >
                                            <Upload size={14} /> Signature
                                        </button>
                                        {receivedSig && (
                                            <button
                                                onClick={() => setReceivedSig(null)}
                                                className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded"
                                                title="Clear Signature"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                            <div id="voucher-preview" className="bg-white p-6 text-sm">
                                <div className="relative border-2 border-gray-800 p-6">
                                    <div className="text-right text-sm mb-4">
                                        PV No: {pvNumber}
                                    </div>

                                    <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
                                        <div className="text-lg font-bold">PAYMENT VOUCHER 2026</div>
                                        <div className="flex justify-center my-3">
                                            <img src={companies[company].logo} alt={companies[company].name} className="h-20 object-contain" />
                                        </div>
                                        <div className="text-base font-bold">{companies[company].name}</div>
                                        <div className="text-sm text-gray-800 mt-1 font-bold">{companies[company].reg}</div>
                                    </div>

                                    <div className="flex justify-between mb-4 border-b-2 border-gray-800 pb-2 text-sm">
                                        <div>
                                            <span className="font-semibold">Pay To:</span> {payTo || '_________________'}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Date:</span> {formatDate(date)}
                                        </div>
                                    </div>

                                    <div className="mb-4 text-sm">
                                        <span className="font-semibold">Payment by:</span> <span className="capitalize ml-1">{paymentMethod}</span>
                                        {paymentMethod === 'cheque' && (
                                            <div className="mt-1 font-semibold italic">
                                                Cheque No: {chequeNumber || ''}
                                            </div>
                                        )}
                                        {paymentMethod === 'online' && (
                                            <div className="mt-1 italic">
                                                Bank: {bankName || ''}
                                            </div>
                                        )}
                                    </div>

                                    <table className="w-full border-collapse text-sm mb-4">
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

                                    <div className="flex border border-gray-800 text-sm">
                                        <div className="flex-1 border-r border-gray-800 p-3 text-center">
                                            <div className="font-semibold mb-2">PREPARED BY</div>
                                            {preparedSig ? (
                                                <img src={preparedSig} alt="Signature" className="max-w-full h-12 mx-auto mb-2" />
                                            ) : (
                                                <div className="h-12"></div>
                                            )}
                                            <div className="text-xs">{preparedBy}</div>
                                        </div>
                                        <div className="flex-1 border-r border-gray-800 p-3 text-center">
                                            <div className="font-semibold mb-2">APPROVED BY</div>
                                            {approvedSig ? (
                                                <img src={approvedSig} alt="Signature" className="max-w-full h-12 mx-auto mb-2" />
                                            ) : (
                                                <div className="h-12"></div>
                                            )}
                                            <div className="text-xs">{approvedBy}</div>
                                        </div>
                                        <div className="flex-1 p-3 text-center">
                                            <div className="font-semibold mb-2">RECEIVED BY</div>
                                            {receivedSig ? (
                                                <img src={receivedSig} alt="Signature" className="max-w-full h-12 mx-auto mb-2" />
                                            ) : (
                                                <div className="h-12"></div>
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
                companies={companies}
            />
        </div>
    );
};

export default PaymentVoucherDesktop;
