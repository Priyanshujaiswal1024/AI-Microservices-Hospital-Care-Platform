import React, { useRef, useState, useEffect } from 'react';
import api from '../api/axios';

const QUICK_ACTIONS = [
  { label: '📅 Today Schedule', prompt: 'Aaj meri koi appointment hai? Kripya list karein.' },
  { label: '📆 Tomorrow Appts', prompt: 'Kal meri kaun kaun si appointments hain and patients ke naam kya hain?' },
  { label: '🩺 Complete Visit', prompt: 'Complete appointment for patient' },
  { label: '💊 Search Medicine', prompt: 'Suggest medicine and check stock for cough' },
  { label: '✍️ Auto-Prescribe', prompt: 'prescription bnao appointment X ke liye: diagnosis is fever, notes rest for 3 days' },
];

export default function DoctorAiWidget() {
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: `Hello Doctor! 👋\n\nI'm your AI Clinical Copilot. I can help you:\n• Check today's schedule\n• Complete appointments\n• Generate prescriptions automatically\n• Search pharmacy inventory\n• View patient details\n\nHow can I assist you?`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text }]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const response = await api.post('/prescriptions/ai-chat-doctor', { message: text });
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: response.data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot',
        text: '⚠️ AI service temporarily unavailable. Please try again.',
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const panelW = isExpanded ? '520px' : '380px';
  const panelH = isExpanded ? '640px' : '520px';

  return (
    <>
      <style>{`
        .daw-fab {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg, #059669, #047857);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(5,150,105,0.45);
          transition: transform 0.2s, box-shadow 0.2s;
          color: white; font-size: 22px;
        }
        .daw-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(5,150,105,0.6); }

        .daw-panel {
          position: fixed; right: 24px; bottom: 88px; z-index: 9998;
          background: #fff; border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
          display: flex; flex-direction: column; overflow: hidden;
          transition: width 0.3s cubic-bezier(.2,.9,.3,1), height 0.3s cubic-bezier(.2,.9,.3,1),
                      opacity 0.2s, transform 0.3s cubic-bezier(.2,.9,.3,1);
        }
        .daw-panel.closed { opacity: 0; transform: translateY(16px) scale(0.95); pointer-events: none; }
        .daw-panel.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }

        .daw-header {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 16px 14px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
        }
        .daw-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #059669, #0d9488);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(5,150,105,0.3);
        }
        .daw-htitle { font-size: 15px; font-weight: 700; color: #111827; line-height: 1.2; }
        .daw-hbadge {
          font-size: 11px; color: #6b7280; font-weight: 500;
          background: #f0fdf4; color: #16a34a; padding: 2px 8px; border-radius: 20px;
          margin-left: 4px; border: 1px solid #dcfce7;
        }
        .daw-hbtns { margin-left: auto; display: flex; gap: 4px; }
        .daw-hbtn {
          width: 28px; height: 28px; border-radius: 8px; border: none;
          background: #f9fafb; color: #6b7280; cursor: pointer;
          font-size: 14px; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .daw-hbtn:hover { background: #f3f4f6; color: #111827; }

        .daw-msgs {
          flex: 1; overflow-y: auto; padding: 16px 16px 8px;
          display: flex; flex-direction: column; gap: 16px;
          scrollbar-width: thin; scrollbar-color: #e5e7eb transparent;
        }
        .daw-msg-bot { display: flex; gap: 10px; align-items: flex-start; }
        .daw-msg-user { display: flex; justify-content: flex-end; }

        .daw-bot-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #059669, #0d9488);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; flex-shrink: 0; margin-top: 2px;
          box-shadow: 0 1px 4px rgba(5,150,105,0.25);
        }

        .daw-bubble-bot {
          background: #fff; color: #111827;
          font-size: 14px; line-height: 1.65;
          white-space: pre-wrap; max-width: 88%;
        }
        .daw-bubble-user {
          background: #111827; color: #fff;
          font-size: 14px; line-height: 1.55; padding: 10px 14px;
          border-radius: 12px 12px 2px 12px; max-width: 78%;
          white-space: pre-wrap;
        }

        .daw-typing { display: flex; gap: 4px; align-items: center; }
        .daw-typing span {
          width: 7px; height: 7px; border-radius: 50%;
          background: #d1d5db; animation: dawTyp 1.2s infinite;
        }
        .daw-typing span:nth-child(2){animation-delay:.15s;}
        .daw-typing span:nth-child(3){animation-delay:.3s;}
        @keyframes dawTyp {
          0%,80%,100%{opacity:.3;transform:translateY(0);}
          40%{opacity:1;transform:translateY(-4px);}
        }

        .daw-chips {
          padding: 0 16px 8px;
          display: flex; flex-wrap: wrap; gap: 6px; flex-shrink: 0;
        }
        .daw-chip {
          background: #f9fafb; border: 1px solid #e5e7eb;
          color: #374151; padding: 5px 11px; border-radius: 20px;
          font-size: 12px; cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .daw-chip:hover { background: #f0fdf4; border-color: #86efac; color: #16a34a; }
        .daw-chip:disabled { opacity: 0.4; cursor: not-allowed; }

        .daw-input-row {
          padding: 10px 16px 12px; border-top: 1px solid #f0f0f0;
          display: flex; gap: 10px; align-items: center; flex-shrink: 0;
        }
        .daw-input {
          flex: 1; border: 1px solid #e5e7eb; border-radius: 10px;
          padding: 10px 14px; font-size: 14px; color: #111827;
          outline: none; background: #fff; font-family: inherit;
          transition: border-color 0.2s;
        }
        .daw-input:focus { border-color: #059669; }
        .daw-input::placeholder { color: #9ca3af; }
        .daw-send {
          width: 38px; height: 38px; border-radius: 10px; border: none;
          background: #111827; color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
          transition: background 0.15s, transform 0.1s;
        }
        .daw-send:hover:not(:disabled) { background: #1f2937; transform: scale(1.05); }
        .daw-send:disabled { opacity: 0.35; cursor: not-allowed; }

        .daw-footer {
          padding: 6px 16px 10px; text-align: center;
          font-size: 11px; color: #9ca3af; flex-shrink: 0;
        }

        @media(max-width:480px){
          .daw-panel { right: 12px; bottom: 80px; width: calc(100vw - 24px) !important; }
          .daw-fab { right: 16px; bottom: 16px; }
        }
      `}</style>

      {/* FAB Button */}
      <button
        className="daw-fab"
        onClick={() => setIsOpen(v => !v)}
        title={isOpen ? 'Close AI Copilot' : 'Open AI Copilot'}
      >
        {isOpen ? '✕' : '🩺'}
      </button>

      {/* Chat Panel */}
      <div
        className={`daw-panel ${isOpen ? 'open' : 'closed'}`}
        style={{ width: panelW, height: panelH }}
      >
        {/* Header */}
        <div className="daw-header">
          <div className="daw-avatar">🤖</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="daw-htitle">Priyansh AI Copilot</span>
              <span className="daw-hbadge">Doctor Mode</span>
            </div>
            <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Online · Llama 3.1
            </div>
          </div>
          <div className="daw-hbtns">
            <button className="daw-hbtn" title={isExpanded ? 'Shrink' : 'Expand'} onClick={() => setIsExpanded(v => !v)}>
              {isExpanded ? '↙' : '↗'}
            </button>
            <button className="daw-hbtn" title="Clear Chat" onClick={() => setMessages([{ id: 1, role: 'bot', text: 'Chat cleared! How can I help you, Doctor? 😊' }])}>
              🗑
            </button>
            <button className="daw-hbtn" title="Close" onClick={() => setIsOpen(false)}>✕</button>
          </div>
        </div>

        {/* Messages */}
        <div className="daw-msgs">
          {messages.map(msg => (
            msg.role === 'user' ? (
              <div key={msg.id} className="daw-msg-user">
                <div className="daw-bubble-user">{msg.text}</div>
              </div>
            ) : (
              <div key={msg.id} className="daw-msg-bot">
                <div className="daw-bot-avatar">🤖</div>
                <div className="daw-bubble-bot">{msg.text}</div>
              </div>
            )
          ))}
          {isTyping && (
            <div className="daw-msg-bot">
              <div className="daw-bot-avatar">🤖</div>
              <div className="daw-typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Quick Chips */}
        <div className="daw-chips">
          {QUICK_ACTIONS.map((a, i) => (
            <button key={i} className="daw-chip" disabled={isTyping} onClick={() => handleSend(a.prompt)}>
              {a.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="daw-input-row">
          <input
            ref={inputRef}
            type="text"
            className="daw-input"
            placeholder="Ask AI Copilot a question"
            value={inputValue}
            disabled={isTyping}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          />
          <button className="daw-send" disabled={!inputValue.trim() || isTyping} onClick={() => handleSend()}>→</button>
        </div>

        {/* Footer */}
        <div className="daw-footer">
          Powered by <strong>Priyansh Care Hospital</strong> · AI may make mistakes
        </div>
      </div>
    </>
  );
}
