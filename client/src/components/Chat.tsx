import React, { useEffect, useState, useRef } from 'react';
import { socket } from '../socket/socket';

interface Message {
    roomId: string;
    senderId: string;
    content: string;
    createdAt: string;
}

interface ChatProps {
    roomId: string;
}

const Chat: React.FC<ChatProps> = ({ roomId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Fetch existing messages (optional, if API exists)
        // For now, just listen for new ones

        const handleReceiveMessage = (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        };

        socket.on('receive-message', handleReceiveMessage);

        return () => {
            socket.off('receive-message', handleReceiveMessage);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        socket.emit('send-message', { roomId, content: newMessage });
        setNewMessage('');
    };

    if (!isOpen) {
        return (
            <button className="chat-toggle" onClick={() => setIsOpen(true)}>
                💬
            </button>
        );
    }

    return (
        <div className="chat-sidebar">
            <div className="chat-header">
                <h3>Chat</h3>
                <button onClick={() => setIsOpen(false)}>×</button>
            </div>
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.senderId === socket.id ? 'own' : ''}`}>
                        <div className="msg-content">{msg.content}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="chat-input-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chat;
