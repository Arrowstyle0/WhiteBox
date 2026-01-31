import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db';
import Board from './models/Board';
import Element from './models/Element';
import Message from './models/Message';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Connect Database
connectDB();

// API Routes
import authRoutes from './routes/auth';

app.use(express.json()); // Ensure JSON parsing is enabled
app.use('/api/auth', authRoutes);

import { authMiddleware, AuthRequest } from './middleware/auth';
import { v4 as uuidv4 } from 'uuid'; // Fallback or use crypto
import crypto from 'crypto';

app.post('/api/boards', authMiddleware, async (req: AuthRequest, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not available' });
        }

        // Generate short 6-char ID
        const roomId = crypto.randomBytes(3).toString('hex');

        const board = new Board({
            ...req.body,
            owner: req.user.userId,
            roomId
        });
        await board.save();
        res.json(board);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create board' });
    }
});

app.delete('/api/boards/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const board = await Board.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
        if (!board) return res.status(404).json({ error: 'Board not found or unauthorized' });

        // Also delete associated elements (Project Delete)
        await Element.deleteMany({ boardId: board.roomId });

        res.json({ message: 'Board deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete board' });
    }
});

// Get user's boards
app.get('/api/boards', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const boards = await Board.find({ owner: req.user.userId }).sort({ updatedAt: -1 });
        res.json(boards);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch boards' });
    }
});

app.get('/api/boards/:id/elements', async (req, res) => {
    try {
        // Here :id could be roomId (short) or _id. 
        // Elements store 'boardId' which we set to match the roomId of the board.
        // So we just query by boardId matches the param.
        const elements = await Element.find({ boardId: req.params.id });
        res.json(elements);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch elements' });
    }
});

app.get('/api/rooms/:roomId/messages', async (req, res) => {
    try {
        const messages = await Message.find({ roomId: req.params.roomId }).sort({ createdAt: 1 }).limit(50);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Serve static assets in production
import path from 'path';

// Serve client/dist folder
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Handle SPA routing (send index.html for any unknown route)
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'));
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('draw', (data) => {
        // data: { roomId, element }
        // Broadcast to others in the room
        socket.to(data.roomId).emit('draw', data.element); // Send back only the element
    });

    socket.on('save-element', async (data) => {
        // Save to DB asynchronously
        try {
            const { roomId, element } = data;
            if (!roomId || !element) return;

            if (mongoose.connection.readyState === 1) {
                const newElement = new Element({ ...element, boardId: roomId });
                await newElement.save();
            }
        } catch (err) {
            console.error("Error saving element:", err);
        }
    });

    socket.on('send-message', async (data) => {
        try {
            const { roomId, content } = data;
            const messageData = {
                roomId,
                content,
                senderId: socket.id,
                createdAt: new Date()
            };

            // Broadcast
            io.to(roomId).emit('receive-message', messageData);

            // Save
            if (mongoose.connection.readyState === 1) {
                const newMessage = new Message({ roomId, senderId: socket.id, content });
                await newMessage.save();
            }
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('clear', async (roomId) => {
        try {
            await Element.deleteMany({ boardId: roomId });
            io.to(roomId).emit('clear');
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5001;

// Connect Database then start server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to DB, server not started', err);
});
