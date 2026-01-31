import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

interface Board {
    _id: string;
    title: string;
    roomId?: string;
    updatedAt: string;
}

const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const [boards, setBoards] = useState<Board[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az'>('newest');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        if (!user) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${apiUrl}/api/boards`, {
                headers: { 'x-user-id': user.id }
            });
            const data = await res.json();
            if (res.ok) setBoards(data);
        } catch (err) {
            console.error("Failed to fetch boards", err);
        }
    };

    const createBoard = async () => {
        if (!user) return;
        const title = prompt("Enter board title:", "Untitled Board");
        if (!title) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${apiUrl}/api/boards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({ title })
            });
            const newBoard = await res.json();
            if (res.ok) {
                navigate(`/room/${newBoard.roomId}`);
            }
        } catch (err) {
            console.error("Failed to create board", err);
        }
    };

    const deleteBoard = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!user) return;
        if (!confirm("Are you sure you want to delete this board?")) return;

        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            await fetch(`${apiUrl}/api/boards/${id}`, {
                method: 'DELETE',
                headers: { 'x-user-id': user.id }
            });
            setBoards(prev => prev.filter(b => b._id !== id));
        } catch (err) {
            console.error("Failed to delete board", err);
        }
    };

    const handleJoin = () => {
        const input = document.getElementById('join-room-input') as HTMLInputElement;
        if (input && input.value) {
            navigate(`/room/${input.value}`);
        }
    };

    // Optimization: Filter and Sort logic memoized
    const filteredBoards = useMemo(() => {
        let result = [...boards];

        // Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(b => b.title.toLowerCase().includes(lowerQuery) || (b.roomId && b.roomId.includes(lowerQuery)));
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            if (sortBy === 'oldest') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            if (sortBy === 'az') return a.title.localeCompare(b.title);
            return 0;
        });

        return result;
    }, [boards, searchQuery, sortBy]);

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">

                {/* Header */}
                <div className="dashboard-header">
                    <div className="dashboard-title">
                        <h1>Dashboard</h1>
                        <p>Welcome back, {user?.username}</p>
                    </div>
                    <div className="dashboard-actions">
                        <button className="btn-new-board" onClick={createBoard}>+ Create Board</button>
                        <button className="btn-logout" onClick={logout}>Logout</button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="dashboard-toolbar">
                    <div className="join-board-card">
                        <input
                            type="text"
                            placeholder="Enter Room ID"
                            className="input-dashboard"
                            id="join-room-input"
                            style={{ flex: 1 }}
                        />
                        <button className="btn-join" onClick={handleJoin}>
                            Join Room
                        </button>
                    </div>

                    <div className="search-sort-container">
                        <input
                            type="text"
                            placeholder="Search boards..."
                            className="input-dashboard"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 2 }}
                        />
                        <select
                            className="select-dashboard"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="az">A-Z</option>
                        </select>
                    </div>
                </div>

                {/* Grid */}
                <div className="boards-grid">
                    {filteredBoards.map(board => (
                        <div
                            key={board._id}
                            className="board-card"
                            onClick={() => navigate(`/room/${board.roomId || board._id}`)}
                        >
                            <button
                                className="btn-delete-board"
                                onClick={(e) => deleteBoard(e, board._id)}
                                title="Delete Board"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                            </button>

                            <div>
                                <h3 className="board-title">{board.title}</h3>
                                <p className="board-meta">ID: {board.roomId || 'Legacy'}</p>
                            </div>
                            <div className="board-meta" style={{ textAlign: 'right' }}>
                                {new Date(board.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}

                    {filteredBoards.length === 0 && (
                        <div className="empty-state">
                            {searchQuery ? 'No boards found matching your search.' : "You don't have any boards yet. Create one to get started!"}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
