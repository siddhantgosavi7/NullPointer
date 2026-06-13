import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomeGrassBackground from '../components/HomeGrassBackground';
import '../styles/Home.css';

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState({ overrideStage: -1 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [appsDesktopOpen, setAppsDesktopOpen] = useState(false);
  const [appsMobileOpen, setAppsMobileOpen] = useState(false);
  
  // Settings edit panel state
  const [editorMode, setEditorMode] = useState('scroll');
  const [activeEditStage, setActiveEditStage] = useState(-1);
  const [expandedEditStage, setExpandedEditStage] = useState(-1);
  const [globalDof, setGlobalDof] = useState(true);
  const [fpsOn, setFpsOn] = useState(false);

  // Force component re-render when editing uniforms
  const [, forceUpdate] = useState(0);
  const triggerUpdate = () => forceUpdate(n => n + 1);

  const activeStageRef = useRef({ overrideStage: -1 });

  // Update activeStageRef when state changes
  useEffect(() => {
    activeStageRef.current = activeStage;
  }, [activeStage]);

  // Reveal elements on scroll using intersection observer
  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.getAttribute('data-delay') || '0';
          el.classList.add('revealed', `delay-${delay}`);
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -18% 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

    // Force reveal hint
    const hintTimer = setTimeout(() => {
      const hint = document.querySelector('.scroll-hint');
      if (hint && !hint.classList.contains('revealed')) {
        hint.classList.add('revealed', 'delay-4');
      }
    }, 800);

    // Keyboard 'S' key listener for settings
    const handleKeyDown = (e) => {
      if (e.key === 's' || e.key === 'S') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        setSettingsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      revealObserver.disconnect();
      clearTimeout(hintTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const scrollToStage = (stageIdx) => {
    const section = document.querySelector(`.section[data-stage="${stageIdx}"]`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMenuOpen(false);
  };

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const triggerWindBurst = () => {
    const event = new CustomEvent('wind_burst_trigger');
    window.dispatchEvent(event);
  };

  // Settings Panel Helper Methods
  const getUniforms = () => window._homeGrassUniforms || null;

  const handleModeChange = (mode) => {
    setEditorMode(mode);
    const u = getUniforms();
    if (!u) return;

    if (mode === 'scroll') {
      setActiveStage({ overrideStage: -1 });
      setActiveEditStage(-1);
      setExpandedEditStage(-1);
    } else {
      selectStageForEditing(0);
    }
  };

  const selectStageForEditing = (idx) => {
    setActiveEditStage(idx);
    setActiveStage({ overrideStage: idx });
    scrollToStage(idx);
    
    // Force apply variables to viewport scroll progress
    const u = getUniforms();
    if (u) {
      // Sync focus settings
      const kf = u.cameraPath[idx];
      const sp = u.stageParams[idx];
      
      // Update state so sliders render correct values
      triggerUpdate();
    }
  };

  const toggleStageExpand = (idx) => {
    if (activeEditStage !== idx) {
      selectStageForEditing(idx);
    }
    setExpandedEditStage(prev => (prev === idx ? -1 : idx));
  };

  const handleSliderChange = (stageIdx, paramKey, value) => {
    const u = getUniforms();
    if (!u) return;
    u.stageParams[stageIdx][paramKey] = value;
    triggerUpdate();
  };

  const handleColorChange = (stageIdx, colorName, hexValue) => {
    const u = getUniforms();
    if (!u) return;
    
    const r = parseInt(hexValue.substring(1, 3), 16) / 255;
    const g = parseInt(hexValue.substring(3, 5), 16) / 255;
    const b = parseInt(hexValue.substring(5, 7), 16) / 255;

    // Map channels
    if (colorName === 'fogColor') {
      u.stageParams[stageIdx].fogR = r;
      u.stageParams[stageIdx].fogG = g;
      u.stageParams[stageIdx].fogB = b;
    } else if (colorName === 'bladeBaseColor') {
      u.stageParams[stageIdx].bladeBaseR = r;
      u.stageParams[stageIdx].bladeBaseG = g;
      u.stageParams[stageIdx].bladeBaseB = b;
    } else if (colorName === 'bladeTipColor') {
      u.stageParams[stageIdx].bladeTipR = r;
      u.stageParams[stageIdx].bladeTipG = g;
      u.stageParams[stageIdx].bladeTipB = b;
    } else if (colorName === 'goldenTipColor') {
      u.stageParams[stageIdx].goldenTipR = r;
      u.stageParams[stageIdx].goldenTipG = g;
      u.stageParams[stageIdx].goldenTipB = b;
    } else if (colorName === 'greenTipColor') {
      u.stageParams[stageIdx].greenTipR = r;
      u.stageParams[stageIdx].greenTipG = g;
      u.stageParams[stageIdx].greenTipB = b;
    } else if (colorName === 'midColor') {
      u.stageParams[stageIdx].midR = r;
      u.stageParams[stageIdx].midG = g;
      u.stageParams[stageIdx].midB = b;
    }
    
    triggerUpdate();
  };

  const handleGlobalColorChange = (key, hexValue) => {
    const u = getUniforms();
    if (!u) return;
    
    if (key === 'Background') {
      u.backgroundColor.value.set(hexValue);
      u.scene.background.set(hexValue);
    } else if (key === 'Ground') {
      u.groundColor.value.set(hexValue);
    }
    triggerUpdate();
  };

  const handleSkyColorChange = (key, hexValue) => {
    const u = getUniforms();
    if (!u) return;
    
    u.skyColors[key].set(hexValue);
    u.scene.background = u.buildSkyTexture();
    triggerUpdate();
  };

  const handleDofToggle = (stageIdx) => {
    const u = getUniforms();
    if (!u) return;
    const kf = u.cameraPath[stageIdx];
    kf[9] = kf[9] ? 0 : 1;
    u.rebuildPipeline();
    triggerUpdate();
  };

  const handleAutoFocusToggle = (stageIdx) => {
    const u = getUniforms();
    if (!u) return;
    const kf = u.cameraPath[stageIdx];
    kf[8] = kf[8] ? 0 : 1;
    triggerUpdate();
  };

  const handleCameraPathSliderChange = (stageIdx, index, val) => {
    const u = getUniforms();
    if (!u) return;
    u.cameraPath[stageIdx][index] = val;
    triggerUpdate();
  };

  const handleGlobalDofToggle = () => {
    const u = getUniforms();
    if (!u) return;
    const current = u.globalDofEnabled();
    u.setGlobalDofEnabled(!current);
    setGlobalDof(!current);
    if (current) {
      u.setDofEnabled(false);
      u.rebuildPipeline();
    }
    triggerUpdate();
  };

  const copyPathJSON = () => {
    const u = getUniforms();
    if (!u) return;
    const json = JSON.stringify(u.cameraPath.map((kf, i) => ({
      stage: u.stageNames[i],
      scroll: kf[0],
      pos: { x: kf[1], y: kf[2], z: kf[3] },
      look: { x: kf[4], y: kf[5], z: kf[6] },
      focusDist: kf[7],
      autoFocus: !!kf[8],
      dofEnabled: !!kf[9],
      focalLength: kf[10],
      bokehScale: kf[11],
      afSpeed: kf[12],
      afMin: kf[13],
      afMax: kf[14],
      params: u.stageParams[i],
    })), null, 2);

    navigator.clipboard.writeText(json).then(() => {
      alert('Camera path configuration JSON copied to clipboard!');
    });
  };

  const handleTypoColorChange = (cssVar, hexValue) => {
    document.documentElement.style.setProperty(cssVar, hexValue);
    triggerUpdate();
  };

  const u = getUniforms();

  return (
    <div className="home-page-container">
      {/* 3D WebGPU Grass Simulation Layer */}
      <HomeGrassBackground activeStageState={activeStage} />

      {/* Scroll Progress Indicator */}
      <div className="progress-bar" id="progressBar" />

      {/* Floating Header */}
      <nav className="nav-float" id="navFloat">
        <div className="nav-logo" style={{ fontFamily: 'var(--font-serif)' }}>{t('navigation.brand')}</div>
        <div className="nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); scrollToStage(1); }}>{t('landing.nav.mission')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); scrollToStage(2); }}>{t('landing.nav.pillars')}</a>
          <a href="#" onClick={(e) => { e.preventDefault(); scrollToStage(3); }}>{t('landing.nav.impact')}</a>
          <Link to="/login">{t('landing.nav.login')}</Link>

          {/* Lang Selector */}
          <div className="lang-select-wrapper" style={{ marginLeft: '10px', display: 'inline-flex', alignItems: 'center' }}>
            <select 
              value={i18n.language || 'en'} 
              onChange={changeLanguage}
              className="language-select" 
              style={{
                background: 'rgba(10, 15, 10, 0.6)',
                color: '#fff',
                border: '1px solid rgba(140, 180, 120, 0.15)',
                borderRadius: '6px',
                padding: '4px 8px',
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

          {/* Reusable Apps Dropdown */}
          <div className={`app-dropdown-wrapper ${appsDesktopOpen ? 'open' : ''}`} style={{ marginLeft: '20px', verticalAlign: 'middle' }}>
            <button 
              className="app-menu-btn" 
              onClick={(e) => { e.stopPropagation(); setAppsDesktopOpen(!appsDesktopOpen); }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            {appsDesktopOpen && (
              <div className="app-dropdown-content">
                <Link to="/dashboard" onClick={() => setAppsDesktopOpen(false)}>{t('navigation.dashboard')}</Link>
                <Link to="/assistant" onClick={() => setAppsDesktopOpen(false)}>{t('navigation.assistant')}</Link>
                <Link to="/disease" onClick={() => setAppsDesktopOpen(false)}>{t('navigation.diseaseDetection')}</Link>
                <Link to="/crop" onClick={() => setAppsDesktopOpen(false)}>{t('navigation.cropRecommendation')}</Link>
                <Link to="/weather" onClick={() => setAppsDesktopOpen(false)}>{t('navigation.weather')}</Link>
                <Link to="/irrigation" onClick={() => setAppsDesktopOpen(false)}>{t('navigation.irrigation')}</Link>
                <Link to="/market" onClick={() => setAppsDesktopOpen(false)}>{t('navigation.market')}</Link>
                <Link to="/schemes" onClick={() => setAppsDesktopOpen(false)}>{t('navigation.schemes')}</Link>
                <Link to="/profile" onClick={() => setAppsDesktopOpen(false)}>{t('navigation.profile')}</Link>
                <Link to="/alerts" onClick={() => setAppsDesktopOpen(false)}>{t('navigation.alerts')}</Link>
                <Link to="/analytics" onClick={() => setAppsDesktopOpen(false)}>{t('navigation.analytics')}</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger menu trigger */}
        <button 
          className={`nav-hamburger ${menuOpen ? 'open' : ''}`} 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span></span><span></span><span></span>
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div className={`nav-mobile-overlay ${menuOpen ? 'open' : ''}`}>
        <a href="#" onClick={(e) => { e.preventDefault(); scrollToStage(1); }}>{t('landing.nav.mission')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); scrollToStage(2); }}>{t('landing.nav.pillars')}</a>
        <a href="#" onClick={(e) => { e.preventDefault(); scrollToStage(3); }}>{t('landing.nav.impact')}</a>
        <Link to="/login" onClick={() => setMenuOpen(false)}>{t('landing.nav.login')}</Link>

        {/* Mobile Lang select */}
        <div className="lang-select-wrapper" style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center' }}>
          <select 
            value={i18n.language || 'en'} 
            onChange={changeLanguage}
            className="language-select" 
            style={{
              background: 'rgba(10, 15, 10, 0.85)',
              color: '#fff',
              border: '1px solid rgba(140, 180, 120, 0.15)',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
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

        {/* Mobile Apps dropdown */}
        <div className={`app-dropdown-wrapper ${appsMobileOpen ? 'open' : ''}`} style={{ marginTop: '20px' }}>
          <button 
            className="app-menu-btn" 
            onClick={(e) => { e.stopPropagation(); setAppsMobileOpen(!appsMobileOpen); }}
            style={{ margin: '0 auto' }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span style={{ marginLeft: '10px', fontSize: '14px', letterSpacing: '2px' }}>APPS</span>
          </button>
          {appsMobileOpen && (
            <div className="app-dropdown-content" style={{ position: 'relative', top: '10px', right: 'auto', transform: 'none' }}>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>{t('navigation.dashboard')}</Link>
              <Link to="/assistant" onClick={() => setMenuOpen(false)}>{t('navigation.assistant')}</Link>
              <Link to="/disease" onClick={() => setMenuOpen(false)}>{t('navigation.diseaseDetection')}</Link>
              <Link to="/crop" onClick={() => setMenuOpen(false)}>{t('navigation.cropRecommendation')}</Link>
              <Link to="/weather" onClick={() => setMenuOpen(false)}>{t('navigation.weather')}</Link>
              <Link to="/irrigation" onClick={() => setMenuOpen(false)}>{t('navigation.irrigation')}</Link>
              <Link to="/market" onClick={() => setMenuOpen(false)}>{t('navigation.market')}</Link>
              <Link to="/schemes" onClick={() => setMenuOpen(false)}>{t('navigation.schemes')}</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>{t('navigation.profile')}</Link>
              <Link to="/alerts" onClick={() => setMenuOpen(false)}>{t('navigation.alerts')}</Link>
              <Link to="/analytics" onClick={() => setMenuOpen(false)}>{t('navigation.analytics')}</Link>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel Gear button */}
      <button 
        className={`settings-gear ${settingsOpen ? 'active' : ''}`}
        onClick={() => setSettingsOpen(!settingsOpen)}
        aria-label="Settings"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
        </svg>
      </button>

      {/* Floating Settings Drawer Panel (Pure React bound to window uniforms) */}
      <div className={`settings-panel ${settingsOpen ? 'open' : ''}`}>
        {u ? (
          <>
            {/* Global colors */}
            <div className="sp-section">
              <div className="sp-section-title">Global Colors</div>
              <div className="sp-color-row">
                <span className="sp-label">Background</span>
                <input 
                  type="color" 
                  className="sp-color-input" 
                  value={'#' + u.backgroundColor.value.getHexString()} 
                  onChange={(e) => handleGlobalColorChange('Background', e.target.value)}
                />
              </div>
              <div className="sp-color-row">
                <span className="sp-label">Ground</span>
                <input 
                  type="color" 
                  className="sp-color-input" 
                  value={'#' + u.groundColor.value.getHexString()} 
                  onChange={(e) => handleGlobalColorChange('Ground', e.target.value)}
                />
              </div>
            </div>

            {/* Sky Gradient */}
            <div className="sp-section">
              <div className="sp-section-title">Sky Gradient</div>
              {Object.keys(u.skyColors).map((key, idx) => (
                <div className="sp-color-row" key={idx}>
                  <span className="sp-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <input 
                    type="color" 
                    className="sp-color-input" 
                    value={'#' + u.skyColors[key].getHexString()} 
                    onChange={(e) => handleSkyColorChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Camera Path editor */}
            <div className="sp-section">
              <div className="sp-section-title">Camera Path</div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <button 
                  onClick={() => handleModeChange('scroll')}
                  style={{
                    flex: 1, fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '7px 0',
                    border: '1px solid rgba(140,180,120,0.3)', borderRadius: '6px',
                    background: editorMode === 'scroll' ? 'rgba(120,180,80,0.25)' : 'rgba(140,180,120,0.06)',
                    color: editorMode === 'scroll' ? 'rgba(200,220,140,0.9)' : 'rgba(180,210,140,0.4)',
                    cursor: 'pointer', transition: 'all 0.3s', fontWeight: 500
                  }}
                >
                  ⏵ Scroll
                </button>
                <button 
                  onClick={() => handleModeChange('edit')}
                  style={{
                    flex: 1, fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '7px 0',
                    border: '1px solid rgba(140,180,120,0.3)', borderRadius: '6px',
                    background: editorMode === 'edit' ? 'rgba(120,180,80,0.25)' : 'rgba(140,180,120,0.06)',
                    color: editorMode === 'edit' ? 'rgba(200,220,140,0.9)' : 'rgba(180,210,140,0.4)',
                    cursor: 'pointer', transition: 'all 0.3s', fontWeight: 500
                  }}
                >
                  ✎ Edit
                </button>
              </div>

              <div style={{ fontSize: '10px', color: 'rgba(180,210,140,0.3)', marginBottom: '10px', lineHeight: '1.5' }}>
                {editorMode === 'scroll' ? 'Scroll mode — camera follows scroll position naturally.' : 'Edit mode — click a stage to lock camera & tweak values.'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <button 
                  onClick={copyPathJSON}
                  style={{
                    fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 10px',
                    border: '1px solid rgba(140,180,120,0.2)', borderRadius: '4px',
                    background: 'rgba(140,180,120,0.08)', color: 'rgba(180,210,140,0.5)',
                    cursor: 'pointer', transition: 'all 0.3s', whiteSpace: 'nowrap'
                  }}
                >
                  Copy JSON
                </button>
              </div>

              {/* Loop through each camera keyframe stage */}
              {u.cameraPath.map((kf, idx) => {
                const name = u.stageNames[idx];
                const params = u.stageParams[idx];
                const isStageSelected = activeEditStage === idx;
                const isStageExpanded = expandedEditStage === idx;

                return (
                  <div 
                    key={idx} 
                    className="cp-stage" 
                    style={{ 
                      marginBottom: '8px', 
                      border: '1px solid rgba(140,180,120,0.08)', 
                      borderRadius: '8px', 
                      overflow: 'hidden', 
                      cursor: editorMode === 'edit' ? 'pointer' : 'default',
                      borderColor: isStageSelected ? 'rgba(180,210,140,0.35)' : 'rgba(140,180,120,0.08)',
                      opacity: editorMode === 'edit' ? 1 : 0.5,
                      pointerEvents: editorMode === 'edit' ? 'auto' : 'none'
                    }}
                  >
                    <div 
                      className="cp-header"
                      onClick={() => toggleStageExpand(idx)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(140,180,120,0.04)' }}
                    >
                      <span className="sp-label" style={{ color: 'rgba(180,210,140,0.5)', fontWeight: 500 }}>{name}</span>
                      <span style={{ fontSize: '9px', color: 'rgba(180,210,140,0.25)' }}>{isStageExpanded ? '▾' : '▸'}</span>
                    </div>

                    {isStageExpanded && (
                      <div className="cp-controls" style={{ padding: '6px 10px 10px' }}>
                        {/* Cam pos controls */}
                        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(180,210,140,0.3)', marginBottom: '8px' }}>Camera Pos / Look</div>
                        
                        <div className="sp-row"><span class="sp-label">Pos X</span><span className="sp-val">{kf[1].toFixed(1)}</span></div>
                        <input type="range" className="sp-slider" min="-10" max="10" step="0.1" value={kf[1]} onChange={(e) => handleCameraPathSliderChange(idx, 1, parseFloat(e.target.value))} />
                        
                        <div className="sp-row"><span class="sp-label">Pos Y</span><span className="sp-val">{kf[2].toFixed(1)}</span></div>
                        <input type="range" className="sp-slider" min="0.1" max="15" step="0.1" value={kf[2]} onChange={(e) => handleCameraPathSliderChange(idx, 2, parseFloat(e.target.value))} />
                        
                        <div className="sp-row"><span class="sp-label">Pos Z</span><span className="sp-val">{kf[3].toFixed(1)}</span></div>
                        <input type="range" className="sp-slider" min="0" max="25" step="0.1" value={kf[3]} onChange={(e) => handleCameraPathSliderChange(idx, 3, parseFloat(e.target.value))} />

                        <div className="sp-row"><span class="sp-label">Look X</span><span className="sp-val">{kf[4].toFixed(1)}</span></div>
                        <input type="range" className="sp-slider" min="-5" max="5" step="0.1" value={kf[4]} onChange={(e) => handleCameraPathSliderChange(idx, 4, parseFloat(e.target.value))} />
                        
                        <div className="sp-row"><span class="sp-label">Look Y</span><span className="sp-val">{kf[5].toFixed(1)}</span></div>
                        <input type="range" className="sp-slider" min="-2" max="3" step="0.1" value={kf[5]} onChange={(e) => handleCameraPathSliderChange(idx, 5, parseFloat(e.target.value))} />

                        <div className="sp-row"><span class="sp-label">Look Z</span><span className="sp-val">{kf[6].toFixed(1)}</span></div>
                        <input type="range" className="sp-slider" min="-10" max="10" step="0.1" value={kf[6]} onChange={(e) => handleCameraPathSliderChange(idx, 6, parseFloat(e.target.value))} />

                        <div style={{ height: '1px', background: 'rgba(140,180,120,0.08)', margin: '8px 0' }} />

                        {/* DoF */}
                        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(180,210,140,0.3)', marginBottom: '8px' }}>Depth of Field</div>
                        <div className="sp-toggle-row">
                          <span className="sp-label">DoF Enabled</span>
                          <div className={`sp-toggle ${kf[9] ? 'active' : ''}`} onClick={() => handleDofToggle(idx)} />
                        </div>

                        {kf[9] ? (
                          <div>
                            <div className="sp-toggle-row">
                              <span className="sp-label">Auto Focus</span>
                              <div className={`sp-toggle ${kf[8] ? 'active' : ''}`} onClick={() => handleAutoFocusToggle(idx)} />
                            </div>

                            {!kf[8] && (
                              <div>
                                <div className="sp-row"><span class="sp-label">Focus Dist</span><span className="sp-val">{kf[7].toFixed(1)}</span></div>
                                <input type="range" className="sp-slider" min="0.3" max="40" step="0.1" value={kf[7]} onChange={(e) => handleCameraPathSliderChange(idx, 7, parseFloat(e.target.value))} />
                              </div>
                            )}

                            <div className="sp-row"><span class="sp-label">Focal Length</span><span className="sp-val">{kf[10].toFixed(1)}</span></div>
                            <input type="range" className="sp-slider" min="0.1" max="20" step="0.1" value={kf[10]} onChange={(e) => handleCameraPathSliderChange(idx, 10, parseFloat(e.target.value))} />

                            <div className="sp-row"><span class="sp-label">Bokeh Scale</span><span className="sp-val">{kf[11].toFixed(1)}</span></div>
                            <input type="range" className="sp-slider" min="0" max="40" step="0.5" value={kf[11]} onChange={(e) => handleCameraPathSliderChange(idx, 11, parseFloat(e.target.value))} />
                          </div>
                        ) : null}

                        {/* Grass specific parameters edit */}
                        <div style={{ height: '1px', background: 'rgba(140,180,120,0.08)', margin: '8px 0' }} />
                        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(180,210,140,0.3)', marginBottom: '8px' }}>Grass Parameters</div>
                        
                        <div className="sp-row"><span class="sp-label">Density</span><span className="sp-val">{params.grassDensity.toFixed(2)}</span></div>
                        <input type="range" className="sp-slider" min="0" max="1" step="0.01" value={params.grassDensity} onChange={(e) => handleSliderChange(idx, 'grassDensity', parseFloat(e.target.value))} />
                        
                        <div className="sp-row"><span class="sp-label">Blade Height</span><span className="sp-val">{params.bladeHeight.toFixed(2)}</span></div>
                        <input type="range" className="sp-slider" min="0.1" max="2" step="0.05" value={params.bladeHeight} onChange={(e) => handleSliderChange(idx, 'bladeHeight', parseFloat(e.target.value))} />

                        <div className="sp-row"><span class="sp-label">Blade Lean</span><span className="sp-val">{params.bladeLean.toFixed(2)}</span></div>
                        <input type="range" className="sp-slider" min="0" max="3" step="0.05" value={params.bladeLean} onChange={(e) => handleSliderChange(idx, 'bladeLean', parseFloat(e.target.value))} />

                        {/* Color pickers inside stages */}
                        <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(180,210,140,0.3)', margin: '8px 0 6px' }}>Colors</div>
                        
                        <div className="sp-color-row">
                          <span className="sp-label">Base Color</span>
                          <input 
                            type="color" 
                            className="sp-color-input" 
                            value={'#' + new THREE.Color(params.bladeBaseR, params.bladeBaseG, params.bladeBaseB).getHexString()} 
                            onChange={(e) => handleColorChange(idx, 'bladeBaseColor', e.target.value)}
                          />
                        </div>
                        <div className="sp-color-row">
                          <span className="sp-label">Tip Color</span>
                          <input 
                            type="color" 
                            className="sp-color-input" 
                            value={'#' + new THREE.Color(params.bladeTipR, params.bladeTipG, params.bladeTipB).getHexString()} 
                            onChange={(e) => handleColorChange(idx, 'bladeTipColor', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Typography colors */}
            <div className="sp-section">
              <div className="sp-section-title">Typography Colors</div>
              {[
                { label: 'Heading', cssVar: '--color-heading', defaultVal: '#f8fcf0' },
                { label: 'Accent / Emphasis', cssVar: '--color-accent', defaultVal: '#e6f578' },
                { label: 'Body Text', cssVar: '--color-body', defaultVal: '#d7e6be' },
                { label: 'Labels / Caps', cssVar: '--color-label', defaultVal: '#d2e6a0' },
              ].map((tc, idx) => {
                const current = getComputedStyle(document.documentElement).getPropertyValue(tc.cssVar).trim() || tc.defaultVal;
                return (
                  <div className="sp-color-row" key={idx}>
                    <span className="sp-label">{tc.label}</span>
                    <input 
                      type="color" 
                      className="sp-color-input" 
                      value={current.startsWith('#') ? current : tc.defaultVal} 
                      onChange={(e) => handleTypoColorChange(tc.cssVar, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Global rendering */}
            <div className="sp-section">
              <div className="sp-section-title">Rendering</div>
              <div className="sp-toggle-row">
                <span className="sp-label">Depth of Field</span>
                <div className={`sp-toggle ${globalDof ? 'active' : ''}`} onClick={handleGlobalDofToggle} />
              </div>
              <div className="sp-toggle-row">
                <span className="sp-label">FPS Counter</span>
                <div className={`sp-toggle ${fpsOn ? 'active' : ''}`} onClick={() => setFpsOn(!fpsOn)} />
              </div>
            </div>
          </>
        ) : (
          <div style={{ fontSize: '11px', color: 'rgba(180,210,140,0.5)', textAlign: 'center' }}>Initializing WebGL/WebGPU context...</div>
        )}
      </div>

      {/* Frame rate counter */}
      {fpsOn && (
        <div style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 400, font: '12px/1 "Inter", monospace', color: 'rgba(180,210,140,0.6)', background: 'rgba(0,0,0,0.4)', padding: '5px 10px', borderRadius: '6px', pointerEvents: 'none' }}>
          60 FPS
        </div>
      )}

      {/* Scrollable Layout sections */}
      <div id="scroll-container">
        {/* Stage 0: Hero */}
        <section className="section hero" id="heroSection" data-stage="0">
          <span className="hero-tag" data-reveal data-delay="1">{t('landing.hero.tag')}</span>
          <h1 data-reveal data-delay="2" dangerouslySetInnerHTML={{ __html: t('landing.hero.title') }} />
          <p className="hero-sub" data-reveal data-delay="3">{t('landing.hero.sub')}</p>

          <button className="wind-btn" data-reveal data-delay="4" onClick={triggerWindBurst}>
            <svg viewBox="0 0 24 24">
              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2M18.59 9.59A2 2 0 1 1 20 13H2"/>
            </svg>
            <span>Burst of Wind</span>
          </button>

          <div className="scroll-hint" data-reveal data-delay="4" onClick={() => scrollToStage(1)} style={{ cursor: 'pointer' }}>
            <span>{t('landing.hero.explore')}</span>
            <div className="scroll-line" />
          </div>
        </section>

        {/* Stage 1: Philosophy */}
        <section className="section manifesto" data-stage="1">
          <span className="manifesto-label" data-reveal>{t('landing.manifesto.label')}</span>
          <h2 data-reveal data-delay="1" dangerouslySetInnerHTML={{ __html: t('landing.manifesto.text') }} />
        </section>

        {/* Stage 2: Three Pillars */}
        <section className="section pillars" data-stage="2">
          <div className="pillars-header" data-reveal>
            <span>{t('landing.pillars.title')}</span>
          </div>
          <div className="pillar-grid">
            <div className="pillar-card" data-reveal data-delay="1">
              <div className="pillar-num">{t('landing.pillars.p1_num')}</div>
              <h3>{t('landing.pillars.p1_title')}</h3>
              <p>{t('landing.pillars.p1_desc')}</p>
            </div>
            <div className="pillar-card" data-reveal data-delay="2">
              <div className="pillar-num">{t('landing.pillars.p2_num')}</div>
              <h3>{t('landing.pillars.p2_title')}</h3>
              <p>{t('landing.pillars.p2_desc')}</p>
            </div>
            <div className="pillar-card" data-reveal data-delay="3">
              <div className="pillar-num">{t('landing.pillars.p3_num')}</div>
              <h3>{t('landing.pillars.p3_title')}</h3>
              <p>{t('landing.pillars.p3_desc')}</p>
            </div>
          </div>
        </section>

        {/* Stage 3: Impact */}
        <section className="section stats-section" data-stage="3">
          <span className="stats-label" data-reveal>{t('landing.stats.label')}</span>
          <div className="stats-grid">
            <div className="stat-item" data-reveal data-delay="1">
              <div className="stat-num">{t('landing.stats.trees_num')}</div>
              <div className="stat-unit">{t('landing.stats.trees_unit')}</div>
            </div>
            <div className="stat-item" data-reveal data-delay="2">
              <div className="stat-num">{t('landing.stats.carbon_num')}</div>
              <div className="stat-unit">{t('landing.stats.carbon_unit')}</div>
            </div>
            <div className="stat-item" data-reveal data-delay="3">
              <div className="stat-num">{t('landing.stats.communities_num')}</div>
              <div className="stat-unit">{t('landing.stats.communities_unit')}</div>
            </div>
            <div className="stat-item" data-reveal data-delay="4">
              <div className="stat-num">{t('landing.stats.waste_num')}</div>
              <div className="stat-unit">{t('landing.stats.waste_unit')}</div>
            </div>
          </div>
        </section>

        {/* Stage 4: Quote */}
        <section className="section quote-section" data-stage="4">
          <blockquote data-reveal>{t('landing.quote.text')}</blockquote>
          <span className="quote-attr" data-reveal data-delay="1">{t('landing.quote.attr')}</span>
        </section>

        {/* Stage 5: CTA */}
        <section className="section cta-section" data-stage="5">
          <h2 data-reveal dangerouslySetInnerHTML={{ __html: t('landing.cta.title') }} />
          <p className="cta-sub" data-reveal data-delay="1">{t('landing.cta.sub')}</p>
          <Link to="/login" className="cta-btn" data-reveal data-delay="2">{t('landing.cta.login')}</Link>
        </section>

        <section className="section footer" data-stage="6" />
      </div>

      {/* Main footer layout */}
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="sf-brand">
            <div className="sf-brand-name">{t('navigation.brand')}</div>
            <p className="sf-brand-desc">{t('landing.footer.brand_desc')}</p>
          </div>
          <div className="sf-col">
            <div className="sf-col-title">{t('landing.footer.col_explore')}</div>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToStage(1); }}>{t('landing.footer.links.mission')}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToStage(2); }}>{t('landing.footer.links.pillars')}</a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToStage(3); }}>{t('landing.footer.links.impact')}</a>
            <a href="#" onClick={(e) => e.preventDefault()}>{t('landing.footer.links.community')}</a>
          </div>
          <div className="sf-col">
            <div className="sf-col-title">{t('landing.footer.col_resources')}</div>
            <a href="#" onClick={(e) => e.preventDefault()}>{t('landing.footer.links.documentation')}</a>
            <a href="#" onClick={(e) => e.preventDefault()}>{t('landing.footer.links.open_source')}</a>
            <a href="#" onClick={(e) => e.preventDefault()}>{t('landing.footer.links.research')}</a>
            <a href="#" onClick={(e) => e.preventDefault()}>{t('landing.footer.links.blog')}</a>
          </div>
          <div className="sf-col">
            <div className="sf-col-title">{t('landing.footer.col_connect')}</div>
            <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Newsletter</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Partnerships</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Careers</a>
          </div>
        </div>
        <div className="sf-bottom">
          <span className="sf-copy">© 2026 KrishiMitra AI. All rights reserved.</span>
          <div className="sf-socials">
            <a href="#" onClick={(e) => e.preventDefault()}>Twitter</a>
            <a href="#" onClick={(e) => e.preventDefault()}>GitHub</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
