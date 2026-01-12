import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { initializeGemini, sendMessageToGemini } from './services/gemini';
import { sendMessageToLocalAI } from './services/localAi';

const EMOTION_MAP = {
  'BLUSH': 'BLUSH', 'SONROJO': 'BLUSH', 'SONROJADA': 'BLUSH',
  'ANGRY': 'ANGRY', 'ENFADADA': 'ANGRY', 'ENOJADA': 'ANGRY',
  'EXCITED': 'EXCITED', 'EMOCIONADA': 'EXCITED',
  'SAD': 'SAD', 'TRISTE': 'SAD',
  'THINKING': 'THINKING', 'PENSANDO': 'THINKING',
  'SURPRISED': 'SURPRISED', 'SORPRESA': 'SURPRISED', 'SORPRENDIDA': 'SURPRISED',
  'WINK': 'WINK', 'GUINO': 'WINK', 'GUIÑO': 'WINK',
  'BACK': 'BACK', 'ATRAS': 'BACK', 'VUELTA': 'BACK',
  'DANCE': 'DANCE', 'BAILA': 'DANCE', 'BAILAR': 'DANCE',
  'TICKLES': 'TICKLES', 'COSQUILLAS': 'TICKLES',
  'SLEEPY': 'SLEEPY', 'SUENO': 'SLEEPY', 'SUEÑO': 'SLEEPY',
  'EATING': 'EATING', 'COMIENDO': 'EATING',
  'SHOCKED': 'SHOCKED', 'ASUSTADA': 'SHOCKED',
  'LAUGH': 'LAUGH', 'RISA': 'LAUGH',
  'PRAY': 'PRAY', 'REZAR': 'PRAY',
  'WAVE': 'WAVE', 'SALUDO': 'WAVE',
  'HELLO': 'HOLA', 'HOLA': 'HOLA',
  'PATS': 'PATS', 'CARICIAS': 'PATS',
  'CLAP': 'CLAP', 'APLAUSO': 'CLAP',
  'SHY_AWAY': 'SHY_AWAY', 'NORMAL': 'NORMAL'
};

function App() {
  // --- State ---
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [modelName, setModelName] = useState(localStorage.getItem('gemini_model') || 'gemini-1.5-flash');
  const [useLocalAi, setUseLocalAi] = useState(localStorage.getItem('use_local_ai') === 'true');
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_history');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });
  const [isTyping, setIsTyping] = useState(false);
  const [emotion, setEmotion] = useState('NORMAL');
  const [hasInteracted, setHasInteracted] = useState(false);

  // --- Helpers ---
  const cleanAllTags = useCallback((rawText) => {
    if (!rawText) return "";
    let clean = rawText;
    const tags = Object.keys(EMOTION_MAP);

    tags.forEach(tag => {
      const pattern = new RegExp(`(\\*?){0,3}[\\(\\[]\\s*${tag}\\s*[\\)\\]](\\*?){0,3}`, 'gi');
      clean = clean.replace(pattern, '');
    });

    // Catch-all for any uppercase bracketed text [ABC_DEF]
    clean = clean.replace(/(\*?){0,3}[\\(\\[]\\s*[A-Z_]{3,}\\s*[\\)\\]](\\*?){0,3}/gi, '');

    return clean.trim();
  }, []);

  const handleSendMessage = useCallback(async (text, silent = false) => {
    if (!text.trim()) return;

    let historyForAI = [...messages];
    if (!silent) {
      setMessages(prev => [...prev, { role: 'user', text }]);
      historyForAI.push({ role: 'user', text });
    }

    setIsTyping(true);

    const techKeywords = ['codigo', 'código', 'programar', 'css', 'javascript', 'html', 'script', 'react'];
    if (techKeywords.some(k => text.toLowerCase().includes(k))) {
      setEmotion('THINKING');
    }

    try {
      let responseText = "";
      if (useLocalAi) {
        setMessages(prev => [...prev, { role: 'model', text: '' }]);
        responseText = await sendMessageToLocalAI(historyForAI.slice(-20), text, modelName, (currentFullText) => {
          // Live emotion detection
          for (const tag in EMOTION_MAP) {
            if (new RegExp(`[\\(\\[]${tag}[\\)\\]]`, 'i').test(currentFullText)) {
              setEmotion(EMOTION_MAP[tag]);
            }
          }
          setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = { role: 'model', text: cleanAllTags(currentFullText) };
            }
            return updated;
          });
        });
      } else {
        initializeGemini(apiKey, modelName);
        responseText = await sendMessageToGemini(historyForAI.slice(-20), text);

        for (const tag in EMOTION_MAP) {
          if (new RegExp(`[\\(\\[]${tag}[\\)\\]]`, 'i').test(responseText)) {
            setEmotion(EMOTION_MAP[tag]);
          }
        }
        setMessages(prev => [...prev, { role: 'model', text: cleanAllTags(responseText) }]);
      }

      // Final emotion update
      let lastEmotion = 'NORMAL';
      for (const tag in EMOTION_MAP) {
        if (new RegExp(`[\\(\\[]${tag}[\\)\\]]`, 'i').test(responseText)) {
          lastEmotion = EMOTION_MAP[tag];
        }
      }
      setEmotion(lastEmotion);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: `**System Error:** ${error.message || "Connection failed"}. 😖\n\nPlease check settings or LM Studio.`
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, useLocalAi, apiKey, modelName, cleanAllTags]);

  const handleDeleteMessage = (index) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearChat = () => {
    if (window.confirm("¿Borrar la memoria de Aiko?")) {
      setMessages([]);
      localStorage.removeItem('chat_history');
      setEmotion('NORMAL');
    }
  };

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('use_local_ai', useLocalAi);
    if (!useLocalAi && apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
      localStorage.setItem('gemini_model', modelName);
      initializeGemini(apiKey, modelName);
    }
  }, [apiKey, modelName, useLocalAi]);

  useEffect(() => {
    if (emotion !== 'NORMAL') {
      const t = setTimeout(() => setEmotion('NORMAL'), 10000);
      return () => clearTimeout(t);
    }
  }, [emotion]);

  useEffect(() => {
    if (!isTyping) {
      localStorage.setItem('chat_history', JSON.stringify(messages));
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (hasInteracted && messages.length === 0 && (useLocalAi || apiKey)) {
      // We give a more directive instruction to ensure Aiko uses the greeting tag
      handleSendMessage("Aiko, preséntate y salúdame usando la etiqueta [HOLA] para empezar nuestra sesión.", true);
    }
  }, [hasInteracted, messages.length, useLocalAi, apiKey, handleSendMessage]);

  useEffect(() => {
    const unlock = () => {
      setHasInteracted(true);
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, []);

  return (
    <div className="app-container">
      <Sidebar
        apiKey={apiKey} setApiKey={setApiKey}
        modelName={modelName} setModelName={setModelName}
        useLocalAi={useLocalAi} setUseLocalAi={setUseLocalAi}
        emotion={emotion} onClearChat={handleClearChat}
        isTyping={isTyping}
      />
      <ChatInterface
        messages={messages} onSendMessage={handleSendMessage}
        onDeleteMessage={handleDeleteMessage} isTyping={isTyping}
        modelName={modelName}
      />
    </div>
  );
}

export default App;
