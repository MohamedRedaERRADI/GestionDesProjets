import React, { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';

const AIAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            text: input,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai-assistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input })
            });

            const data = await response.json();
            
            const aiMessage = {
                text: data.response,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = {
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ai-assistant">
            <div className="ai-header">
                <h2>AI Assistant</h2>
                <p>Ask me anything about your projects and tasks</p>
            </div>
            
            <div className="chat-container">
                <div className="messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.sender}`}>
                            <div className="message-content">
                                <div className="message-text">{message.text}</div>
                                <div className="message-time">{message.timestamp}</div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message ai">
                            <div className="message-content">
                                <div className="message-text typing">AI is thinking...</div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIAssistant; 