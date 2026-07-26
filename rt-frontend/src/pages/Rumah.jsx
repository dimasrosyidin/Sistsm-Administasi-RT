import { useEffect, useState } from 'react';
import api from '../api';
import { exportToExcel, exportToPDF } from '../utils/export';
import useTitle from '../utils/useTitle';
import { Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Rumah() {
  useTitle('Data Rumah');
  const [rumahList, setRumahList] = useState([]);
  const [penghuniList, setPenghuniList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const defaultFormData = { id: null, nomor_rumah: '', status_dihuni: 'Tidak Dihuni', penghuni_ids: [] };
  const [formData, setFormData] = useState(defaultFormData);
  const [historyData, setHistoryData] = useState([]);
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRumah();
    fetchPenghuni();
  }, []);

  const fetchRumah = async () => {
    try {
      const { data } = await api.get('/rumah');
      setRumahList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPenghuni = async () => {
    try {
      const { data } = await api.get('/penghuni');
      setPenghuniList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredRumah = (filterStatus === 'Semua' ? rumahList : rumahList.filter(r => r.status_dihuni === filterStatus))
    .filter(r => {
      if(!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const currentResidents = r.penghuni?.filter(p => !p.pivot.tanggal_selesai || new Date(p.pivot.tanggal_selesai) > new Date());
      const residentsStr = currentResidents ? currentResidents.map(p => p.nama_lengkap).join(' ').toLowerCase() : '';
      return r.nomor_rumah.toLowerCase().includes(q) || residentsStr.includes(q);
    });

  const handleExportExcel = () => {
    const data = filteredRumah.map((r, i) => {
      const currentResidents = r.penghuni?.filter(p => !p.pivot.tanggal_selesai || new Date(p.pivot.tanggal_selesai) > new Date());
      return {
        No: i + 1,
        'Nomor Rumah': r.nomor_rumah,
        Status: r.status_dihuni,
        'Penghuni Saat Ini': currentResidents && currentResidents.length > 0 ? currentResidents.map(p => p.nama_lengkap).join(', ') : '-'
      };
    });
    exportToExcel(data, 'Data_Rumah');
  };

  const handleExportPDF = () => {
    const headers = ['No', 'Nomor Rumah', 'Status', 'Penghuni Saat Ini'];
    const rows = filteredRumah.map((r, i) => {
      const currentResidents = r.penghuni?.filter(p => !p.pivot.tanggal_selesai || new Date(p.pivot.tanggal_selesai) > new Date());
      return [
        i + 1,
        r.nomor_rumah,
        r.status_dihuni,
        currentResidents && currentResidents.length > 0 ? currentResidents.map(p => p.nama_lengkap).join(', ') : '-'
      ];
    });
    exportToPDF(headers, rows, 'Data_Rumah', 'Data Rumah RT');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/rumah/${formData.id}`, formData);
        toast.success('Data Rumah Berhasil di Update');
      } else {
        await api.post('/rumah', formData);
        toast.success('Data Rumah Berhasil di Tambah');
      }
      setShowModal(false);
      fetchRumah();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menyimpan data');
    }
  };

  const viewHistory = async (id) => {
    try {
      const { data } = await api.get(`/rumah/${id}/history`);
      setHistoryData(data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Rumah',
      message: 'Apakah Anda yakin ingin menghapus rumah ini?',
      onConfirm: async () => {
        try {
          await api.delete(`/rumah/${id}`);
          toast.success('Data Berhasil di Hapus');
          fetchRumah();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Gagal menghapus rumah');
        }
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 animate-slide-down stagger-1">
        <h2 className="text-2xl font-bold text-gray-800">Data Rumah</h2>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Cari rumah, penghuni..." 
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
            <option value="Dihuni">Dihuni</option>
            <option value="Tidak Dihuni">Tidak Dihuni</option>
          </select>
          <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Export Excel
          </button>
          <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Export PDF
          </button>
          <button onClick={() => { setFormData(defaultFormData); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + Tambah Rumah
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-slide-down stagger-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-700 w-16">No</th>
              <th className="p-4 font-semibold text-gray-700">Nomor Rumah</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
              <th className="p-4 font-semibold text-gray-700">Penghuni Saat Ini</th>
              <th className="p-4 font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRumah.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No data entry</td>
              </tr>
            ) : (
              filteredRumah.map((r, index) => {
              // Find all current residents
              const currentResidents = r.penghuni?.filter(p => !p.pivot.tanggal_selesai || new Date(p.pivot.tanggal_selesai) > new Date());
              return (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-500">{index + 1}</td>
                  <td className="p-4 font-medium">{r.nomor_rumah}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${r.status_dihuni === 'Dihuni' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.status_dihuni}
                    </span>
                  </td>
                  <td className="p-4">{currentResidents && currentResidents.length > 0 ? currentResidents.map(p => p.nama_lengkap).join(', ') : '-'}</td>
                  <td className="p-4 space-x-3">
                    <button onClick={() => viewHistory(r.id)} className="text-purple-600 hover:text-purple-800" title="History Penghuni">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button onClick={() => { 
                      const currentResidents = r.penghuni?.filter(p => !p.pivot.tanggal_selesai || new Date(p.pivot.tanggal_selesai) > new Date());
                      setFormData({
                        ...r,
                        penghuni_ids: currentResidents ? currentResidents.map(p => p.id) : []
                      }); 
                      setShowModal(true); 
                    }} className="text-blue-600 hover:text-blue-800" title="Edit Rumah">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800" title="Hapus Rumah">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            }) )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl animate-pop-in">
            <h3 className="text-xl font-bold mb-4">{formData.id ? 'Edit Rumah' : 'Tambah Rumah Baru'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rumah</label>
                <input required type="text" value={formData.nomor_rumah} onChange={(e) => setFormData({...formData, nomor_rumah: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Dihuni</label>
                <select value={formData.status_dihuni} onChange={(e) => setFormData({...formData, status_dihuni: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="Tidak Dihuni">Tidak Dihuni</option>
                  <option value="Dihuni">Dihuni</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Penghuni Saat Ini</label>
                {formData.penghuni_ids.map((id, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-3">
                    <div className="flex-1">
                      <select 
                        value={id} 
                        onChange={(e) => {
                          const newIds = [...formData.penghuni_ids];
                          newIds[index] = e.target.value;
                          setFormData({...formData, penghuni_ids: newIds, status_dihuni: newIds.length > 0 ? 'Dihuni' : formData.status_dihuni});
                        }} 
                        className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                        required
                      >
                        <option value="">-- Pilih Penghuni {index + 1} --</option>
                        {penghuniList.map(p => (
                          <option key={p.id} value={p.id}>{p.nama_lengkap}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        const newIds = formData.penghuni_ids.filter((_, i) => i !== index);
                        setFormData({...formData, penghuni_ids: newIds, status_dihuni: newIds.length > 0 ? 'Dihuni' : 'Tidak Dihuni'});
                      }}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Hapus Penghuni Ini"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, penghuni_ids: [...formData.penghuni_ids, '']})}
                  className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-1" /> Tambah penghuni
                </button>
                <p className="text-xs text-gray-500 mt-2">Kosongkan jika tidak ada penghuni. Status akan otomatis disesuaikan.</p>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal History */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">History Penghuni Rumah</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-3 w-12">No</th>
                    <th className="p-3">Nama Penghuni</th>
                    <th className="p-3">Tanggal Mulai</th>
                    <th className="p-3">Tanggal Selesai</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((h, index) => (
                    <tr key={h.pivot.id} className="border-b border-gray-100">
                      <td className="p-3 text-gray-500">{index + 1}</td>
                      <td className="p-3">{h.nama_lengkap}</td>
                      <td className="p-3">{h.pivot.tanggal_mulai}</td>
                      <td className="p-3">{h.pivot.tanggal_selesai || 'Sekarang'}</td>
                    </tr>
                  ))}
                  {historyData.length === 0 && (
                    <tr><td colSpan="3" className="p-4 text-center text-gray-500">Belum ada history.</td></tr>
                  )}
                </tbody>
              </table>
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
