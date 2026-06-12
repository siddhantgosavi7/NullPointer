import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LoginGrassBackground from '../components/LoginGrassBackground';
import '../styles/Login.css';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { currentUser, login, signup } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPass) {
      setLoginError(t('auth.errors.fillBothFields'));
      return;
    }
    if (!loginEmail.includes('@')) {
      setLoginError(t('auth.errors.invalidEmail'));
      return;
    }
    if (loginPass.length < 6) {
      setLoginError(t('auth.errors.passwordLength'));
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail, loginPass);
      // navigation is handled by the useEffect watching currentUser
    } catch (err) {
      setLoginError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName || !regEmail || !regPass || !regConfirm) {
      setRegError(t('auth.errors.fillFields'));
      return;
    }
    if (!regEmail.includes('@')) {
      setRegError(t('auth.errors.invalidEmail'));
      return;
    }
    if (regPass.length < 6) {
      setRegError(t('auth.errors.passwordLength'));
      return;
    }
    if (regPass !== regConfirm) {
      setRegError(t('auth.errors.passwordsMismatch'));
      return;
    }

    setLoading(true);
    try {
      await signup(regEmail, regPass, regName);
      setRegSuccess(t('auth.success.registerSuccess', { name: regName }));
      // navigation is handled by the useEffect watching currentUser
    } catch (err) {
      setRegError(err.message || 'Failed to register.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    setLoginError('');
    const email = loginEmail.trim();
    if (!email) {
      setLoginError(t('auth.errors.forgotEmailFirst'));
      return;
    }
    setLoginSuccessMsg(t('auth.success.resetSent', { email }));
  };

  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');

  // Auto hide alerts after 5 seconds
  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  useEffect(() => {
    if (loginSuccessMsg) {
      const timer = setTimeout(() => setLoginSuccessMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [loginSuccessMsg]);

  useEffect(() => {
    if (regError) {
      const timer = setTimeout(() => setRegError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [regError]);

  useEffect(() => {
    if (regSuccess) {
      const timer = setTimeout(() => setRegSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [regSuccess]);

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="login-page-container">
      {/* 3D WebGL Grass Background layer */}
      <LoginGrassBackground />

      {/* Floating nav brand and language select */}
      <nav className="nav-float visible" style={{ position: 'fixed', top: '24px', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', zIndex: 10, pointerEvents: 'none' }}>
        <a href="/" className="nav-logo" style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'rgba(245, 250, 230, 0.8)', letterSpacing: '1px', pointerEvents: 'auto', textDecoration: 'none' }}>
          {t('navigation.brand')}
        </a>
        <div className="lang-select-wrapper" style={{ pointerEvents: 'auto' }}>
          <select 
            value={i18n.language || 'en'} 
            onChange={changeLanguage}
            className="language-select" 
            style={{
              background: 'rgba(10, 15, 10, 0.6)',
              color: '#fff',
              border: '1px solid rgba(140, 180, 120, 0.15)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </nav>

      {/* Center card overlay */}
      <div id="overlay">
        <div className="auth-card">
          <span className="card-label">{t('auth.tag')}</span>

          <h1 className="card-heading">
            {activeTab === 'login' ? (
              <span dangerouslySetInnerHTML={{ __html: t('auth.login.heading') }} />
            ) : (
              <span dangerouslySetInnerHTML={{ __html: t('auth.register.heading') }} />
            )}
          </h1>

          <p className="card-subtext">
            {activeTab === 'login' ? t('auth.login.sub') : t('auth.register.sub')}
          </p>

          {/* Tab switches */}
          <div className="tab-row">
            <button 
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => { setActiveTab('login'); setLoginError(''); setRegError(''); setRegSuccess(''); }}
            >
              {t('auth.tabs.signin')}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => { setActiveTab('register'); setLoginError(''); setRegError(''); setRegSuccess(''); }}
            >
              {t('auth.tabs.register')}
            </button>
          </div>

          {/* LOGIN FORM PANEL */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="panel active" style={{ width: '100%' }}>
              {loginError && <div className="msg error show">{loginError}</div>}
              {loginSuccessMsg && <div className="msg success show">{loginSuccessMsg}</div>}

              <div className="field">
                <label htmlFor="loginEmail">{t('auth.labels.email')}</label>
                <input 
                  type="email" 
                  id="loginEmail" 
                  placeholder={t('auth.placeholders.email')}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label htmlFor="loginPass">{t('auth.labels.password')}</label>
                <input 
                  type={showLoginPass ? 'text' : 'password'} 
                  id="loginPass" 
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  className="eye-btn" 
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  tabIndex="-1"
                >
                  {showLoginPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              <div className="forgot-row">
                <a className="forgot-link" href="#" onClick={handleForgot}>
                  {t('auth.forgot')}
                </a>
              </div>

              <button type="submit" className={`btn-submit ${loading ? 'loading' : ''}`}>
                <div className="spinner" />
                <span className="btn-text">{t('auth.tabs.signin')}</span>
              </button>
            </form>
          )}

          {/* REGISTER FORM PANEL */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="panel active" style={{ width: '100%' }}>
              {regError && <div className="msg error show">{regError}</div>}
              {regSuccess && <div className="msg success show">{regSuccess}</div>}

              <div className="field">
                <label htmlFor="regName">{t('auth.labels.name')}</label>
                <input 
                  type="text" 
                  id="regName" 
                  placeholder={t('auth.placeholders.name')}
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div className="field">
                <label htmlFor="regEmail">{t('auth.labels.email')}</label>
                <input 
                  type="email" 
                  id="regEmail" 
                  placeholder={t('auth.placeholders.email')}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label htmlFor="regPass">{t('auth.labels.password')}</label>
                <input 
                  type={showRegPass ? 'text' : 'password'} 
                  id="regPass" 
                  placeholder={t('auth.placeholders.password')}
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  className="eye-btn" 
                  onClick={() => setShowRegPass(!showRegPass)}
                  tabIndex="-1"
                >
                  {showRegPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              <div className="field" style={{ marginBottom: '22px' }}>
                <label htmlFor="regConfirm">{t('auth.labels.confirmPassword')}</label>
                <input 
                  type={showRegPass ? 'text' : 'password'} 
                  id="regConfirm" 
                  placeholder={t('auth.placeholders.confirmPassword')}
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" className={`btn-submit ${loading ? 'loading' : ''}`}>
                <div className="spinner" />
                <span className="btn-text">{t('auth.tabs.register')}</span>
              </button>
            </form>
          )}

          <div className="divider" />
          <p className="card-footer">
            {activeTab === 'login' ? t('auth.login.footer') : t('auth.register.footer')}
          </p>
        </div>
      </div>
    </div>
  );
}
