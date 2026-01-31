import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreateRoomDialog from '../components/CreateRoomDialog';
import '../styles/landing.css';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, login } = useAuth();

    // Local state for "Login" (Enter Name) flow
    const [usernameInput, setUsernameInput] = useState('');

    // Room Joining state
    const [roomId, setRoomId] = useState('');

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (usernameInput.trim()) {
            login(usernameInput);
        }
    };

    const handleCreateRoom = async (boardName: string) => {
        try {
            // Need to pass user ID in headers since we removed auth middleware token check
            // AuthContext 'user' has the ID.
            if (!user) return;

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiUrl}/api/boards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({ title: boardName })
            });

            if (res.ok) {
                const data = await res.json();
                navigate(`/room/${data.roomId}`);
            } else {
                throw new Error('Failed to create board');
            }
        } catch (err) {
            console.error("Failed to create board", err);
            alert("Failed to create board. Please try again.");
        }
    };

    const joinRoom = () => {
        if (!roomId) return;
        // If not authenticated (no name), we should ask for it?
        // Current logic: Just go to room. Room will likely be view-only or generic guest if we don't force name.
        // But requested flow implies identifying first.
        if (!isAuthenticated) {
            // Optional: Redirect to login or just ask for name here. 
            // For simplicity, enforce name on landing page before interactions?
            // "Enter your name to continue"
            alert("Please enter your name first!");
            return;
        }
        navigate(`/room/${roomId}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            joinRoom();
        }
    };

    return (
        <div className="landing-page-wrapper">
            <CreateRoomDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={(name) => {
                    setIsDialogOpen(false);
                    handleCreateRoom(name);
                }}
            />

            <div className="landing-left fade-in-left">
                <h1 className="landing-welcome-text">
                    Welcome <br />
                    To <span className="landing-brand-highlight">WhiteBox</span>
                </h1>
            </div>

            <div className="landing-right fade-in-up">
                <div className="landing-auth-container">

                    {!isAuthenticated ? (
                        <>
                            <h2 className="landing-subheading">Enter your name to start collaborating</h2>
                            <form onSubmit={handleLogin}>
                                <input
                                    type="text"
                                    className="input-landing-bordered"
                                    placeholder="Your Name"
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="btn-landing-black" style={{ marginTop: '1rem' }}>
                                    Continue
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 className="landing-subheading">
                                Welcome, <span style={{ color: '#000', fontWeight: 600 }}>{user?.username}</span>
                            </h2>

                            <button className="btn-landing-black" onClick={() => setIsDialogOpen(true)}>
                                Create New Board
                            </button>

                            <div className="landing-divider">
                                <span>or</span>
                            </div>

                            <input
                                type="text"
                                className="input-landing-bordered"
                                placeholder="Enter Room Id"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />

                            <div style={{ marginTop: '2rem' }}>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: '#666' }}
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default LandingPage;
