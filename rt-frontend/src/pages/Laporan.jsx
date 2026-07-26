import { useEffect, useState } from 'react';
import api from '../api';
import { exportToExcel, exportToPDF } from '../utils/export';
import useTitle from '../utils/useTitle';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function Laporan() {
  useTitle('Laporan Keuangan');
  const [summaryData, setSummaryData] = useState([]);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [tahun]);

  const fetchYears = async () => {
    try {
      const response = await api.get('/summary/years');
      setAvailableYears(response.data);
      if(!response.data.includes(tahun) && response.data.length > 0) {
          setTahun(response.data[response.data.length - 1]);
      }
    } catch (error) {
      console.error('Failed to fetch years:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/summary?tahun=${tahun}`);
      setSummaryData(response.data.summary);
      setTotalSaldo(response.data.total_saldo);
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportExcel = () => {
    const data = summaryData.map((s, i) => ({
      No: i + 1,
      Bulan: monthNames[s.bulan - 1],
      'Total Pemasukan (Rp)': Number(s.pemasukan),
      'Total Pengeluaran (Rp)': Number(s.pengeluaran),
      'Saldo (Rp)': Number(s.saldo)
    }));
    exportToExcel(data, `Laporan_Keuangan_Tahun_${tahun}`);
  };

  const handleExportPDF = () => {
    const headers = ['No', 'Bulan', 'Total Pemasukan (Rp)', 'Total Pengeluaran (Rp)', 'Saldo (Rp)'];
    const rows = summaryData.map((s, i) => [
      i + 1,
      monthNames[s.bulan - 1],
      Number(s.pemasukan).toLocaleString('id-ID'),
      Number(s.pengeluaran).toLocaleString('id-ID'),
      Number(s.saldo).toLocaleString('id-ID')
    ]);
    exportToPDF(headers, rows, `Laporan_Keuangan_Tahun_${tahun}`, `Laporan Keuangan Tahun ${tahun}`);
  };

  const totalPemasukanSum = summaryData.reduce((acc, curr) => acc + Number(curr.pemasukan || 0), 0);
  const totalPengeluaranSum = summaryData.reduce((acc, curr) => acc + Number(curr.pengeluaran || 0), 0);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 animate-slide-down stagger-1">
        <h2 className="text-2xl font-bold text-gray-800">Laporan Keuangan Bulanan</h2>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
            Export Excel
          </button>
          <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
            Export PDF
          </button>
          <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
            <label className="text-gray-700 font-medium">Tahun:</label>
            <select 
              value={tahun} 
              onChange={(e) => setTahun(parseInt(e.target.value))} 
              className="border p-2 rounded w-24 bg-white"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-down stagger-2">
        {/* Pemasukan */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Pemasukan</h3>
            <p className="text-2xl font-bold text-gray-800">Rp {totalPemasukanSum.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <TrendingDown className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Pengeluaran</h3>
            <p className="text-2xl font-bold text-gray-800">Rp {totalPengeluaranSum.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Saldo Akhir */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Saldo (Sisa)</h3>
            <p className={`text-2xl font-bold ${(totalPemasukanSum - totalPengeluaranSum) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Rp {(totalPemasukanSum - totalPengeluaranSum).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-slide-down stagger-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 w-12">No</th>
              <th className="p-4">Bulan</th>
              <th className="p-4">Total Pemasukan (Rp)</th>
              <th className="p-4">Total Pengeluaran (Rp)</th>
              <th className="p-4">Saldo (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No data entry</td>
              </tr>
            ) : (
              summaryData.map((s, index) => (
                <tr key={s.bulan} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-500">{index + 1}</td>
                  <td className="p-4 font-medium">{monthNames[s.bulan - 1]}</td>
                <td className="p-4 text-green-600">{Number(s.pemasukan).toLocaleString('id-ID')}</td>
                <td className="p-4 text-red-600">{Number(s.pengeluaran).toLocaleString('id-ID')}</td>
                <td className={`p-4 font-semibold ${Number(s.saldo) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Number(s.saldo).toLocaleString('id-ID')}
                </td>
              </tr>
            )))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
