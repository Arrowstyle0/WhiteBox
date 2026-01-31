import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { socket } from '../socket/socket';
import { PenTool } from '../tools/PenTool';
import { ShapeTool } from '../tools/ShapeTool';
import { TextTool } from '../tools/TextTool';
import { EraserTool } from '../tools/EraserTool';
import type { CanvasElement, Tool } from '../tools/Tool';

interface WhiteboardProps {
    roomId: string;
    selectedTool: string;
    selectedColor: string;
    isFillMode?: boolean;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ roomId, selectedTool, selectedColor, isFillMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [elements, setElements] = useState<CanvasElement[]>([]);
    const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
    const isDrawing = useRef(false);

    // Pan State
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const startPanMousePos = useRef({ x: 0, y: 0 });

    // Initialize tools map
    const tools = useMemo(() => ({
        path: new PenTool(),
        rect: new ShapeTool('rect'),
        circle: new ShapeTool('circle'),
        text: new TextTool(),
        eraser: new EraserTool()
    }), []);

    // Get active tool instance
    const getActiveTool = (): Tool => {
        if (selectedTool === 'rect' || selectedTool === 'circle') {
            return tools[selectedTool as keyof typeof tools];
        }
        if (selectedTool === 'text') return tools.text;
        if (selectedTool === 'eraser') return tools.eraser;
        return tools.path; // Default to pen
    };

    // Initial socket setup and sync (unchanged)
    useEffect(() => {
        if (!roomId) return;
        socket.connect();
        socket.emit('join-room', roomId);

        fetch(`http://localhost:5001/api/boards/${roomId}/elements`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setElements(data);
                else setElements([]);
            })
            .catch(err => console.error("Failed to load elements", err));

        socket.on('draw', (newElement: CanvasElement) => {
            setElements((prev) => [...prev, newElement]);
        });

        socket.on('clear', () => {
            setElements([]);
        });

        return () => {
            socket.off('draw');
            socket.off('clear');
            socket.disconnect();
        };
    }, [roomId]);

    // Redraw canvas efficiently
    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas (reset transform first to clear viewport)
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply Pan Offset
        ctx.translate(panOffset.x, panOffset.y);

        // Draw saved elements
        elements.forEach((el) => {
            const tool = tools[el.type as keyof typeof tools];
            if (tool) tool.draw(ctx, el);
        });

        // Draw current element being drawn
        if (currentElement) {
            const activeTool = getActiveTool();
            activeTool.draw(ctx, currentElement);
        }

    }, [elements, currentElement, tools, panOffset]);

    // Canvas Resize Observer (unchanged)
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                setElements(prev => [...prev]); // trigger redraw
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Pan Tool Logic
        if (selectedTool === 'pan') {
            isPanning.current = true;
            startPanMousePos.current = { x: e.clientX, y: e.clientY };
            return;
        }

        isDrawing.current = true;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        // Use adjusted coordinates for new elements
        const activeTool = getActiveTool();
        // Create event-like object with adjusted coords
        const adjustedEvent = { ...e, clientX: e.clientX - panOffset.x, clientY: e.clientY - panOffset.y };

        const newEl = activeTool.onMouseDown(adjustedEvent as React.MouseEvent, ctx, selectedColor, 3, isFillMode ? selectedColor : undefined);

        if (newEl) {
            setCurrentElement(newEl);

            if (newEl.type === 'text') {
                isDrawing.current = false;
                setElements((prev) => [...prev, newEl]);
                socket.emit('draw', { roomId, element: newEl });
                socket.emit('save-element', { roomId, element: newEl });
                setCurrentElement(null);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        // Pan Tool Logic
        if (isPanning.current) {
            const dx = e.clientX - startPanMousePos.current.x;
            const dy = e.clientY - startPanMousePos.current.y;
            setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            startPanMousePos.current = { x: e.clientX, y: e.clientY };
            return;
        }

        if (!isDrawing.current || !currentElement) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        const activeTool = getActiveTool();
        const adjustedEvent = { ...e, clientX: e.clientX - panOffset.x, clientY: e.clientY - panOffset.y };

        const updatedEl = activeTool.onMouseMove(adjustedEvent as React.MouseEvent, ctx, currentElement);
        setCurrentElement(updatedEl);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (isPanning.current) {
            isPanning.current = false;
            return;
        }

        if (!isDrawing.current) return;
        isDrawing.current = false;

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        const activeTool = getActiveTool();
        const adjustedEvent = { ...e, clientX: e.clientX - panOffset.x, clientY: e.clientY - panOffset.y };
        activeTool.onMouseUp(adjustedEvent as React.MouseEvent, ctx, currentElement);

        if (currentElement) {
            setElements((prev) => [...prev, currentElement]);
            socket.emit('draw', { roomId, element: currentElement });
            socket.emit('save-element', { roomId, element: currentElement });
            setCurrentElement(null);
        }
    };

    return (
        <div className="canvas-container" style={{ cursor: selectedTool === 'pan' ? (isPanning.current ? 'grabbing' : 'grab') : 'crosshair' }}>
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
        </div>
    );
};

export default Whiteboard;
