import React, { useState } from 'react';
import '../styles/landing.css'; // Reuse landing styles or add specific dialog styles

interface CreateRoomDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
}

const CreateRoomDialog: React.FC<CreateRoomDialogProps> = ({ isOpen, onClose, onSubmit }) => {
    const [boardName, setBoardName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (boardName.trim()) {
            onSubmit(boardName);
            setBoardName('');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontFamily: 'Poppins' }}>Create New Board</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter Board Name"
                        className="input-landing-bordered"
                        style={{ marginBottom: '1.5rem', textAlign: 'left' }}
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        autoFocus
                        required
                    />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-landing-black"
                            style={{ background: '#eee', color: '#333', padding: '0.8rem' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-landing-black"
                            style={{ padding: '0.8rem' }}
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomDialog;
