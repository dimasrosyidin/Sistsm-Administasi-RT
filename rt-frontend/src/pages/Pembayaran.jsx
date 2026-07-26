import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { exportToExcel, exportToPDF } from '../utils/export';
import useTitle from '../utils/useTitle';
import { Edit, Trash2, Search, CheckCircle, XCircle, Plus, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Pembayaran() {
  const location = useLocation();
  useTitle('Pembayaran Iuran');
  const [tagihanList, setTagihanList] = useState([]);
  const [rumahList, setRumahList] = useState([]);
  const [penghuniList, setPenghuniList] = useState([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [filterTahun, setFilterTahun] = useState(location.state?.filterTahun || 'Semua');
  const [filterStatus, setFilterStatus] = useState(location.state?.filterStatus || 'Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const defaultFormData = {
    rumah_id: '',
    penghuni_id: '',
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    nominal_kebersihan: 15000,
    nominal_satpam: 100000,
    status_kebersihan: 'Belum Lunas',
    status_satpam: 'Belum Lunas'
  };
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchTagihan();
  }, []);

  const fetchTagihan = async () => {
    try {
      const { data } = await api.get('/tagihan');
      setTagihanList(data);
      
      const resRumah = await api.get('/rumah');
      setRumahList(resRumah.data.filter(r => r.status_dihuni === 'Dihuni'));
      
      const resPenghuni = await api.get('/penghuni');
      setPenghuniList(resPenghuni.data);
    } catch (error) {
      console.error(error);
    }
  };

  const availableYears = [...new Set(tagihanList.map(t => t.tahun))].sort((a, b) => b - a);
  const filteredTagihan = tagihanList.filter(t => {
    const isLunasKebersihan = t.status_kebersihan === 'Lunas';
    const isLunasSatpam = t.status_satpam === 'Lunas';
    const status = (isLunasKebersihan && isLunasSatpam) ? 'Paid' : (!isLunasKebersihan && !isLunasSatpam ? 'Unpaid' : 'Partial');
    
    const matchTahun = filterTahun === 'Semua' || t.tahun.toString() === filterTahun.toString();
    const matchStatus = filterStatus === 'Semua' || status === filterStatus || (filterStatus === 'Belum Lunas' && (status === 'Unpaid' || status === 'Partial'));
    
    const q = searchQuery.toLowerCase();
    const matchSearch = !searchQuery || 
                        (t.rumah?.nomor_rumah && t.rumah.nomor_rumah.toLowerCase().includes(q)) ||
                        (t.penghuni?.nama_lengkap && t.penghuni.nama_lengkap.toLowerCase().includes(q));
    
    return matchTahun && matchStatus && matchSearch;
  });

  const handleExportExcel = () => {
    const data = filteredTagihan.map((t, i) => {
      const isLunasKebersihan = t.status_kebersihan === 'Lunas';
      const isLunasSatpam = t.status_satpam === 'Lunas';
      const status = (isLunasKebersihan && isLunasSatpam) ? 'Paid' : (!isLunasKebersihan && !isLunasSatpam ? 'Unpaid' : 'Partial');
      return {
        No: i + 1,
        'Nomor Rumah': t.rumah?.nomor_rumah || '-',
        'Penghuni': t.penghuni?.nama_lengkap || '-',
        Periode: `${t.bulan}/${t.tahun}`,
        'Iuran Kebersihan': isLunasKebersihan ? 'Rp 15.000 (Paid)' : 'Rp 15.000 (Unpaid)',
        'Iuran Satpam': isLunasSatpam ? 'Rp 100.000 (Paid)' : 'Rp 100.000 (Unpaid)',
        Total: 'Rp 115.000',
        Status: status
      };
    });
    exportToExcel(data, 'Data_Pembayaran');
  };

  const handleExportPDF = () => {
    const headers = ['No', 'Nomor Rumah', 'Penghuni', 'Periode', 'Iuran Kebersihan', 'Iuran Satpam', 'Total', 'Status'];
    const rows = filteredTagihan.map((t, i) => {
      const isLunasKebersihan = t.status_kebersihan === 'Lunas';
      const isLunasSatpam = t.status_satpam === 'Lunas';
      const status = (isLunasKebersihan && isLunasSatpam) ? 'Paid' : (!isLunasKebersihan && !isLunasSatpam ? 'Unpaid' : 'Partial');
      return [
        i + 1,
        t.rumah?.nomor_rumah || '-',
        t.penghuni?.nama_lengkap || '-',
        `${t.bulan}/${t.tahun}`,
        isLunasKebersihan ? 'Rp 15.000 (Paid)' : 'Rp 15.000 (Unpaid)',
        isLunasSatpam ? 'Rp 100.000 (Paid)' : 'Rp 100.000 (Unpaid)',
        'Rp 115.000',
        status
      ];
    });
    exportToPDF(headers, rows, 'Data_Pembayaran', 'Data Pembayaran RT');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tagihan', formData);
      toast.success('Tagihan Berhasil di Tambah');
      fetchTagihan();
      setShowAddModal(false);
      setFormData(defaultFormData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan tagihan');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tagihan/${selectedTagihan.id}`, {
        nominal_kebersihan: formData.nominal_kebersihan,
        nominal_satpam: formData.nominal_satpam,
      });
      toast.success('Tagihan Berhasil di Update');
      fetchTagihan();
      setShowEditModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengedit tagihan');
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Tagihan',
      message: 'Apakah Anda yakin ingin menghapus tagihan ini?',
      onConfirm: async () => {
        try {
          await api.delete(`/tagihan/${id}`);
          toast.success('Data Berhasil di Hapus');
          fetchTagihan();
        } catch (error) {
          console.error(error);
          toast.error('Gagal menghapus tagihan');
        }
      }
    });
  };

  const processPayment = async (id, jenis_iuran, periode_pembayaran = 'bulanan', action = 'bayar') => {
    try {
      await api.post(`/tagihan/${id}/bayar`, { jenis_iuran, periode_pembayaran, action });
      toast.success('Pembayaran Berhasil di Update');
      fetchTagihan();
      setShowPaymentModal(false);
      setSelectedTagihan(null);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memproses pembayaran');
    }
  };

  const confirmAndProcessPayment = (id, jenis_iuran, periode_pembayaran) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Konfirmasi Pembayaran',
      message: 'Anda yakin untuk memproses pembayaran ini?',
      onConfirm: () => processPayment(id, jenis_iuran, periode_pembayaran, 'bayar')
    });
  };

  const handleStatusClick = (t, currentStatus) => {
    if (currentStatus === 'Paid') {
      setConfirmDialog({
        isOpen: true,
        title: 'Batal Pembayaran',
        message: 'Apakah Anda yakin ingin membatalkan pembayaran ini (menjadi Unpaid)?',
        onConfirm: () => processPayment(t.id, 'Semua', 'bulanan', 'batal')
      });
    } else {
      setSelectedTagihan(t);
      setShowPaymentModal(true);
    }
  };

  const handleBayarIndividual = async (id, jenis_iuran) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Konfirmasi Pembayaran',
      message: `Konfirmasi pembayaran iuran ${jenis_iuran}?`,
      onConfirm: () => processPayment(id, jenis_iuran, 'bulanan', 'bayar')
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 animate-slide-down stagger-1">
        <h2 className="text-2xl font-bold text-gray-800">Pembayaran Iuran</h2>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Cari rumah, penghuni..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 w-48"
          />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Paid">Paid</option>
            <option value="Belum Lunas">Unpaid & Partial</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
          <select 
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="border border-gray-300 rounded p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua">Tampilkan Semua</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
            Export Excel
          </button>
          <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
            Export PDF
          </button>
          <button onClick={() => { setFormData(defaultFormData); setShowAddModal(true); }} className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            <span>Tambah Tagihan</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-slide-down stagger-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 w-12">No</th>
              <th className="p-4">Nomor Rumah</th>
              <th className="p-4">Penghuni</th>
              <th className="p-4">Periode</th>
              <th className="p-4">Iuran Kebersihan</th>
              <th className="p-4">Iuran Satpam</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status Pembayaran</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTagihan.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500 font-medium">No data entry</td>
              </tr>
            ) : (
              filteredTagihan.map((t, index) => {
                const isLunasKebersihan = t.status_kebersihan === 'Lunas';
                const isLunasSatpam = t.status_satpam === 'Lunas';
                const status = (isLunasKebersihan && isLunasSatpam) ? 'Paid' : (!isLunasKebersihan && !isLunasSatpam ? 'Unpaid' : 'Partial');
                
                return (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-gray-500">{index + 1}</td>
                    <td className="p-4 font-semibold">{t.rumah?.nomor_rumah || '-'}</td>
                    <td className="p-4 text-gray-700">{t.penghuni?.nama_lengkap || '-'}</td>
                    <td className="p-4">{t.bulan}/{t.tahun}</td>
                    <td className="p-4">
                      {isLunasKebersihan ? (
                        <div className="text-sm font-semibold text-gray-800">Rp {parseInt(t.nominal_kebersihan).toLocaleString('id-ID')}</div>
                      ) : (
                        <button onClick={() => handleBayarIndividual(t.id, 'Kebersihan')} className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200">
                          Rp {parseInt(t.nominal_kebersihan).toLocaleString('id-ID')}
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      {isLunasSatpam ? (
                        <div className="text-sm font-semibold text-gray-800">Rp {parseInt(t.nominal_satpam).toLocaleString('id-ID')}</div>
                      ) : (
                        <button onClick={() => handleBayarIndividual(t.id, 'Satpam')} className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200">
                          Rp {parseInt(t.nominal_satpam).toLocaleString('id-ID')}
                        </button>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-gray-800">Rp {(parseInt(t.nominal_kebersihan) + parseInt(t.nominal_satpam)).toLocaleString('id-ID')}</td>
                    <td className="p-4">
                      <button onClick={() => handleStatusClick(t, status)} className={`px-2 py-1 rounded text-xs font-bold transition ${status === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-200' : status === 'Unpaid' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
                        {status}
                      </button>
                    </td>
                    <td className="p-4 flex justify-center space-x-2">
                      <button onClick={() => { setSelectedTagihan(t); setShowViewModal(true); }} className="text-blue-600 hover:text-blue-800" title="History">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button onClick={() => { 
                        setSelectedTagihan(t); 
                        setFormData({
                          ...defaultFormData,
                          nominal_kebersihan: t.nominal_kebersihan,
                          nominal_satpam: t.nominal_satpam
                        });
                        setShowEditModal(true); 
                      }} className="text-orange-500 hover:text-orange-700" title="Edit">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-800" title="Hapus">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {showPaymentModal && selectedTagihan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl text-center">
            <h3 className="text-xl font-bold mb-2">Pilih Periode Pembayaran</h3>
            <p className="text-gray-600 text-sm mb-6">Pembayaran untuk <strong>{selectedTagihan.rumah?.nomor_rumah}</strong> ({selectedTagihan.penghuni?.nama_lengkap})</p>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => confirmAndProcessPayment(selectedTagihan.id, 'Semua', 'bulanan')} 
                className="bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Bayar 1 Bulan Ini
              </button>
              <button 
                onClick={() => confirmAndProcessPayment(selectedTagihan.id, 'Semua', 'campuran')} 
                className="bg-purple-600 text-white px-4 py-3 rounded-lg font-medium text-sm hover:bg-purple-700 transition"
              >
                Bayar 1 Bulan (Satpam), 1 Tahun (Iuran Bulanan)
              </button>
              <button 
                onClick={() => confirmAndProcessPayment(selectedTagihan.id, 'Semua', 'tahunan')} 
                className="bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition"
              >
                Bayar 1 Tahun (Jan - Des)
              </button>
              <button 
                onClick={() => { setShowPaymentModal(false); setSelectedTagihan(null); }} 
                className="mt-2 text-gray-500 hover:text-gray-700 font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-pop-in">
            <h3 className="text-xl font-bold mb-4">Tambah Tagihan Baru</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rumah (Dihuni)</label>
                <select required className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.rumah_id} 
                  onChange={e => {
                    const rId = e.target.value;
                    const h = rumahList.find(r => r.id == rId);
                    // auto select penghuni_id
                    const pId = h?.penghuni?.length > 0 ? h.penghuni[0].id : '';
                    setFormData({...formData, rumah_id: rId, penghuni_id: pId});
                  }}>
                  <option value="">Pilih Rumah</option>
                  {rumahList.map(r => (
                    <option key={r.id} value={r.id}>{r.nomor_rumah} - {r.penghuni?.length > 0 ? r.penghuni[0].nama_lengkap : 'Tanpa Penghuni'}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                  <input type="number" min="1" max="12" required className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" value={formData.bulan} onChange={e => setFormData({...formData, bulan: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                  <input type="number" min="2000" required className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" value={formData.tahun} onChange={e => setFormData({...formData, tahun: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Iuran Kebersihan</label>
                  <input type="number" min="0" required className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" value={formData.nominal_kebersihan} onChange={e => setFormData({...formData, nominal_kebersihan: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Iuran Satpam</label>
                  <input type="number" min="0" required className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" value={formData.nominal_satpam} onChange={e => setFormData({...formData, nominal_satpam: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedTagihan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-pop-in">
            <h3 className="text-xl font-bold mb-4">Edit Tagihan</h3>
            <p className="text-sm text-gray-500 mb-4">
              Edit nominal tagihan untuk Rumah <strong>{selectedTagihan.rumah?.nomor_rumah}</strong> periode {selectedTagihan.bulan}/{selectedTagihan.tahun}.
            </p>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Iuran Kebersihan</label>
                  <input type="number" min="0" required className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" value={formData.nominal_kebersihan} onChange={e => setFormData({...formData, nominal_kebersihan: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Iuran Satpam</label>
                  <input type="number" min="0" required className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500" value={formData.nominal_satpam} onChange={e => setFormData({...formData, nominal_satpam: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedTagihan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-pop-in">
            <h3 className="text-xl font-bold mb-4">Detail Tagihan</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Nomor Rumah</span><span className="font-semibold">{selectedTagihan.rumah?.nomor_rumah}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Penghuni</span><span className="font-semibold">{selectedTagihan.penghuni?.nama_lengkap}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Periode</span><span className="font-semibold">{selectedTagihan.bulan}/{selectedTagihan.tahun}</span></div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Iuran Kebersihan</span>
                <span className="text-right">
                  <div className="font-semibold">Rp {parseInt(selectedTagihan.nominal_kebersihan).toLocaleString('id-ID')} ({selectedTagihan.status_kebersihan})</div>
                  {selectedTagihan.tanggal_bayar_kebersihan && <div className="text-xs text-green-600">Tgl Bayar: {selectedTagihan.tanggal_bayar_kebersihan.substring(0, 10)}</div>}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Iuran Satpam</span>
                <span className="text-right">
                  <div className="font-semibold">Rp {parseInt(selectedTagihan.nominal_satpam).toLocaleString('id-ID')} ({selectedTagihan.status_satpam})</div>
                  {selectedTagihan.tanggal_bayar_satpam && <div className="text-xs text-green-600">Tgl Bayar: {selectedTagihan.tanggal_bayar_satpam.substring(0, 10)}</div>}
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-gray-100 rounded text-gray-800 hover:bg-gray-200">Tutup</button>
            </div>
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
