import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Card from '@/components/ui/Card';
import * as aiService from '@/services/aiService';
import { cn } from '@/utils/cn';

const SUGGESTIONS = ['Reorder suggestions', 'Risk analysis'];

export default function LogisticsCopilot({ className = '' }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const history = await aiService.getChatHistory();
      if (!cancelled) {
        setMessages(history);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, sender: 'user', text: trimmed }]);
    setInput('');
    setSending(true);

    const reply = await aiService.sendChatMessage(trimmed);
    setMessages((prev) => [...prev, reply]);
    setSending(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <div className="flex items-center justify-between border-b border-outline-variant p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <Icon name="smart_toy" filled className="text-base" />
          </div>
          <h3 className="font-semibold text-primary">Logistics Copilot</h3>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {loading ? (
          <LoadingSpinner />
        ) : (
          messages.map((message) => (
            <div key={message.id} className={cn('flex gap-3', message.sender === 'user' && 'flex-row-reverse')}>
              <div
                className={cn(
                  'mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px]',
                  message.sender === 'user'
                    ? 'border-secondary/30 bg-secondary-container text-on-secondary-container'
                    : 'border-primary/20 bg-primary/10 text-primary'
                )}
              >
                <Icon name={message.sender === 'user' ? 'person' : 'smart_toy'} filled className="text-[10px]" />
              </div>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl p-3 text-sm shadow-sm',
                  message.sender === 'user'
                    ? 'rounded-tr-sm bg-primary text-on-primary'
                    : 'rounded-tl-sm bg-surface-container text-on-surface'
                )}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
              <Icon name="smart_toy" filled className="text-[10px]" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-surface-container p-3">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-on-surface-variant" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-on-surface-variant [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-on-surface-variant [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-outline-variant bg-surface-container-low p-4">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about forecasts..."
            className="w-full rounded-full border border-outline-variant bg-surface px-4 py-3 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={sending}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary transition-all hover:brightness-110 disabled:opacity-50"
          >
            <Icon name="send" filled className="text-sm" />
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => sendMessage(suggestion)}
              disabled={sending}
              className="whitespace-nowrap rounded-full border border-outline-variant px-2.5 py-1 text-[10px] text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>
    </Card>
  );
}
