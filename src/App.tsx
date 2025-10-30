import './App.css';
import Main from './component/main';
import TokenPage from './component/TokenPage';
import { RegisterToken } from './component/registertoken';
import { VerifiedTokenDetails } from './component/VerifiedTokenDetails';
import Send from './examples/send';
import Signup from './developer/signup';
import Login from './developer/login';
import Dashboard from './developer/dashboard';
import Test from './developer/test';
import LandingPage from './landingPage/index';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChainProofWalletProvider } from './chainproofconnect/walletProvider';
import { AuthProvider } from './services/AuthContext';
import { ProtectedRoute } from './component/ProtectedRoute';
import { TerminalContextProvider } from 'react-terminal';

function App() {
  return (
    <TerminalContextProvider>
      <AuthProvider>
        <ChainProofWalletProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Main />} />
              <Route path="/token/:address" element={<TokenPage />} />
              <Route path="/register-token" element={<RegisterToken />} />
              <Route path="/verified-token/:mint" element={<VerifiedTokenDetails />} />
              <Route path="/send" element={<Send />} />

              {/* Developer Portal Routes */}
              <Route path="/developer/signup" element={<Signup />} />
              <Route path="/developer/login" element={<Login />} />
              <Route
                path="/developer/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer/test"
                element={
                  <ProtectedRoute>
                    <Test />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </ChainProofWalletProvider>
      </AuthProvider>
    </TerminalContextProvider>
  );
}

export default App;