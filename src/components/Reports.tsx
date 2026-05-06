import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  UserCircle, 
  Users, 
  Calendar, 
  Clock, 
  Landmark, 
  Download, 
  FileText, 
  Table, 
  FileSpreadsheet,
  ChevronRight,
  X,
  Search,
  RotateCcw
} from 'lucide-react';
import { Sale } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportsProps {
  sales: Sale[];
}

type ReportMode = 'daily' | 'monthly' | 'yearly';

export default function Reports({ sales }: ReportsProps) {
  const [mode, setMode] = useState<ReportMode>('monthly');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchDate, setSearchDate] = useState<string>('');

  const reports = React.useMemo(() => {
    let filteredSales = [...sales];

    // Apply date filter if exists
    if (searchDate) {
      filteredSales = filteredSales.filter(sale => {
        const saleDate = new Date(sale.date).toISOString().split('T')[0];
        return saleDate.includes(searchDate);
      });
    }

    const groupedData: Record<string, { total: number; transactions: number; items: Sale[] }> = {};

    // Sort sales by date descending
    const sortedSales = filteredSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sortedSales.forEach(sale => {
      const date = new Date(sale.date);
      let key = '';
      
      if (mode === 'daily') {
        key = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      } else if (mode === 'monthly') {
        key = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      } else {
        key = 'Tahun ' + date.toLocaleDateString('id-ID', { year: 'numeric' });
      }

      if (!groupedData[key]) {
        groupedData[key] = { total: 0, transactions: 0, items: [] };
      }

      groupedData[key].total += sale.total;
      groupedData[key].transactions += 1;
      groupedData[key].items.push(sale);
    });

    return Object.entries(groupedData).map(([name, data]) => {
      // Split: Modal 50%, Pemilik 20%, Pengelola 30%
      const modal = data.total * 0.5;
      const pemilik = data.total * 0.2;
      const pengelola = data.total * 0.3;

      return {
        name,
        total: data.total,
        transactions: data.transactions,
        items: data.items,
        split: { modal, pemilik, pengelola }
      };
    });
  }, [sales, mode, searchDate]);

  const exportToPDF = (report: any) => {
    const doc = new jsPDF();
    const title = `Laporan Penjualan - ${report.name}`;
    
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Total Omset: Rp ${report.total.toLocaleString('id-ID')}`, 14, 32);
    doc.text(`Jumlah Transaksi: ${report.transactions}`, 14, 38);

    if (mode === 'monthly') {
      doc.text('Bagi Hasil:', 14, 48);
      doc.text(`- Modal (50%): Rp ${report.split.modal.toLocaleString('id-ID')}`, 20, 54);
      doc.text(`- Pemilik (20%): Rp ${report.split.pemilik.toLocaleString('id-ID')}`, 20, 60);
      doc.text(`- Pengelola (30%): Rp ${report.split.pengelola.toLocaleString('id-ID')}`, 20, 66);
    }

    const tableData = report.items.map((sale: Sale, idx: number) => [
      idx + 1,
      new Date(sale.date).toLocaleString('id-ID'),
      sale.items.map(i => `${i.name} (${i.quantity}x)`).join(', '),
      `Rp ${sale.total.toLocaleString('id-ID')}`
    ]);

    autoTable(doc, {
      startY: mode === 'monthly' ? 76 : 48,
      head: [['No', 'Waktu', 'Item', 'Total']],
      body: tableData,
    });

    doc.save(`Laporan_${report.name.replace(/ /g, '_')}.pdf`);
  };

  const exportToExcel = (report: any) => {
    const data = report.items.map((sale: Sale) => ({
      Waktu: new Date(sale.date).toLocaleString('id-ID'),
      Item: sale.items.map(i => `${i.name} (${i.quantity}x)`).join(', '),
      'Total Harga': sale.total
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Penjualan");

    // Add summary
    const summary = [
      [],
      ['Ringkasan', report.name],
      ['Total Omset', report.total],
      ['Total Transaksi', report.transactions]
    ];
    if (mode === 'monthly') {
      summary.push(['Modal (50%)', report.split.modal]);
      summary.push(['Pemilik (20%)', report.split.pemilik]);
      summary.push(['Pengelola (30%)', report.split.pengelola]);
    }
    XLSX.utils.sheet_add_aoa(ws, summary, { origin: -1 });

    XLSX.writeFile(wb, `Laporan_${report.name.replace(/ /g, '_')}.xlsx`);
  };

  const exportToWord = (report: any) => {
    const title = `Laporan Penjualan - ${report.name}`;
    const header = `
      <h1>${title}</h1>
      <p>Total Omset: Rp ${report.total.toLocaleString('id-ID')}</p>
      <p>Jumlah Transaksi: ${report.transactions}</p>
    `;
    
    let profitSharing = '';
    if (mode === 'monthly') {
      profitSharing = `
        <h3>Bagi Hasil</h3>
        <ul>
          <li>Modal (50%): Rp ${report.split.modal.toLocaleString('id-ID')}</li>
          <li>Pemilik (20%): Rp ${report.split.pemilik.toLocaleString('id-ID')}</li>
          <li>Pengelola (30%): Rp ${report.split.pengelola.toLocaleString('id-ID')}</li>
        </ul>
      `;
    }

    const tableRows = report.items.map((sale: Sale, idx: number) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${new Date(sale.date).toLocaleString('id-ID')}</td>
        <td>${sale.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}</td>
        <td>Rp ${sale.total.toLocaleString('id-ID')}</td>
      </tr>
    `).join('');

    const table = `
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th>No</th>
            <th>Waktu</th>
            <th>Item</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head>
      <body>
        ${header}
        ${profitSharing}
        <br/>
        <h3>Detail Transaksi</h3>
        ${table}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_${report.name.replace(/ /g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'daily', label: 'Harian', icon: Clock },
    { id: 'monthly', label: 'Bulanan recap', icon: Calendar },
    { id: 'yearly', label: 'Tahunan', icon: Landmark },
  ] as const;

  if (sales.length === 0) {
    return (
      <div className="p-8 text-center bakery-grid min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <BarChart3 className="w-16 h-16 text-bakery-brown-light opacity-20 mb-4" />
        <p className="text-bakery-brown-light font-medium">Belum ada data transaksi.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bakery-grid min-h-[calc(100vh-64px)] pb-24 overflow-y-auto">
      <div className="bg-bakery-brown p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
        <h2 className="text-2xl font-display font-black text-bakery-orange">Ringkasan Omset</h2>
        <p className="text-sm opacity-80 italic">
          {mode === 'monthly' ? 'Laporan Detail & Bagi Hasil Bulanan' : `Rekapitulasi Penjualan ${mode === 'daily' ? 'Harian' : 'Tahunan'}`}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-bakery-cream p-1.5 rounded-2xl border border-bakery-warm shadow-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id);
                setSearchDate(''); // Reset search when changing view
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                isActive 
                ? 'bg-bakery-orange text-white shadow-lg' 
                : 'text-bakery-brown-light hover:text-bakery-brown'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Date Search Section */}
      <div className="bg-white p-4 rounded-3xl border border-bakery-warm shadow-md space-y-3">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-bakery-brown-light flex items-center gap-2">
            <Search size={12} />
            Cari Berdasarkan Tanggal
          </label>
          {searchDate && (
            <button 
              onClick={() => setSearchDate('')}
              className="text-[10px] font-bold text-bakery-orange flex items-center gap-1"
            >
              <RotateCcw size={10} /> Reset
            </button>
          )}
        </div>
        <input 
          type="date" 
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="w-full p-3 bg-bakery-cream/50 border border-bakery-warm rounded-xl font-bold text-bakery-brown focus:ring-2 focus:ring-bakery-orange/20 outline-none transition-all"
        />
      </div>

      <div className="space-y-6">
        {reports.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-bakery-warm border-dashed">
            <p className="text-bakery-brown-light font-medium italic">Data tidak ditemukan untuk filter ini.</p>
          </div>
        ) : reports.map((report, idx) => (
          <motion.div
            key={report.name + mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-[2.5rem] border border-bakery-warm shadow-xl overflow-hidden"
          >
            <div className="bg-bakery-warm/30 px-6 py-5 border-b border-bakery-warm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-bakery-orange" />
                <h3 className="font-display font-black text-bakery-brown text-lg">{report.name}</h3>
              </div>
              <span className="text-[10px] font-black bg-bakery-orange text-white px-3 py-1 rounded-full uppercase tracking-widest">
                {report.transactions} TRX
              </span>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="text-center pb-4 border-b border-bakery-warm border-dashed">
                <p className="text-[10px] font-black uppercase tracking-widest text-bakery-brown-light mb-1">Total Omset</p>
                <p className="text-4xl font-display font-black text-bakery-brown">Rp {report.total.toLocaleString('id-ID')}</p>
              </div>

              {/* Only show Profit Sharing in Monthly Mode */}
              {mode === 'monthly' && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-bakery-brown-light px-2">Bagi Hasil Akhir Bulan</p>
                  <div className="flex items-center justify-between p-4 bg-bakery-cream rounded-2xl border border-bakery-warm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-bakery-brown text-white rounded-lg">
                        <Wallet size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-bakery-brown-light tracking-wide">Modal (50%)</p>
                        <p className="font-bold text-bakery-brown">Rp {report.split.modal.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-bakery-cream rounded-2xl border border-bakery-warm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-bakery-orange text-white rounded-lg">
                        <UserCircle size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-bakery-brown-light tracking-wide">Pemilik (20%)</p>
                        <p className="font-bold text-bakery-brown">Rp {report.split.pemilik.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-bakery-cream rounded-2xl border border-bakery-warm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-bakery-brown-light text-white rounded-lg">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-bakery-brown-light tracking-wide">Pengelola (30%)</p>
                        <p className="font-bold text-bakery-brown">Rp {report.split.pengelola.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-bakery-warm border-dashed space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-bakery-brown-light">Download & Detail</p>
                  <button 
                    onClick={() => setSelectedReport(report)}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-bakery-orange hover:opacity-80"
                  >
                    Lihat Detail <ChevronRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => exportToPDF(report)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-bakery-warm hover:border-bakery-orange transition-all"
                  >
                    <FileText size={20} className="text-red-500" />
                    <span className="text-[10px] font-bold text-bakery-brown">PDF</span>
                  </button>
                  <button 
                    onClick={() => exportToExcel(report)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-bakery-warm hover:border-bakery-orange transition-all"
                  >
                    <FileSpreadsheet size={20} className="text-green-600" />
                    <span className="text-[10px] font-bold text-bakery-brown">Excel</span>
                  </button>
                  <button 
                    onClick={() => exportToWord(report)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-bakery-warm hover:border-bakery-orange transition-all"
                  >
                    <Table size={20} className="text-blue-600" />
                    <span className="text-[10px] font-bold text-bakery-brown">Word</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-bakery-brown/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 bg-bakery-cream border-b border-bakery-warm flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-bakery-brown text-xl">Detail Transaksi</h3>
                  <p className="text-xs text-bakery-brown-light font-bold uppercase tracking-wider">{selectedReport.name}</p>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-2 bg-white text-bakery-brown rounded-full shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {selectedReport.items.map((sale: Sale, idx: number) => (
                    <div key={sale.id} className="p-4 rounded-2xl bg-bakery-cream/50 border border-bakery-warm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-bakery-orange uppercase">TRX #{selectedReport.items.length - idx}</span>
                        <span className="text-[10px] font-bold text-bakery-brown-light">
                          {new Date(sale.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {sale.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-bakery-brown font-medium">{item.name} x{item.quantity}</span>
                            <span className="text-bakery-brown font-bold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-bakery-warm border-dashed flex justify-between items-center">
                        <span className="text-xs font-black text-bakery-brown uppercase">Total</span>
                        <span className="text-base font-black text-bakery-brown">Rp {sale.total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-bakery-warm/20 border-t border-bakery-warm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-bakery-brown-light uppercase">Total Keseluruhan</p>
                    <p className="text-2xl font-display font-black text-bakery-brown">Rp {selectedReport.total.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => exportToPDF(selectedReport)}
                      className="p-3 bg-white text-bakery-brown rounded-xl border border-bakery-warm hover:text-bakery-orange"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

