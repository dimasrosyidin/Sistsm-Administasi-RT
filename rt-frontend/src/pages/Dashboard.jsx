import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import useTitle from '../utils/useTitle';
import { Users, Home } from 'lucide-react';

export default function Dashboard() {
  useTitle('Dashboard');
  const navigate = useNavigate();
  
  const [summaryData, setSummaryData] = useState([]);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [totalPenghuni, setTotalPenghuni] = useState(0);
  const [rumahStats, setRumahStats] = useState({ total: 0, dihuni: 0, kosong: 0 });
  const [unpaidCount, setUnpaidCount] = useState(0);
  
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  useEffect(() => {
    fetchYears();
    fetchStats();
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

  const fetchStats = async () => {
    try {
      const resPenghuni = await api.get('/penghuni');
      setTotalPenghuni(resPenghuni.data.length);
      
      const resRumah = await api.get('/rumah');
      const rumahList = resRumah.data;
      const dihuni = rumahList.filter(r => r.status_dihuni === 'Dihuni').length;
      setRumahStats({
        total: rumahList.length,
        dihuni: dihuni,
        kosong: rumahList.length - dihuni
      });

      const resTagihan = await api.get('/tagihan');
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const unpaidThisMonth = resTagihan.data.filter(t => {
        if (t.bulan === currentMonth && t.tahun === currentYear) {
           const isLunasKebersihan = t.status_kebersihan === 'Lunas';
           const isLunasSatpam = t.status_satpam === 'Lunas';
           const status = (isLunasKebersihan && isLunasSatpam) ? 'Paid' : (!isLunasKebersihan && !isLunasSatpam ? 'Unpaid' : 'Partial');
           return status === 'Unpaid' || status === 'Partial';
        }
        return false;
      });
      setUnpaidCount(unpaidThisMonth.length);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/summary?tahun=${tahun}`);
      const formattedData = response.data.summary.map(item => ({
        name: item.tahun ? item.tahun.toString() : monthNames[item.bulan - 1],
        Pemasukan: parseInt(item.pemasukan),
        Pengeluaran: parseInt(item.pengeluaran),
        Saldo: parseInt(item.saldo)
      }));
      setSummaryData(formattedData);
      setTotalSaldo(response.data.total_saldo);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/laporan')}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Saldo Saat Ini</h3>
            <p className={`text-2xl font-bold ${totalSaldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Rp {totalSaldo.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/penghuni')}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 hover:scale-105 transform transition duration-300 animate-slide-down stagger-1"
        >
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Penghuni</h3>
            <p className="text-2xl font-bold text-gray-800">{totalPenghuni} Orang</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/rumah')}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 hover:scale-105 transform transition duration-300 animate-slide-down stagger-2"
        >
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <Home className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Rumah: {rumahStats.total}</h3>
            <div className="text-sm text-gray-600 font-medium">
              <span className="text-green-600">{rumahStats.dihuni} Dihuni</span> &bull; <span className="text-red-500">{rumahStats.kosong} Kosong</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/tagihan', { state: { statusFilter: 'Belum Lunas', tahunFilter: new Date().getFullYear().toString() } })}
          className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100 flex items-center justify-between cursor-pointer hover:bg-red-100 hover:scale-105 transform transition duration-300 animate-slide-down stagger-3"
        >
          <div>
            <h3 className="text-lg font-semibold text-red-700 mb-1">Belum Bayar Bulan Ini</h3>
            <p className="text-2xl font-bold text-red-600">
              {unpaidCount} Rumah
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-slide-down stagger-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 animate-slide-down">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Ringkasan Keuangan {tahun === 'semua' ? '(Semua Tahun)' : `(Tahun ${tahun})`}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-gray-600 text-sm font-medium">Filter Tahun:</label>
            <select 
              value={tahun} 
              onChange={(e) => setTahun(e.target.value === 'semua' ? 'semua' : parseInt(e.target.value))} 
              className="border p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div 
            onClick={() => navigate('/laporan')}
            className="p-5 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between cursor-pointer hover:bg-green-100 transition"
          >
            <div>
              <h4 className="text-sm font-bold text-green-800 mb-1 uppercase tracking-wider">Total Pemasukan</h4>
              <p className="text-3xl font-extrabold text-green-600">
                Rp {summaryData.reduce((acc, curr) => acc + curr.Pemasukan, 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          <div 
            onClick={() => navigate('/pengeluaran')}
            className="p-5 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between cursor-pointer hover:bg-red-100 transition"
          >
            <div>
              <h4 className="text-sm font-bold text-red-800 mb-1 uppercase tracking-wider">Total Pengeluaran</h4>
              <p className="text-3xl font-extrabold text-red-600">
                Rp {summaryData.reduce((acc, curr) => acc + curr.Pengeluaran, 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-md font-semibold text-gray-700 mb-4">Grafik Keuangan Tahunan</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={summaryData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
              <Legend />
              <Bar dataKey="Pemasukan" fill="#4CAF50" />
              <Bar dataKey="Pengeluaran" fill="#F44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
