import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-auto px-4 py-4" style={{ backgroundColor: '#181824', borderTop: '1px solid #252538' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-gray-500 text-xs">
            &copy; 2025 ChainProof. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-white transition text-xs">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition text-xs">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition text-xs">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
