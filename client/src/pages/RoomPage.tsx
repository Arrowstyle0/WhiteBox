import React, { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import Whiteboard from '../components/Whiteboard';
import Toolbar from '../components/Toolbar';

import Chat from '../components/Chat';

import { socket } from '../socket/socket';

const RoomPage: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [selectedTool, setSelectedTool] = useState('pen');
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [isFillMode, setIsFillMode] = useState(false);

    if (!roomId) {
        return <Navigate to="/" replace />;
    }

    const handleClear = () => {
        if (confirm('Are you sure you want to clear the whiteboard?')) {
            socket.emit('clear', roomId);
        }
    };

    return (
        <div className="room-container">
            <Whiteboard
                roomId={roomId}
                selectedTool={selectedTool}
                selectedColor={selectedColor}
                isFillMode={isFillMode}
            />
            <Toolbar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                isFillMode={isFillMode}
                setIsFillMode={setIsFillMode}
                onClear={handleClear}
            />
            <Chat roomId={roomId} />
            <div className="room-header-controls" style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                display: 'flex',
                gap: '10px',
                zIndex: 100
            }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-exit"
                    style={{
                        background: 'white',
                        border: '1px solid #ddd',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: '#333',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    ← Exit
                </button>
                <div className="room-info" style={{ position: 'static', transform: 'none' }}>
                    Room: {roomId}
                </div>
            </div>
        </div>
    );
};

export default RoomPage;
