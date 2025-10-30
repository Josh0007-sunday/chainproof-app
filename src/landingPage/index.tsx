import { Link } from 'react-router-dom';
import { useState } from 'react';

function LandingPage() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const partners = [
    { name: 'Solana', logo: 'https://images.seeklogo.com/logo-png/64/2/solana-logo-png_seeklogo-640266.png' },
    { name: 'Jupiter', logo: 'https://jup.ag/_next/image?url=%2Fsvg%2Fjupiter-logo.png&w=32&q=75' },
    { name: 'CoinGecko', logo: 'https://cdn.brandfetch.io/idst-2-NAE/w/800/h/825/theme/dark/symbol.png?c=1bxid64Mup7aczewSAYMX&t=1747723680910' },
    { name: 'Helius', logo: 'https://www.helius.dev/_next/image?url=%2Flogo.svg&w=256&q=90' }
  ];

  const features = [
    {
      title: 'Token Analysis',
      description: 'Real-time risk assessment and classification using our proprietary MU Algorithm.',
      icon: 'search'
    },
    {
      title: 'On-Chain Registry',
      description: 'Immutable token verification stored directly on the Solana blockchain.',
      icon: 'chain'
    },
    {
      title: 'Military-Grade Encryption',
      description: 'AES-256-GCM encryption library for secure on-chain data storage.',
      icon: 'lock'
    },
    {
      title: 'Developer API',
      description: 'Integrate ChainProof analysis into your applications with our robust API.',
      icon: 'code'
    }
  ];

  const stats = [
    { label: 'Tokens Analyzed', value: '0+' },
    { label: 'API Requests Daily', value: '0+' },
    { label: 'Verified Tokens', value: '0+' },
    { label: 'Analysis Time', value: '0s' }
  ];

  const renderIcon = (type: string) => {
    switch(type) {
      case 'search':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
        );
      case 'chain':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        );
      case 'lock':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        );
      case 'code':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        );
    }
  };

  return (
    <div style={{ backgroundColor: '#0e0d13', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center" style={{ backgroundColor: 'transparent' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(53, 218, 154, 0.1)',
              border: '1px solid rgba(53, 218, 154, 0.3)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          <span className="text-white text-2xl" style={{ fontWeight: 500, letterSpacing: '-0.01em' }}>ChainProof</span>
        </div>

        <div className="hidden md:flex gap-8 items-center">
          <a href="#home" className="text-gray-300 hover:text-white transition" style={{ fontWeight: 300 }}>Home</a>
          <a href="#services" className="text-gray-300 hover:text-white transition" style={{ fontWeight: 300 }}>Services</a>
          <a href="#features" className="text-gray-300 hover:text-white transition" style={{ fontWeight: 300 }}>Features</a>
          <a href="#api" className="text-gray-300 hover:text-white transition" style={{ fontWeight: 300 }}>API</a>
          <a href="#about" className="text-gray-300 hover:text-white transition" style={{ fontWeight: 300 }}>About</a>
        </div>

        <Link
          to="/dashboard"
          className="px-6 py-2 rounded-lg font-medium transition"
          style={{
            backgroundColor: hoveredButton === 'nav-try' ? 'rgba(53, 218, 154, 0.15)' : 'rgba(53, 218, 154, 0.1)',
            border: '1px solid #35da9a',
            color: '#35da9a'
          }}
          onMouseEnter={() => setHoveredButton('nav-try')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          Try it Now
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 overflow-hidden" id="home">
        {/* Glowing Green Bulbs */}
        <div
          className="absolute w-[800px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 100% 50%, rgba(53, 218, 154, 0.18) 0%, rgba(53, 218, 154, 0.12) 20%, rgba(53, 218, 154, 0.07) 40%, rgba(53, 218, 154, 0.03) 60%, transparent 80%)',
            filter: 'blur(120px)',
            left: '0',
            top: '50%',
            transform: 'translate(-60%, -45%)'
          }}
        ></div>

        <div
          className="absolute w-[800px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 0% 50%, rgba(53, 218, 154, 0.18) 0%, rgba(53, 218, 154, 0.12) 20%, rgba(53, 218, 154, 0.07) 40%, rgba(53, 218, 154, 0.03) 60%, transparent 80%)',
            filter: 'blur(120px)',
            right: '0',
            top: '50%',
            transform: 'translate(60%, -45%)'
          }}
        ></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 rounded-2xl opacity-30"
          style={{
            backgroundColor: 'rgba(53, 218, 154, 0.1)',
            border: '2px solid rgba(53, 218, 154, 0.3)',
            transform: 'rotate(15deg)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
          </div>
        </div>

        <div className="absolute top-32 right-10 w-24 h-24 rounded-2xl opacity-30"
          style={{
            backgroundColor: 'rgba(53, 218, 154, 0.1)',
            border: '2px solid rgba(53, 218, 154, 0.3)',
            transform: 'rotate(-10deg)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
              <path d="M12 16h.01"></path>
              <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
            </svg>
          </div>
        </div>

        <div className="absolute bottom-20 left-1/4 w-16 h-16 rounded-xl opacity-20"
          style={{
            backgroundColor: 'rgba(53, 218, 154, 0.1)',
            border: '2px solid rgba(53, 218, 154, 0.3)',
            transform: 'rotate(25deg)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
        </div>

        <div className="absolute bottom-32 right-1/4 w-20 h-20 rounded-2xl opacity-20"
          style={{
            backgroundColor: 'rgba(53, 218, 154, 0.1)',
            border: '2px solid rgba(53, 218, 154, 0.3)',
            transform: 'rotate(-20deg)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              backgroundColor: 'rgba(53, 218, 154, 0.1)',
              border: '1px solid rgba(53, 218, 154, 0.3)'
            }}
          >
            <span className="text-lg font-bold" style={{ color: '#35da9a' }}>#1</span>
            <span className="text-gray-300">On-Chain Transparency Protocol</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl text-white mb-6 leading-tight" style={{ fontWeight: 300, letterSpacing: '-0.02em' }}>
            Your Digital Fortress<br />
            <span style={{ color: '#35da9a', fontWeight: 400 }}>Starts Here.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed" style={{ fontWeight: 300 }}>
            Protect your investments from crypto scams with cutting-edge token verification,
            real-time risk monitoring, and a community of security experts on Solana.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-4 justify-center items-center">
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-lg text-lg transition flex items-center gap-2"
              style={{
                backgroundColor: hoveredButton === 'cta-analyze' ? '#2ec989' : '#35da9a',
                color: '#0e0d13',
                fontWeight: 500
              }}
              onMouseEnter={() => setHoveredButton('cta-analyze')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              Analyze a Token
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>

            <Link
              to="/developer/dashboard"
              className="px-8 py-4 rounded-lg text-lg transition"
              style={{
                backgroundColor: 'transparent',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted Partners Section */}
      <section className="px-6 py-16" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-500 mb-8 uppercase text-sm tracking-wider" style={{ fontWeight: 300 }}>
            Powered by
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-70">
            {partners.map((partner, index) => (
              <div key={index} className="flex items-center gap-3 hover:opacity-100 transition">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-8 w-auto object-contain"
                  style={{ filter: 'brightness(0.9)' }}
                />
                <span className="text-gray-400 text-lg" style={{ fontWeight: 400 }}>{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20" id="services">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-xl transition hover:scale-105 flex-1 min-w-[180px]"
                style={{
                  backgroundColor: 'rgba(24, 24, 36, 0.5)',
                  border: '1px solid rgba(53, 218, 154, 0.1)'
                }}
              >
                <div className="text-5xl mb-3" style={{ color: '#35da9a', fontWeight: 500 }}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-base" style={{ fontWeight: 300 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 relative overflow-hidden" id="features">
        {/* Background dots pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, rgba(53, 218, 154, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                backgroundColor: 'rgba(53, 218, 154, 0.1)',
                border: '1px solid rgba(53, 218, 154, 0.3)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <span className="text-sm" style={{ color: '#35da9a', fontWeight: 500 }}>Why Choose ChainProof</span>
            </div>

            <h2 className="text-4xl md:text-5xl text-white mb-4" style={{ fontWeight: 300, letterSpacing: '-0.02em' }}>
              Token Protection Isn't Just a Feature — It's<br />
              <span style={{ fontWeight: 400 }}>Our Foundation.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto" style={{ fontWeight: 300 }}>
              Built from the ground up to protect what matters most — your investments,
              your trust, and your financial security on Solana.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl transition hover:translate-y-[-4px]"
                style={{
                  backgroundColor: 'rgba(24, 24, 36, 0.6)',
                  border: '1px solid rgba(53, 218, 154, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(53, 218, 154, 0.3)';
                  e.currentTarget.style.backgroundColor = 'rgba(24, 24, 36, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(53, 218, 154, 0.1)';
                  e.currentTarget.style.backgroundColor = 'rgba(24, 24, 36, 0.6)';
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: 'rgba(53, 218, 154, 0.15)',
                    border: '1px solid rgba(53, 218, 154, 0.3)'
                  }}
                >
                  {renderIcon(feature.icon)}
                </div>
                <h3 className="text-xl text-white mb-3" style={{ fontWeight: 500 }}>{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm" style={{ fontWeight: 300 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20" style={{ backgroundColor: 'rgba(24, 24, 36, 0.3)' }} id="api">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How ChainProof Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Three simple steps to verify any token on Solana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Analyze',
                description: 'Enter a token mint address and our MU Algorithm instantly analyzes risk factors, liquidity, holders, and trading patterns.'
              },
              {
                step: '02',
                title: 'Verify',
                description: 'Review comprehensive risk scores, MEME vs UTILITY classification, and on-chain verification status.'
              },
              {
                step: '03',
                title: 'Trade Safely',
                description: 'Make informed decisions backed by blockchain-verified data and community validation.'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl font-bold"
                  style={{
                    backgroundColor: 'rgba(53, 218, 154, 0.1)',
                    border: '2px solid rgba(53, 218, 154, 0.3)',
                    color: '#35da9a'
                  }}
                >
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer API Section */}
      <section className="px-6 py-20 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(circle at center, rgba(53, 218, 154, 0.1) 0%, transparent 70%)'
        }}></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                backgroundColor: 'rgba(53, 218, 154, 0.1)',
                border: '1px solid rgba(53, 218, 154, 0.3)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              <span className="text-sm" style={{ color: '#35da9a', fontWeight: 500 }}>Developer API</span>
            </div>

            <h2 className="text-4xl md:text-5xl text-white mb-6" style={{ fontWeight: 300, letterSpacing: '-0.02em' }}>
              Build with <span style={{ fontWeight: 400, color: '#35da9a' }}>ChainProof API</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-12" style={{ fontWeight: 300 }}>
              Integrate powerful token analysis into your dApp with our developer-friendly API.
              Choose from two tiers to fit your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Free Tier */}
            <div
              className="p-8 rounded-2xl transition hover:translate-y-[-4px]"
              style={{
                backgroundColor: 'rgba(24, 24, 36, 0.6)',
                border: '1px solid rgba(53, 218, 154, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(53, 218, 154, 0.15)',
                    border: '1px solid rgba(53, 218, 154, 0.3)'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl text-white" style={{ fontWeight: 500 }}>Free Tier</h3>
                  <p className="text-gray-500 text-sm" style={{ fontWeight: 300 }}>Perfect for getting started</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-3xl text-white" style={{ fontWeight: 400 }}>100</span>
                <span className="text-gray-400 ml-2" style={{ fontWeight: 300 }}>requests / 15 min</span>
              </div>
              <ul className="space-y-2 text-gray-400 text-sm" style={{ fontWeight: 300 }}>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Token analysis API
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Risk scoring
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Basic support
                </li>
              </ul>
            </div>

            {/* Premium Tier */}
            <div
              className="p-8 rounded-2xl transition hover:translate-y-[-4px] relative"
              style={{
                backgroundColor: 'rgba(24, 24, 36, 0.8)',
                border: '1px solid rgba(53, 218, 154, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs" style={{ backgroundColor: 'rgba(53, 218, 154, 0.2)', color: '#35da9a', fontWeight: 500 }}>
                POPULAR
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(53, 218, 154, 0.2)',
                    border: '1px solid rgba(53, 218, 154, 0.4)'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl text-white" style={{ fontWeight: 500 }}>Premium Tier</h3>
                  <p className="text-gray-500 text-sm" style={{ fontWeight: 300 }}>For production apps</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-3xl" style={{ fontWeight: 400, color: '#35da9a' }}>500</span>
                <span className="text-gray-400 ml-2" style={{ fontWeight: 300 }}>requests / 15 min</span>
              </div>
              <ul className="space-y-2 text-gray-400 text-sm" style={{ fontWeight: 300 }}>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  All Free features
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Batch analysis
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Advanced analytics
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-row gap-4 justify-center">
            <Link
              to="/developer/dashboard"
              className="px-8 py-4 rounded-lg text-lg transition"
              style={{
                backgroundColor: hoveredButton === 'api-start' ? '#2ec989' : '#35da9a',
                color: '#0e0d13',
                fontWeight: 500
              }}
              onMouseEnter={() => setHoveredButton('api-start')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              Get Started
            </Link>
            <Link
              to="/developer/test"
              className="px-8 py-4 rounded-lg text-lg transition"
              style={{
                backgroundColor: 'transparent',
                border: '2px solid rgba(53, 218, 154, 0.3)',
                color: '#35da9a',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(53, 218, 154, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(53, 218, 154, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(53, 218, 154, 0.3)';
              }}
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20" id="about">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Protect Your Investments?
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            Join thousands of traders using ChainProof to verify tokens before investing.
          </p>
          <Link
            to="/dashboard"
            className="inline-block px-10 py-5 rounded-xl font-semibold text-lg transition"
            style={{
              backgroundColor: hoveredButton === 'final-cta' ? '#2ec989' : '#35da9a',
              color: '#0e0d13'
            }}
            onMouseEnter={() => setHoveredButton('final-cta')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            Start Analyzing Tokens Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(53, 218, 154, 0.1)',
                    border: '1px solid rgba(53, 218, 154, 0.3)'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#35da9a" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </div>
                <span className="text-white text-xl font-bold">ChainProof</span>
              </div>
              <p className="text-gray-500 text-sm">
                On-chain transparency protocol for Solana token verification.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-gray-500 hover:text-white transition text-sm">Token Analysis</Link></li>
                <li><Link to="/register-token" className="text-gray-500 hover:text-white transition text-sm">Register Token</Link></li>
                <li><Link to="/developer/dashboard" className="text-gray-500 hover:text-white transition text-sm">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Developers</h4>
              <ul className="space-y-2">
                <li><Link to="/developer/dashboard" className="text-gray-500 hover:text-white transition text-sm">Dashboard</Link></li>
                <li><Link to="/developer/test" className="text-gray-500 hover:text-white transition text-sm">API Docs</Link></li>
                <li><a href="https://github.com" className="text-gray-500 hover:text-white transition text-sm">GitHub</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-500 hover:text-white transition text-sm">About</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition text-sm">Blog</a></li>
                <li><a href="#" className="text-gray-500 hover:text-white transition text-sm">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                &copy; 2025 ChainProof. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-500 hover:text-white transition text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-500 hover:text-white transition text-sm">Terms of Service</a>
                <a href="#" className="text-gray-500 hover:text-white transition text-sm">Security</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
