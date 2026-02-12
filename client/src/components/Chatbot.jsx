import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../services/api';
// Using modern React Icons (Ri) for a cleaner look
import { RiRobot2Line, RiSendPlaneFill, RiSubtractLine } from 'react-icons/ri';
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Namaste! I am your Welfora AI Assistant. How can I help you today? (e.g. "How to apply for PM-KISAN?", "Verify land status")' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Prepare history for Gemini
            const history = messages.map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                parts: [{ text: m.text }]
            }));

            const res = await apiClient.post('/chat', {
                message: input,
                history: history
            });

            const botMessage = { role: 'model', text: res.data.text };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting to the server right now. Please check your connection.' }]);
        } finally {
            setLoading(false);
        }
    };

    // Toggle Chat visibility
    const toggleChat = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Backdrop for closing on touch/click outside - ONLY visible when chat is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
                    onClick={() => setIsOpen(false)}
                    onTouchStart={() => setIsOpen(false)}
                    aria-label="Close chat overlay"
                />
            )}

            {/* Floating Toggle Button - Static (No Bounce) */}
            {!isOpen && (
                <button
                    onClick={toggleChat}
                    className="fixed bottom-8 right-14 w-16 h-16 bg-[#0B3D91] text-white rounded-full shadow-2xl hover:bg-[#092C6B] transition-all flex items-center justify-center text-3xl z-50 ring-4 ring-blue-50/50"
                    aria-label="Open Chat Assistant"
                >
                    <RiRobot2Line />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="fixed bottom-8 right-14 w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-50 animate-slideUp font-sans"
                    style={{ height: '550px', maxHeight: '85vh' }}
                >
                    {/* Header - Matches Navbar Color #0B3D91 */}
                    <div className="bg-[#0B3D91] p-4 flex items-center justify-between text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                                <RiRobot2Line className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base tracking-wide">Welfora AI</h3>
                                <div className="flex items-center gap-1.5 opacity-90">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-xs font-medium">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
                                aria-label="Minimize Chat"
                            >
                                <RiSubtractLine className="text-lg" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F6F9] scrollbar-thin scrollbar-thumb-gray-300">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-[#0B3D91] text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                    }`}>
                                    {msg.role === 'model' ? (
                                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-1 prose-headings:text-[#0B3D91] prose-strong:text-[#0B3D91] prose-a:text-blue-700">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center gap-2">
                                    <div className="w-2 h-2 bg-[#0B3D91] rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-[#0B3D91] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-[#0B3D91] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-[#F4F6F9] border-0 ring-1 ring-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91] transition-all shadow-inner placeholder:text-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="w-11 h-11 bg-[#0B3D91] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md transform"
                        >
                            <RiSendPlaneFill className="text-lg relative left-0.5" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default Chatbot;
