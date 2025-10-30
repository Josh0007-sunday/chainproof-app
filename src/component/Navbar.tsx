import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  // Force rebuild trigger

  return (
    <nav className="px-4 sm:px-6 lg:px-8 py-4" style={{ backgroundColor: '#181824', borderBottom: '1px solid #252538' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-white text-xl font-light tracking-wide" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            <Link to="/" className="hover:opacity-80 transition">
              <span style={{ color: '#35da9a' }}>Chain</span>Proof
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-white text-sm font-medium transition hover:text-gray-300"
            >
              Home
            </Link>
            <Link
              to="/send"
              className="text-white text-sm font-medium transition hover:text-gray-300"
            >
              Send
            </Link>
            <Link
              to="/register-token"
              className="text-white text-sm font-medium transition hover:text-gray-300"
            >
              Register Token
            </Link>
            <Link
              to="/developer/dashboard"
              className="text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
              style={{ backgroundColor: '#35da9a', color: '#0e0d13' }}
            >
              Developer Console
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="hidden text-white p-2 rounded-lg transition hover:bg-opacity-10 hover:bg-white"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="hidden mt-4 pb-2 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block text-white px-4 py-3 rounded-lg text-sm font-medium transition hover:bg-opacity-10 hover:bg-white"
              style={{ borderColor: '#252538', borderWidth: '1px' }}
            >
              Home
            </Link>
            <Link
              to="/send"
              onClick={() => setIsOpen(false)}
              className="block text-white px-4 py-3 rounded-lg text-sm font-medium transition hover:bg-opacity-10 hover:bg-white"
              style={{ borderColor: '#252538', borderWidth: '1px' }}
            >
              Send
            </Link>
            <Link
              to="/register-token"
              onClick={() => setIsOpen(false)}
              className="block text-white px-4 py-3 rounded-lg text-sm font-medium transition hover:bg-opacity-10 hover:bg-white"
              style={{ borderColor: '#252538', borderWidth: '1px' }}
            >
              Register Token
            </Link>
            <Link
              to="/developer/dashboard"
              onClick={() => setIsOpen(false)}
              className="block text-center px-4 py-3 rounded-lg text-sm font-medium transition hover:opacity-80"
              style={{ backgroundColor: '#35da9a', color: '#0e0d13' }}
            >
              Developer Console
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;