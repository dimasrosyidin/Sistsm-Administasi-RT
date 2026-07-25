import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Users, Home as HomeIcon, CreditCard, Receipt, FileText } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Penghuni from './pages/Penghuni';
import Rumah from './pages/Rumah';
import Pembayaran from './pages/Pembayaran';
import Pengeluaran from './pages/Pengeluaran';
import Laporan from './pages/Laporan';

function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white h-screen border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">RT Admin</h1>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/penghuni" onClick={() => setIsOpen(false)} className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <Users className="w-5 h-5 mr-3" />
                Data Penghuni
              </Link>
            </li>
            <li>
              <Link to="/rumah" onClick={() => setIsOpen(false)} className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <HomeIcon className="w-5 h-5 mr-3" />
                Data Rumah
              </Link>
            </li>
            <li>
              <Link to="/tagihan" onClick={() => setIsOpen(false)} className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <CreditCard className="w-5 h-5 mr-3" />
                Pembayaran
              </Link>
            </li>
            <li>
              <Link to="/pengeluaran" onClick={() => setIsOpen(false)} className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <Receipt className="w-5 h-5 mr-3" />
                Pengeluaran
              </Link>
            </li>
            <li>
              <Link to="/laporan" onClick={() => setIsOpen(false)} className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <FileText className="w-5 h-5 mr-3" />
                Laporan
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex bg-gray-100 h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-8 shadow-sm">
          <button 
            className="md:hidden mr-4 text-gray-600 hover:text-gray-900" 
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Sistem Administrasi RT</h2>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/penghuni" element={<Penghuni />} />
          <Route path="/rumah" element={<Rumah />} />
          <Route path="/tagihan" element={<Pembayaran />} />
          <Route path="/pengeluaran" element={<Pengeluaran />} />
          <Route path="/laporan" element={<Laporan />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
