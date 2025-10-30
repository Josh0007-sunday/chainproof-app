import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome,  FiCode,  FiLogOut, FiMenu, FiX } from 'react-icons/fi';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/developer/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/developer/test', icon: FiCode, label: 'API Playground' },
    // Temporarily commented out until components are created
    // { path: '/developer/billing', icon: FiDollarSign, label: 'Billing' },
    // { path: '/developer/settings', icon: FiSettings, label: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white"
        style={{ backgroundColor: '#181824' }}
      >
        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Always fixed on all screen sizes */}
      <aside
        className={`w-64 flex flex-col h-screen fixed left-0 top-0 transition-transform duration-300 ease-in-out z-40
          md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#181824' }}
      >
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b" style={{ borderColor: '#252538ff' }}>
        <Link to="/">
          <h1 className="text-2xl font-bold text-white">ChainProof</h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              isActive(item.path) ? 'text-white' : 'text-gray-400 hover:bg-gray-700'
            }`}
            style={isActive(item.path) ? { backgroundColor: '#252538ff' } : {}}
          >
            <item.icon />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t" style={{ borderColor: '#252538ff' }}>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 transition"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
