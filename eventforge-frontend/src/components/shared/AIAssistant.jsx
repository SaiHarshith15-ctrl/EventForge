import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X, Send, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';
import { aiApi } from '../../api/ai.api';
import { fmtDate, fmtINR } from '../../utils/format';

const STARTERS = ['Show me tech events in Hyderabad', 'Find free events', 'What events are happening soon?'];

export default function AIAssistant() {
  const { aiOpen, openAi, closeAi } = useUiStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your EventForge AI assistant. Ask me to find events, check prices, or discover what's happening near you.", events: [] },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setTyping(true);
    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));
      const res = await aiApi.chat(q, history);
      setMessages((m) => [...m, { role: 'ai', text: res.data.reply, events: res.data.events || [] }]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: "Sorry, I'm having trouble right now. Try again in a moment.", events: [] }]);
    } finally {
      setTyping(false);
    }
  };

  const listen = () => {
    setListening(true);
    setTimeout(() => {
      setListening(false);
      send(STARTERS[Math.floor(Math.random() * STARTERS.length)]);
    }, 1800);
  };

  return (
    <>
      <motion.button
        layoutId="ai-orb"
        onClick={openAi}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-amber-500 text-white shadow-glow grid place-items-center"
        style={{ display: aiOpen ? 'none' : 'grid' }}
      >
        <span className="absolute inset-0 rounded-full animate-pulseGlow" />
        <Sparkles className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {aiOpen && (
          <motion.div
            layoutId="ai-orb"
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-7rem)] bg-surface rounded-2xl shadow-lift overflow-hidden flex flex-col"
          >
            <div className="bg-gradient-to-r from-violet-600 to-violet-500 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <div className="font-display font-bold text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> EventForge AI</div>
                <div className="text-[11px] text-violet-200">Your event discovery assistant</div>
              </div>
              <button onClick={closeAi} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-white/15">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 bg-paper">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] ${m.role === 'user' ? 'ml-auto' : ''}`}
                >
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-violet-500 text-white rounded-br-md' : 'bg-surface border border-line rounded-bl-md text-ink'
                  }`}>
                    {m.text}
                  </div>
                  {m.events?.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {m.events.slice(0, 3).map((ev) => (
                        <button
                          key={ev._id}
                          onClick={() => { closeAi(); navigate(`/events/${ev._id}`); }}
                          className="w-full text-left bg-surface border border-line rounded-xl p-2.5 hover:border-violet-300 transition-colors"
                        >
                          <div className="text-xs font-bold text-ink line-clamp-1">{ev.name}</div>
                          <div className="text-[11px] text-ink-soft">{fmtDate(ev.date)} · {ev.location} · {ev.tickets?.[0]?.price === 0 ? 'Free' : fmtINR(ev.tickets?.[0]?.price || 0)}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              {typing && (
                <div className="flex gap-1 px-3.5 py-3 bg-surface border border-line rounded-2xl rounded-bl-md w-fit">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-ink-faint"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-1.5 px-4 pb-2 flex-wrap shrink-0">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-[11px] px-2.5 py-1 rounded-full border border-line text-ink-soft hover:border-violet-300 hover:text-violet-600">
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 border-t border-line shrink-0">
              <button
                onClick={listen}
                className={`w-9 h-9 rounded-full grid place-items-center shrink-0 transition-colors ${listening ? 'bg-red-500 text-white animate-pulseGlow' : 'bg-violet-50 text-violet-600'}`}
              >
                <Mic className="w-4 h-4" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={listening ? 'Listening…' : 'Ask about events…'}
                className="flex-1 bg-violet-50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
              <button onClick={() => send()} className="w-9 h-9 rounded-full bg-violet-500 text-white grid place-items-center shrink-0 hover:bg-violet-600">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
