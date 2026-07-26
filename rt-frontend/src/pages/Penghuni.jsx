import { useEffect, useState } from 'react';
import api from '../api';
import { exportToExcel, exportToPDF } from '../utils/export';
import useTitle from '../utils/useTitle';
import { Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Penghuni() {
  useTitle('Data Penghuni');
  const [penghuniList, setPenghuniList] = useState([]);
  const [rumahList, setRumahList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nama_lengkap: '',
    status_penghuni: 'Tetap',
    nomor_telepon: '',
    status_pernikahan: 'Belum Menikah',
    foto_ktp: null,
    rumah_id: ''
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPenghuni();
    fetchRumah();
  }, []);

  const fetchPenghuni = async () => {
    try {
      const { data } = await api.get('/penghuni');
      setPenghuniList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRumah = async () => {
    try {
      const { data } = await api.get('/rumah');
      // only get unoccupied houses or just all houses? 
      // let's allow assigning to any house for simplicity or let backend handle logic
      setRumahList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPenghuni = (filterStatus === 'Semua' ? penghuniList : penghuniList.filter(p => p.status_penghuni === filterStatus))
    .filter(p => {
      if(!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const currentRumah = p.rumah?.find(r => !r.pivot.tanggal_selesai);
      return (p.nama_lengkap && p.nama_lengkap.toLowerCase().includes(q)) || 
             (p.nomor_telepon && p.nomor_telepon.toLowerCase().includes(q)) ||
             (currentRumah && currentRumah.nomor_rumah.toLowerCase().includes(q));
    });

  const handleExportExcel = () => {
    const data = filteredPenghuni.map((p, i) => {
      const currentRumah = p.rumah?.find(r => !r.pivot.tanggal_selesai);
      return {
        No: i + 1,
        Nama: p.nama_lengkap,
        Rumah: currentRumah ? currentRumah.nomor_rumah : '-',
        Status: p.status_penghuni,
        Telepon: p.nomor_telepon,
        Pernikahan: p.status_pernikahan
      };
    });
    exportToExcel(data, 'Data_Penghuni');
  };

  const handleExportPDF = () => {
    const headers = ['No', 'Nama', 'Rumah', 'Status', 'Telepon', 'Pernikahan'];
    const rows = filteredPenghuni.map((p, i) => {
      const currentRumah = p.rumah?.find(r => !r.pivot.tanggal_selesai);
      return [
        i + 1,
        p.nama_lengkap,
        currentRumah ? currentRumah.nomor_rumah : '-',
        p.status_penghuni,
        p.nomor_telepon,
        p.status_pernikahan
      ];
    });
    exportToPDF(headers, rows, 'Data_Penghuni', 'Data Penghuni RT');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('nama_lengkap', formData.nama_lengkap);
    data.append('status_penghuni', formData.status_penghuni);
    data.append('nomor_telepon', formData.nomor_telepon);
    data.append('status_pernikahan', formData.status_pernikahan);
    data.append('rumah_id', formData.rumah_id);
    if (formData.foto_ktp instanceof File) {
      data.append('foto_ktp', formData.foto_ktp);
    }

    try {
      if (formData.id) {
        data.append('_method', 'PUT'); // Laravel way to handle PUT with FormData
        await api.post(`/penghuni/${formData.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
        toast.success('Data Penghuni Berhasil di Update');
      } else {
        await api.post('/penghuni', data, { headers: { 'Content-Type': 'multipart/form-data' }});
        toast.success('Data Penghuni Berhasil di Tambah');
      }
      setShowModal(false);
      setFormData({ id: null, nama_lengkap: '', status_penghuni: 'Tetap', nomor_telepon: '', status_pernikahan: 'Belum Menikah', foto_ktp: null, rumah_id: '' });
      fetchPenghuni();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan data');
    }
  };

  const handleEdit = (p) => {
    const currentRumah = p.rumah?.find(r => !r.pivot.tanggal_selesai);
    setFormData({
      id: p.id,
      nama_lengkap: p.nama_lengkap,
      status_penghuni: p.status_penghuni,
      nomor_telepon: p.nomor_telepon,
      status_pernikahan: p.status_pernikahan,
      foto_ktp: null,
      rumah_id: currentRumah ? currentRumah.id : ''
    });
    setShowModal(true);
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPenghuni, setSelectedPenghuni] = useState(null);

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Penghuni',
      message: 'Apakah Anda yakin ingin menghapus penghuni ini?',
      onConfirm: async () => {
        try {
          await api.delete(`/penghuni/${id}`);
          toast.success('Data Berhasil di Hapus');
          fetchPenghuni();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Gagal menghapus penghuni');
        }
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 animate-slide-down stagger-1">
        <h2 className="text-2xl font-bold text-gray-800">Data Penghuni</h2>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Cari nama, rumah..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 w-48"
          />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Tetap">Tetap</option>
            <option value="Kontrak">Kontrak</option>
          </select>
          <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Export Excel
          </button>
          <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Export PDF
          </button>
          <button onClick={() => { setFormData({ id: null, nama_lengkap: '', status_penghuni: 'Tetap', nomor_telepon: '', status_pernikahan: 'Belum Menikah', foto_ktp: null, rumah_id: '' }); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + Tambah Penghuni
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-slide-down stagger-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-700 w-16">No</th>
              <th className="p-4 font-semibold text-gray-700">Nama</th>
              <th className="p-4 font-semibold text-gray-700">Rumah</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
              <th className="p-4 font-semibold text-gray-700">Telepon</th>
              <th className="p-4 font-semibold text-gray-700">Pernikahan</th>
              <th className="p-4 font-semibold text-gray-700">KTP</th>
              <th className="p-4 font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPenghuni.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500 font-medium">No data entry</td>
              </tr>
            ) : (
              filteredPenghuni.map((p, index) => {
                const currentRumah = p.rumah?.find(r => !r.pivot.tanggal_selesai);
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-500">{index + 1}</td>
                    <td className="p-4">{p.nama_lengkap}</td>
                    <td className="p-4 font-medium">{currentRumah ? currentRumah.nomor_rumah : '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${p.status_penghuni === 'Tetap' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.status_penghuni}
                      </span>
                    </td>
                    <td className="p-4">{p.nomor_telepon}</td>
                    <td className="p-4">{p.status_pernikahan}</td>
                    <td className="p-4">
                      {p.foto_ktp ? (
                        <a href={`http://localhost:8000/${p.foto_ktp}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Lihat KTP</a>
                      ) : (
                        <span className="text-gray-400">Tidak ada</span>
                      )}
                    </td>
                    <td className="p-4 flex space-x-2">
                      <button onClick={() => { setSelectedPenghuni(p); setShowViewModal(true); }} className="text-purple-600 hover:text-purple-800" title="View Detail">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800" title="Edit">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800" title="Hapus">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
            }))}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl animate-pop-in">
            <h3 className="text-xl font-bold mb-4">{formData.id ? 'Edit Penghuni' : 'Tambah Penghuni Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input required type="text" value={formData.nama_lengkap} onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Penghuni</label>
                <select value={formData.status_penghuni} onChange={(e) => setFormData({...formData, status_penghuni: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="Tetap">Tetap</option>
                  <option value="Kontrak">Kontrak</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rumah</label>
                <select value={formData.rumah_id} onChange={(e) => setFormData({...formData, rumah_id: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 bg-white">
                  <option value="">-- Pilih Rumah (Opsional) --</option>
                  {rumahList.map(r => (
                    <option key={r.id} value={r.id}>{r.nomor_rumah}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                <input required type="text" value={formData.nomor_telepon} onChange={(e) => setFormData({...formData, nomor_telepon: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Pernikahan</label>
                <select value={formData.status_pernikahan} onChange={(e) => setFormData({...formData, status_pernikahan: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="Belum Menikah">Belum Menikah</option>
                  <option value="Menikah">Menikah</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto KTP (Opsional)</label>
                <input type="file" onChange={(e) => setFormData({...formData, foto_ktp: e.target.files[0]})} className="w-full" accept="image/*" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Detail */}
      {showViewModal && selectedPenghuni && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-pop-in">
            <h3 className="text-xl font-bold mb-4">Detail Penghuni</h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500">Nama Lengkap</span>
                <span className="font-semibold text-lg">{selectedPenghuni.nama_lengkap}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-gray-500">Status Penghuni</span>
                  <span className="font-medium">{selectedPenghuni.status_penghuni}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Status Pernikahan</span>
                  <span className="font-medium">{selectedPenghuni.status_pernikahan}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500">Nomor Telepon</span>
                <span className="font-medium">{selectedPenghuni.nomor_telepon}</span>
              </div>
              <div className="flex flex-col mt-4">
                <span className="text-gray-500 mb-1">Foto KTP</span>
                {selectedPenghuni.foto_ktp ? (
                  <img src={`http://localhost:8000/${selectedPenghuni.foto_ktp}`} alt="KTP" className="w-full h-auto max-h-48 object-cover rounded border" />
                ) : (
                  <div className="bg-gray-100 p-4 text-center rounded text-gray-500">Tidak ada foto KTP</div>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-6 mt-4 border-t">
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
