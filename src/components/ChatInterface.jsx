import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';

export default function ChatInterface({ messages, onSendMessage, onDeleteMessage, isTyping, modelName }) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSend(e);
        }
    };

    return (
        <div className="main-chat">
            {/* Header */}
            <div className="glass-panel" style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: '500' }}>
                    <Sparkles size={18} color="var(--primary)" />
                    Chat Session
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{modelName || 'Gemini'} (Aiko)</span>
            </div>

            {/* Messages List */}
            <div className="messages-container" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                {messages.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5, textAlign: 'center' }}>
                        <p>Say "Hello" to start chatting with Aiko!</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.role === 'user' ? 'user-msg' : 'ai-msg'}`} style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', opacity: 0.8 }}>
                                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                                <span>{msg.role === 'user' ? 'You' : 'Aiko'}</span>
                            </div>
                            <button
                                className="delete-btn"
                                onClick={() => onDeleteMessage(idx)}
                                title="Eliminar mensaje"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <div className="markdown-content">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    </div>
                ))}

                {isTyping && messages[messages.length - 1]?.role !== 'model' && (
                    <div className="chat-message ai-msg" style={{ width: 'fit-content' }}>
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-container">
                <div className="emoji-bar">
                    {['🌸', '✨', '💖', '😊', '😅', '😋', '🙄', '💢', '🤔', '👋', '💃', '💻'].map(emoji => (
                        <button
                            key={emoji}
                            type="button"
                            className="emoji-btn"
                            onClick={() => setInput(prev => prev + emoji)}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
                <form className="input-area" onSubmit={handleSend} style={{ borderTop: 'none', padding: '1rem 3rem 2.5rem 3rem' }}>
                    <textarea
                        className="input-field"
                        placeholder="Type a message to Aiko..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        spellCheck="true"
                        style={{ minHeight: '50px' }}
                    />
                    <button type="submit" className="send-btn" disabled={!input.trim() || isTyping}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
