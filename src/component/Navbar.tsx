import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme, colors } = useTheme();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="px-4 sm:px-6 lg:px-8 py-4" style={{ backgroundColor: colors.backgroundSecondary, borderBottom: `1px solid ${colors.border}` }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-xl font-light tracking-wide" style={{ color: colors.text, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            <Link to="/dashboard" className="hover:opacity-80 transition">
              <span style={{ color: colors.primary }}>Chain</span>Proof
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium transition hover:opacity-70"
              style={{ color: colors.text }}
            >
              Home
            </Link>
            <Link
              to="/send"
              className="text-sm font-medium transition hover:opacity-70"
              style={{ color: colors.text }}
            >
              Send
            </Link>
            <Link
              to="/register-token"
              className="text-sm font-medium transition hover:opacity-70"
              style={{ color: colors.text }}
            >
              Register Token
            </Link>
            <Link
              to="/protocol-dashboard"
              className="text-sm font-medium transition hover:opacity-70"
              style={{ color: colors.text }}
            >
              Protocol Dashboard
            </Link>
            <Link
              to="/api-playground"
              className="text-sm font-medium transition hover:opacity-70"
              style={{ color: colors.text }}
            >
              API Playground
            </Link>
            <Link
              to="/developer/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
              style={{ backgroundColor: colors.primary, color: theme === 'dark' ? '#0e0d13' : '#ffffff' }}
            >
              Developer Console
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition hover:opacity-80"
              style={{ backgroundColor: colors.backgroundTertiary, color: colors.text }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            <WalletMultiButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-lg transition hover:opacity-80"
            style={{ color: colors.text }}
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-2 space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium transition hover:opacity-80"
              style={{ borderColor: colors.border, borderWidth: '1px', color: colors.text }}
            >
              Home
            </Link>
            <Link
              to="/send"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium transition hover:opacity-80"
              style={{ borderColor: colors.border, borderWidth: '1px', color: colors.text }}
            >
              Send
            </Link>
            <Link
              to="/register-token"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium transition hover:opacity-80"
              style={{ borderColor: colors.border, borderWidth: '1px', color: colors.text }}
            >
              Register Token
            </Link>
            <Link
              to="/protocol-dashboard"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium transition hover:opacity-80"
              style={{ borderColor: colors.border, borderWidth: '1px', color: colors.text }}
            >
              Protocol Dashboard
            </Link>
            <Link
              to="/api-playground"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium transition hover:opacity-80"
              style={{ borderColor: colors.border, borderWidth: '1px', color: colors.text }}
            >
              API Playground
            </Link>
            <Link
              to="/developer/dashboard"
              onClick={() => setIsOpen(false)}
              className="block text-center px-4 py-3 rounded-lg text-sm font-medium transition hover:opacity-80"
              style={{ backgroundColor: colors.primary, color: theme === 'dark' ? '#0e0d13' : '#ffffff' }}
            >
              Developer Console
            </Link>
            <div className="flex justify-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-3 rounded-lg transition hover:opacity-80"
                style={{ backgroundColor: colors.backgroundTertiary, color: colors.text }}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
              </button>
              <WalletMultiButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;