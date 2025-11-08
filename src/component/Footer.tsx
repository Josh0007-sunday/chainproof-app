import { useTheme } from '../context/ThemeContext';

function Footer() {
  const { colors } = useTheme();

  return (
    <footer className="mt-auto px-4 py-4" style={{ backgroundColor: colors.backgroundSecondary, borderTop: `1px solid ${colors.border}` }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs" style={{ color: colors.textTertiary }}>
            &copy; 2025 ChainProof. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="transition text-xs hover:opacity-70" style={{ color: colors.textTertiary }}>
              Privacy Policy
            </a>
            <a href="#" className="transition text-xs hover:opacity-70" style={{ color: colors.textTertiary }}>
              Terms of Service
            </a>
            <a href="#" className="transition text-xs hover:opacity-70" style={{ color: colors.textTertiary }}>
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
