import React, { useState, useEffect } from 'react';
import { Settings, Trash2, Key, Info, Cpu, HardDrive } from 'lucide-react';
import { checkAvailableModels } from '../services/gemini';
import { checkLocalModels } from '../services/localAi';

export default function Sidebar({ apiKey, setApiKey, onClearChat, isTyping, modelName, setModelName, emotion, useLocalAi, setUseLocalAi }) {
    const [showSettings, setShowSettings] = useState(!apiKey);
    const [tempKey, setTempKey] = useState(apiKey || '');

    const [availableModels, setAvailableModels] = useState([]);
    const [loadingModels, setLoadingModels] = useState(false);

    // Auto-fetch models when API Key is set or Local AI is enabled
    useEffect(() => {
        if (!useLocalAi && apiKey) {
            setLoadingModels(true);
            checkAvailableModels(apiKey).then(models => {
                let list = [];
                if (Array.isArray(models)) {
                    list = models.filter(m => m.toLowerCase().includes('gemini'));
                    list.sort((a, b) => {
                        const score = (str) => {
                            if (str.includes('lite')) return 3;
                            if (str.includes('flash')) return 2;
                            return 0;
                        };
                        return score(b) - score(a);
                    });
                }
                setAvailableModels(list);
                setLoadingModels(false);
                if (list.length > 0 && (!modelName || !list.includes(modelName))) {
                    setModelName(list[0]);
                }
            });
        } else if (useLocalAi) {
            setLoadingModels(true);
            checkLocalModels().then(models => {
                setAvailableModels(models);
                setLoadingModels(false);
                if (models.length > 0 && (!modelName || !models.includes(modelName))) {
                    setModelName(models[0]);
                }
            });
        }
    }, [apiKey, useLocalAi]); // Run when apiKey or useLocalAi changes

    const handleSaveKey = () => {
        if (tempKey.trim()) {
            setApiKey(tempKey.trim());
            setShowSettings(false);
        }
    };

    const getMediaSource = () => {
        const baseUrl = '/waifu_';
        switch (emotion) {
            case 'BLUSH': return `${baseUrl}blush.mp4`;
            case 'ANGRY': return `${baseUrl}angry.mp4`;
            case 'EXCITED': return `${baseUrl}excited.mp4`;
            case 'SAD': return `${baseUrl}sad.mp4`;
            case 'THINKING': return `${baseUrl}thinking.mp4`;
            case 'SURPRISED': return `${baseUrl}surprised.mp4`;
            case 'WINK': return `${baseUrl}wink.mp4`;
            case 'BACK': return `${baseUrl}back.mp4`;
            case 'DANCE': return `${baseUrl}dance.mp4`;
            case 'TICKLES': return `${baseUrl}tickles.mp4`;
            case 'SLEEPY': return `${baseUrl}sleepy.mp4`;
            case 'EATING': return `${baseUrl}eating.mp4`;
            case 'SHOCKED': return `${baseUrl}shocked.mp4`;
            case 'LAUGH': return `${baseUrl}laugh.mp4`;
            case 'PRAY': return `${baseUrl}pray.mp4`;
            case 'WAVE': return `${baseUrl}wave.mp4`;
            case 'HOLA':
            case 'HELLO': return `${baseUrl}hello.mp4`;
            case 'PATS': return `${baseUrl}pats.mp4`;
            case 'CLAP': return `${baseUrl}clap.mp4`;
            case 'SHY_AWAY': return `${baseUrl}shy_away.mp4`;
            default: return '/waifu_normal.mp4';
        }
    };

    return (
        <div className="sidebar glass-panel">
            {/* Avatar Section (Video Drive) */}
            <div className="avatar-container animate-float">
                <video
                    key={emotion} // Key forces video reload on emotion change
                    src={getMediaSource()}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="avatar-image"
                    style={{ objectFit: 'cover', background: '#000' }}
                    onError={(e) => {
                        // Fallback to static image if video is missing
                        const img = e.target.parentElement.querySelector('img');
                        if (img) img.style.display = 'block';
                        e.target.style.display = 'none';
                    }}
                />
                {/* Fallback Image hidden by default */}
                <img
                    src="/waifu.png"
                    style={{ display: 'none', width: '100%', height: '100%', objectFit: 'cover' }}
                    alt="Fallback"
                />

                {isTyping && (
                    <div className="animate-pulse-glow" style={{
                        position: 'absolute', inset: 0, borderRadius: '20px', pointerEvents: 'none',
                        zIndex: 2
                    }} />
                )}
            </div>

            {/* Title */}
            <h1 style={{
                textAlign: 'center',
                marginBottom: '0.5rem',
                background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '2rem',
                fontWeight: '700'
            }}>
                AIKO
            </h1>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Virtual Assistant
            </p>

            {/* Status Card */}
            <div className="status-card" style={{ marginBottom: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div className={`status-dot ${(useLocalAi || apiKey) ? 'online' : 'offline'}`}></div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>
                        System: <b className="neon-text">{useLocalAi ? 'Local (LM Studio)' : (apiKey ? 'Online (Gemini)' : 'Halted')}</b>
                    </span>
                </div>
                {!apiKey && !useLocalAi && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Please configure your Neural Link (API Key) or enable Local Mode below.
                    </p>
                )}
            </div>

            {/* Settings / Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>

                {/* Settings Panel */}
                {showSettings ? (
                    <div className="glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Settings size={14} /> Configuration
                        </h3>

                        {/* Local AI Toggle */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1rem',
                            padding: '0.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <HardDrive size={14} color={useLocalAi ? 'var(--primary)' : 'var(--text-muted)'} />
                                <span style={{ fontSize: '0.8rem' }}>Local Mode (LM Studio)</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={useLocalAi}
                                onChange={(e) => setUseLocalAi(e.target.checked)}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>

                        {!useLocalAi ? (
                            <>
                                {/* API Key Input */}
                                <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block', color: 'var(--text-muted)' }}>Gemini API Key</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="Paste Key..."
                                    style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: 'var(--accent)', textDecoration: 'none' }}>
                                        Get Key &rarr;
                                    </a>
                                    <button
                                        onClick={handleSaveKey}
                                        style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        Connect
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                                Ensure LM Studio is running and 'Local Server' is started on port <b>1234</b>.
                            </div>
                        )}

                        {/* Model Selector */}
                        {(useLocalAi || apiKey) && (
                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                                    <Cpu size={12} /> AI Model Core
                                </label>
                                {loadingModels ? (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Scanning models...</span>
                                ) : (
                                    <select
                                        className="input-field"
                                        style={{ width: '100%', cursor: 'pointer', padding: '0.5rem', fontSize: '0.85rem' }}
                                        value={modelName || ''}
                                        onChange={(e) => setModelName(e.target.value)}
                                    >
                                        <option value="" disabled>Select Model</option>
                                        {availableModels.length > 0 ? (
                                            availableModels.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))
                                        ) : (
                                            useLocalAi ? (
                                                <option value="">No local models found</option>
                                            ) : (
                                                <option value="gemini-1.5-flash">Default (Gemini 1.5 Flash)</option>
                                            )
                                        )}
                                    </select>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => setShowSettings(false)}
                            style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <button
                        className="glass"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '8px' }}
                        onClick={() => setShowSettings(true)}
                    >
                        <Settings size={16} />
                        Configure Aiko
                    </button>
                )}

                {/* Clear Memory Button */}
                <button
                    className="glass"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', color: '#f87171', cursor: 'pointer', borderRadius: '8px' }}
                    onClick={onClearChat}
                >
                    <Trash2 size={16} />
                    Reset Memory
                </button>
            </div>
        </div>
    );
}
