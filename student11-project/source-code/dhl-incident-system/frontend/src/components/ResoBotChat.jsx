import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // <-- NEW: Import Auth Context

export default function ResoBotChat() {
    const { token } = useAuth(); // <-- NEW: Grab the token

    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([
        { role: 'assistant', content: 'Hello! I am ResoBot. I can check incident statuses, find stuck tickets, or summarize reports. How can I help?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg = message;
        setMessage('');

        // Add user message to UI
        const newHistory = [...history, { role: 'user', content: userMsg }];
        setHistory(newHistory);
        setIsTyping(true);

        try {
            // Exclude the very first greeting from history to save tokens
            const chatContext = newHistory.slice(-6);

            const res = await fetch('http://localhost:5001/api/incidents/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <-- NEW: Attach Token here!
                },
                body: JSON.stringify({
                    message: userMsg,
                    history: chatContext.filter(m => m.role !== 'system')
                })
            });

            const data = await res.json();

            setHistory(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            setHistory(prev => [...prev, { role: 'assistant', content: "Error: Could not reach the server. Make sure you are logged in." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[500px] animate-fade-in overflow-hidden">

                    {/* Header */}
                    <div className="bg-[#FFCC00] p-4 flex justify-between items-center shrink-0">
                        <div className="flex items-center space-x-2 text-gray-900">
                            <Bot size={20} />
                            <h3 className="font-bold">ResoBot Copilot</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-black transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {history.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === 'user'
                                    ? 'bg-[#D40511] text-white rounded-br-none'
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                    }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-3 shadow-sm">
                                    <Loader2 size={16} className="animate-spin text-gray-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                        <form onSubmit={handleSend} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ask about an incident..."
                                className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] rounded-xl px-4 py-2 text-sm transition-all outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || isTyping}
                                className="bg-[#D40511] hover:bg-red-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors shadow-sm"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${isOpen ? 'bg-gray-800 text-white' : 'bg-[#D40511] text-white'
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
}