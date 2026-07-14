import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const QUICK_ACTIONS = [
  { label: '🩺 Find Doctor', prompt: 'mujhe doctor chahiye, suggest karo' },
  { label: '📅 Book Appointment', prompt: 'I want to book an appointment' },
  { label: '💊 Medicines', prompt: 'I have fever, suggest medicines' },
  { label: '📋 My Prescriptions', prompt: 'Show my prescriptions' },
  { label: '🧾 My Bills', prompt: 'Show my pending bills' },
];

export default function AiChatWidget({ patientId, patientName, authToken }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: `Hi, I'm Priyansh AI! 👋\n\nI'm your personal health assistant. I can help you find doctors, book appointments, check prescriptions and medicines.\n\nHow can I help you today?`,
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { id: Date.now(), role: 'user', text: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/prescriptions/ai-chat`,
        { message: text.trim(), patientId, patientName },
        { headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' } }
      );
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'ai',
        text: res.data.reply || 'Kuch samajh nahi aaya. Please dobara try karein.',
        time: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'ai',
        text: '⚠️ Service temporarily unavailable. Please try again.',
        time: new Date(), isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const panelW = isExpanded ? '520px' : '380px';
  const panelH = isExpanded ? '620px' : '500px';

  return (
    <>
      <style>{`
        .pcw2-fab {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(37,99,235,0.45);
          transition: transform 0.2s, box-shadow 0.2s;
          color: white; font-size: 22px;
        }
        .pcw2-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(37,99,235,0.6); }

        .pcw2-panel {
          position: fixed; right: 24px; bottom: 88px; z-index: 9998;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
          display: flex; flex-direction: column; overflow: hidden;
          transition: width 0.3s cubic-bezier(.2,.9,.3,1), height 0.3s cubic-bezier(.2,.9,.3,1),
                      opacity 0.2s, transform 0.3s cubic-bezier(.2,.9,.3,1);
        }
        .pcw2-panel.closed {
          opacity: 0; transform: translateY(16px) scale(0.95); pointer-events: none;
        }
        .pcw2-panel.open {
          opacity: 1; transform: translateY(0) scale(1); pointer-events: auto;
        }

        .pcw2-header {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 16px 14px;
          border-bottom: 1px solid #f0f0f0;
          flex-shrink: 0;
        }
        .pcw2-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(37,99,235,0.3);
        }
        .pcw2-htitle { font-size: 15px; font-weight: 700; color: #111827; line-height: 1.2; }
        .pcw2-hbadge {
          font-size: 11px; color: #6b7280; font-weight: 500;
          background: #f3f4f6; padding: 2px 8px; border-radius: 20px;
          margin-left: 4px;
        }
        .pcw2-hbtns { margin-left: auto; display: flex; gap: 4px; }
        .pcw2-hbtn {
          width: 28px; height: 28px; border-radius: 8px; border: none;
          background: #f9fafb; color: #6b7280; cursor: pointer;
          font-size: 14px; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .pcw2-hbtn:hover { background: #f3f4f6; color: #111827; }

        .pcw2-msgs {
          flex: 1; overflow-y: auto; padding: 16px 16px 8px;
          display: flex; flex-direction: column; gap: 16px;
          scrollbar-width: thin; scrollbar-color: #e5e7eb transparent;
        }
        .pcw2-msg-ai { display: flex; gap: 10px; align-items: flex-start; }
        .pcw2-msg-user { display: flex; justify-content: flex-end; }

        .pcw2-ai-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; flex-shrink: 0; margin-top: 2px;
          box-shadow: 0 1px 4px rgba(37,99,235,0.25);
        }

        .pcw2-bubble-ai {
          background: #fff; color: #111827;
          font-size: 14px; line-height: 1.65;
          white-space: pre-wrap; max-width: 88%;
        }
        .pcw2-bubble-user {
          background: #111827; color: #fff;
          font-size: 14px; line-height: 1.55; padding: 10px 14px;
          border-radius: 12px 12px 2px 12px; max-width: 78%;
          white-space: pre-wrap;
        }

        .pcw2-typing {
          display: flex; gap: 4px; align-items: center;
          padding: 0; margin-top: 2px;
        }
        .pcw2-typing span {
          width: 7px; height: 7px; border-radius: 50%;
          background: #d1d5db; animation: pcwTyp2 1.2s infinite;
        }
        .pcw2-typing span:nth-child(2){animation-delay:.15s;}
        .pcw2-typing span:nth-child(3){animation-delay:.3s;}
        @keyframes pcwTyp2 {
          0%,80%,100%{opacity:.3;transform:translateY(0);}
          40%{opacity:1;transform:translateY(-4px);}
        }

        .pcw2-chips {
          padding: 0 16px 8px;
          display: flex; flex-wrap: wrap; gap: 6px; flex-shrink: 0;
        }
        .pcw2-chip {
          background: #f9fafb; border: 1px solid #e5e7eb;
          color: #374151; padding: 5px 11px; border-radius: 20px;
          font-size: 12px; cursor: pointer; transition: all 0.15s;
          white-space: nowrap;
        }
        .pcw2-chip:hover { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
        .pcw2-chip:disabled { opacity: 0.4; cursor: not-allowed; }

        .pcw2-input-row {
          padding: 10px 16px 12px;
          border-top: 1px solid #f0f0f0;
          display: flex; gap: 10px; align-items: center; flex-shrink: 0;
        }
        .pcw2-input {
          flex: 1; border: 1px solid #e5e7eb; border-radius: 10px;
          padding: 10px 14px; font-size: 14px; color: #111827;
          outline: none; resize: none; background: #fff;
          font-family: inherit; transition: border-color 0.2s;
          min-height: 40px; max-height: 80px;
        }
        .pcw2-input:focus { border-color: #2563eb; }
        .pcw2-input::placeholder { color: #9ca3af; }
        .pcw2-send {
          width: 38px; height: 38px; border-radius: 10px; border: none;
          background: #111827; color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
          transition: background 0.15s, transform 0.1s;
        }
        .pcw2-send:hover:not(:disabled) { background: #1f2937; transform: scale(1.05); }
        .pcw2-send:disabled { opacity: 0.35; cursor: not-allowed; }

        .pcw2-footer {
          padding: 6px 16px 10px; text-align: center;
          font-size: 11px; color: #9ca3af; flex-shrink: 0;
        }

        @media(max-width:480px){
          .pcw2-panel { right: 12px; bottom: 80px; width: calc(100vw - 24px) !important; }
          .pcw2-fab { right: 16px; bottom: 16px; }
        }
      `}</style>

      {/* FAB Button */}
      <button
        className="pcw2-fab"
        onClick={() => setIsOpen(v => !v)}
        title={isOpen ? 'Close chat' : 'Chat with Priyansh AI'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Panel */}
      <div
        className={`pcw2-panel ${isOpen ? 'open' : 'closed'}`}
        style={{ width: panelW, height: panelH }}
      >
        {/* Header */}
        <div className="pcw2-header">
          <div className="pcw2-avatar">🏥</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="pcw2-htitle">Priyansh AI</span>
              <span className="pcw2-hbadge">Health Assistant</span>
            </div>
            <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Online · Llama 3.1
            </div>
          </div>
          <div className="pcw2-hbtns">
            <button className="pcw2-hbtn" title={isExpanded ? 'Shrink' : 'Expand'} onClick={() => setIsExpanded(v => !v)}>
              {isExpanded ? '↙' : '↗'}
            </button>
            <button className="pcw2-hbtn" title="Clear" onClick={() => setMessages([{ id: 1, role: 'ai', text: `Hi again! How can I help you today? 😊`, time: new Date() }])}>
              🗑
            </button>
            <button className="pcw2-hbtn" title="Close" onClick={() => setIsOpen(false)}>✕</button>
          </div>
        </div>

        {/* Messages */}
        <div className="pcw2-msgs">
          {messages.map(msg => (
            msg.role === 'user' ? (
              <div key={msg.id} className="pcw2-msg-user">
                <div className="pcw2-bubble-user">{msg.text}</div>
              </div>
            ) : (
              <div key={msg.id} className="pcw2-msg-ai">
                <div className="pcw2-ai-avatar">🏥</div>
                <div className="pcw2-bubble-ai">{msg.text}</div>
              </div>
            )
          ))}
          {loading && (
            <div className="pcw2-msg-ai">
              <div className="pcw2-ai-avatar">🏥</div>
              <div className="pcw2-typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips */}
        <div className="pcw2-chips">
          {QUICK_ACTIONS.map(a => (
            <button key={a.label} className="pcw2-chip" disabled={loading} onClick={() => sendMessage(a.prompt)}>
              {a.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="pcw2-input-row">
          <textarea
            ref={inputRef}
            className="pcw2-input"
            placeholder="Ask Priyansh AI a question"
            value={input}
            rows={1}
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          />
          <button className="pcw2-send" disabled={!input.trim() || loading} onClick={() => sendMessage(input)}>→</button>
        </div>

        {/* Footer */}
        <div className="pcw2-footer">
          Powered by <strong>Priyansh Care Hospital</strong> · AI may make mistakes
        </div>
      </div>
    </>
  );
}
