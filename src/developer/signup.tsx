import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register(formData.username, formData.email, formData.password);

    if (result.success) {
      navigate('/developer/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0e0d13' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-bold text-white mb-2">ChainProof</h1>
          </Link>
          <p className="text-sm" style={{ color: '#6b7280' }}>Developer Portal</p>
        </div>

        <div className="rounded-lg p-8" style={{ backgroundColor: '#181824' }}>
          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

          {error && (
            <div className="border px-4 py-3 rounded-lg mb-6" style={{ backgroundColor: '#ff000020', borderColor: '#ff0000', color: '#ffcccc' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg text-white focus:outline-none transition"
                style={{ backgroundColor: '#0e0d13', borderColor: '#252538ff', borderWidth: '1px' }}
                placeholder="johndoe"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg text-white focus:outline-none transition"
                style={{ backgroundColor: '#0e0d13', borderColor: '#252538ff', borderWidth: '1px' }}
                placeholder="john@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg text-white focus:outline-none transition"
                style={{ backgroundColor: '#0e0d13', borderColor: '#252538ff', borderWidth: '1px' }}
                placeholder="Enter password"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg text-white focus:outline-none transition"
                style={{ backgroundColor: '#0e0d13', borderColor: '#252538ff', borderWidth: '1px' }}
                placeholder="Confirm password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 px-4 rounded-lg font-medium transition hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: '#35da9a', borderWidth: '1px' }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Already have an account?{' '}
              <Link to="/developer/login" className="font-semibold transition hover:opacity-80" style={{ color: '#35da9a' }}>
                Log In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm transition hover:opacity-80" style={{ color: '#6b7280' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
