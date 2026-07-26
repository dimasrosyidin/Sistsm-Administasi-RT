import { useEffect, useState } from 'react';
import api from '../api';
import { exportToExcel, exportToPDF } from '../utils/export';
import useTitle from '../utils/useTitle';
import { Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Pengeluaran() {
  useTitle('Pengeluaran');
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, keterangan: '', jumlah: '', tanggal: '' });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [filterBulan, setFilterBulan] = useState('Semua');
  const [filterTahun, setFilterTahun] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const monthNames = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  useEffect(() => {
    fetchPengeluaran();
  }, []);

  const fetchPengeluaran = async () => {
    try {
      const { data } = await api.get('/pengeluaran');
      setPengeluaranList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const availableYears = [...new Set(pengeluaranList.map(p => p.tanggal.substring(0, 4)))].sort((a, b) => b - a);
  
  const filteredPengeluaran = pengeluaranList.filter(p => {
    const pTahun = p.tanggal.substring(0, 4);
    const pBulan = p.tanggal.substring(5, 7);
    
    const matchTahun = filterTahun === 'Semua' || pTahun === filterTahun;
    const matchBulan = filterBulan === 'Semua' || pBulan === filterBulan;
    
    const q = searchQuery.toLowerCase();
    const matchSearch = !searchQuery || p.keterangan.toLowerCase().includes(q);

    return matchTahun && matchBulan && matchSearch;
  });

  const handleExportExcel = () => {
    const data = filteredPengeluaran.map((p, i) => ({
      No: i + 1,
      Tanggal: p.tanggal,
      Keterangan: p.keterangan,
      'Jumlah (Rp)': p.jumlah
    }));
    exportToExcel(data, 'Data_Pengeluaran');
  };

  const handleExportPDF = () => {
    const headers = ['No', 'Tanggal', 'Keterangan', 'Jumlah (Rp)'];
    const rows = filteredPengeluaran.map((p, i) => [
      i + 1,
      p.tanggal,
      p.keterangan,
      parseInt(p.jumlah).toLocaleString('id-ID')
    ]);
    exportToPDF(headers, rows, 'Data_Pengeluaran', 'Data Pengeluaran RT');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/pengeluaran/${formData.id}`, formData);
        toast.success('Data Pengeluaran Berhasil di Update');
      } else {
        await api.post('/pengeluaran', formData);
        toast.success('Data Pengeluaran Berhasil di Tambah');
      }
      setShowModal(false);
      setFormData({ id: null, keterangan: '', jumlah: '', tanggal: '' });
      fetchPengeluaran();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan data pengeluaran');
    }
  };

  const handleEdit = (p) => {
    setFormData({
      id: p.id,
      keterangan: p.keterangan,
      jumlah: p.jumlah,
      tanggal: p.tanggal
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Pengeluaran',
      message: 'Apakah Anda yakin ingin menghapus data pengeluaran ini?',
      onConfirm: async () => {
        try {
          await api.delete(`/pengeluaran/${id}`);
          toast.success('Data Berhasil di Hapus');
          fetchPengeluaran();
        } catch (error) {
          toast.error('Gagal menghapus data pengeluaran');
        }
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 animate-slide-down stagger-1">
        <h2 className="text-2xl font-bold text-gray-800">Data Pengeluaran</h2>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Cari keterangan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 w-48"
          />
          <select
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua">Bulan (Semua)</option>
            {monthNames.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua">Tahun (Semua)</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Export Excel
          </button>
          <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Export PDF
          </button>
          <button onClick={() => { setFormData({ id: null, keterangan: '', jumlah: '', tanggal: '' }); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + Catat Pengeluaran
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-slide-down stagger-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 w-12">No</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Keterangan</th>
              <th className="p-4">Jumlah (Rp)</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPengeluaran.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No data entry</td>
              </tr>
            ) : (
              filteredPengeluaran.map((p, index) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-500">{index + 1}</td>
                  <td className="p-4">{p.tanggal}</td>
                <td className="p-4">{p.keterangan}</td>
                <td className="p-4 font-semibold text-red-600">{parseInt(p.jumlah).toLocaleString('id-ID')}</td>
                <td className="p-4 text-center space-x-2">
                  <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-pop-in">
            <h3 className="text-xl font-bold mb-4">{formData.id ? 'Edit Pengeluaran' : 'Catat Pengeluaran Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input required type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <input required type="text" value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                <input required type="number" min="0" value={formData.jumlah} onChange={(e) => setFormData({...formData, jumlah: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl text-center transform scale-100 transition-all animate-pop-in">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{confirmDialog.title}</h3>
            <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-center space-x-3">
              <button 
                onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition"
              >
                Tidak
              </button>
              <button 
                onClick={() => {
                  setConfirmDialog({ ...confirmDialog, isOpen: false });
                  confirmDialog.onConfirm();
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
