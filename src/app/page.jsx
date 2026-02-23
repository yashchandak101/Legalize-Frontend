'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import Notifications from '../components/Notifications';
import GlobalSearch from '../components/GlobalSearch';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="navbar-brand">⚖️ Legalize</Link>
          <div className="navbar-links">
            {user ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/legal-aid">AI Legal Aid</Link>
                <Link href="/lawyers">Lawyers</Link>
                <Link href="/law-library">Law Library</Link>
                <GlobalSearch placeholder="Quick search..." />
                <Notifications user={user} />
                <button onClick={logout} className="btn btn-outline">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '120px 24px 80px',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
          zIndex: -1
        }}></div>
        
        <div className="animate-fade-in">
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '24px',
            fontWeight: 800,
            lineHeight: 1.1
          }}>
            AI Legal Aid, <br />Simplified
          </h1>
          
          <p style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
            color: 'var(--text-light)',
            maxWidth: '700px',
            margin: '0 auto 48px',
            lineHeight: 1.6,
            fontWeight: '400'
          }}>
            Get AI-powered legal assistance, upload documents, and receive intelligent analysis — all in one platform designed to make legal help accessible to everyone.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {user ? (
              <>
                <Link href="/legal-aid" className="btn btn-primary" style={{
                  padding: '16px 40px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  Try AI Legal Aid
                </Link>
                <Link href="/dashboard" className="btn btn-outline" style={{
                  padding: '16px 40px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary" style={{
                  padding: '16px 40px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  Get Started
                </Link>
                <Link href="/login" className="btn btn-outline" style={{
                  padding: '16px 40px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container" style={{ padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Everything You Need for Legal Success
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-light)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Comprehensive legal services powered by cutting-edge technology
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '32px',
          marginBottom: '80px'
        }}>
          {[
            {
              icon: '💬',
              title: 'AI Legal Chat',
              description: 'Chat with our AI legal assistant about your legal issues and get instant guidance.',
              color: 'var(--primary)'
            },
            {
              icon: '📄',
              title: 'Document Upload',
              description: 'Upload legal documents for AI analysis and insights during your conversation.',
              color: 'var(--success)'
            },
            {
              icon: '⚖️',
              title: 'Legal Categories',
              description: 'Specialized assistance for family, criminal, civil, corporate, and other legal areas.',
              color: 'var(--warning)'
            },
            {
              icon: '👨‍⚖️',
              title: 'Lawyer Request',
              description: 'Request a qualified lawyer when you need professional legal representation.',
              color: 'var(--info)'
            },
            {
              icon: '🔒',
              title: 'Private & Secure',
              description: 'Your legal conversations are completely confidential and encrypted.',
              color: 'var(--accent)'
            },
            {
              icon: '🌐',
              title: '24/7 Availability',
              description: 'Get legal assistance anytime, anywhere without waiting for appointments.',
              color: 'var(--danger)'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="card animate-fade-in"
              style={{
                textAlign: 'center',
                padding: '40px 32px',
                transition: 'all 0.3s ease',
                animationDelay: `${index * 0.1}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              <div style={{
                fontSize: '3.5rem',
                marginBottom: '24px',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                marginBottom: '16px',
                color: feature.color,
                fontWeight: '700'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '1rem',
                color: 'var(--text-light)',
                lineHeight: 1.6,
                marginBottom: '0'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          zIndex: 0
        }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px',
            textAlign: 'center'
          }}>
            {[
              { number: '500+', label: 'Expert Lawyers' },
              { number: '10,000+', label: 'Cases Managed' },
              { number: '98%', label: 'Client Satisfaction' },
              { number: '24/7', label: 'Support Available' }
            ].map((stat, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  color: 'white',
                  marginBottom: '8px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '500'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container" style={{ padding: '80px 24px' }}>
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
          border: '2px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '60px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'var(--gradient-primary)'
          }}></div>
          
          <h2 style={{
            fontSize: '2.5rem',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Ready to Get Started?
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-light)',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Join thousands of clients who trust Legalize for their legal needs. Start your journey today.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {!user && (
              <>
                <Link href="/register" className="btn btn-primary" style={{
                  padding: '16px 40px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  Start Free Trial
                </Link>
                <Link href="/lawyers" className="btn btn-outline" style={{
                  padding: '16px 40px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  Browse Lawyers
                </Link>
              </>
            )}
            {user && (
              <Link href="/dashboard" className="btn btn-primary" style={{
                padding: '16px 40px',
                fontSize: '1.1rem',
                fontWeight: '600',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)'
              }}>
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-tertiary)',
        padding: '60px 24px 40px',
        borderTop: '1px solid var(--border-light)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '48px',
            marginBottom: '48px'
          }}>
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ⚖️ Legalize
              </h3>
              <p style={{
                color: 'var(--text-light)',
                lineHeight: 1.6,
                marginBottom: '0'
              }}>
                Modern legal services platform connecting clients with expert lawyers.
              </p>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '1.1rem',
                marginBottom: '16px',
                color: 'var(--text)',
                fontWeight: '600'
              }}>
                Quick Links
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['About Us', 'Services', 'Lawyers', 'Pricing'].map((link) => (
                  <Link key={link} href="#" style={{
                    color: 'var(--text-light)',
                    textDecoration: 'none',
                    transition: 'var(--transition)',
                    fontSize: '0.95rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--text-light)';
                  }}>
                    {link}
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '1.1rem',
                marginBottom: '16px',
                color: 'var(--text)',
                fontWeight: '600'
              }}>
                Legal Resources
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Law Library', 'Legal Guides', 'FAQ', 'Blog'].map((link) => (
                  <Link key={link} href="#" style={{
                    color: 'var(--text-light)',
                    textDecoration: 'none',
                    transition: 'var(--transition)',
                    fontSize: '0.95rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--text-light)';
                  }}>
                    {link}
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h4 style={{
                fontSize: '1.1rem',
                marginBottom: '16px',
                color: 'var(--text)',
                fontWeight: '600'
              }}>
                Contact
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
                  📧 support@legalize.com
                </div>
                <div style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
                  📞 1-800-LEGALIZE
                </div>
                <div style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
                  💬 24/7 Live Chat
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '32px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            <p style={{ margin: '0' }}>
              © 2024 Legalize. All rights reserved. | Privacy Policy | Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
