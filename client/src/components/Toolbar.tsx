import React from 'react';

interface ToolbarProps {
    selectedTool: string;
    setSelectedTool: (tool: string) => void;
    selectedColor: string;
    setSelectedColor: (color: string) => void;
    isFillMode: boolean;
    setIsFillMode: (fill: boolean) => void;
    onClear: () => void;
}

const COLORS = ['#000000', '#FF0000', '#0000FF', '#008000', '#FFA500'];

const Toolbar: React.FC<ToolbarProps> = ({ selectedTool, setSelectedTool, selectedColor, setSelectedColor, isFillMode, setIsFillMode, onClear }) => {
    return (
        <div className="floating-toolbar">
            <button
                className={`tool-btn ${selectedTool === 'pan' ? 'active' : ''}`}
                onClick={() => setSelectedTool('pan')}
                title="Pan Tool (Move Canvas)"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 11.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5V14h1.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H10v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2H6.5a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5H7v-2.5z" /><path d="M12 2a2 2 0 0 0-2 2v2H8V4a4 4 0 0 1 4-4 4 4 0 0 1 4 4v2h-2V4a2 2 0 0 0-2-2z" /></svg>
                {/* Hand Icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>
            </button>
            <button
                className={`tool-btn ${selectedTool === 'pen' ? 'active' : ''}`}
                onClick={() => setSelectedTool('pen')}
                title="Pen"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path></svg>
            </button>
            <button
                className={`tool-btn ${selectedTool === 'rect' ? 'active' : ''}`}
                onClick={() => setSelectedTool('rect')}
                title="Rectangle"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
            </button>
            <button
                className={`tool-btn ${selectedTool === 'circle' ? 'active' : ''}`}
                onClick={() => setSelectedTool('circle')}
                title="Circle"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle></svg>
            </button>
            <button
                className={`tool-btn ${selectedTool === 'text' ? 'active' : ''}`}
                onClick={() => setSelectedTool('text')}
                title="Text"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16" /></svg>
            </button>
            <button
                className={`tool-btn ${selectedTool === 'eraser' ? 'active' : ''}`}
                onClick={() => setSelectedTool('eraser')}
                title="Eraser"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.5 13.5l8.5 8.5 9-9-8.5-8.5a2.12 2.12 0 00-3 0l-6 6a2.12 2.12 0 000 3z" /><path d="M11 11l8.5 8.5" /></svg>
            </button>

            <div style={{ width: 1, height: 24, background: '#eee', margin: '0 4px' }} />

            {COLORS.map(color => (
                <div
                    key={color}
                    className={`color-picker ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                />
            ))}

            <div style={{ width: 1, height: 24, background: '#eee', margin: '0 4px' }} />

            <button
                className={`tool-btn ${isFillMode ? 'active' : ''}`}
                onClick={() => setIsFillMode(!isFillMode)}
                title="Toggle Fill"
                style={{ fontSize: '0.8rem', width: 'auto', padding: '0 12px', borderRadius: '12px' }}
            >
                {isFillMode ? 'Filled' : 'Outline'}
            </button>
            <div style={{ width: 1, height: 24, background: '#eee', margin: '0 4px' }} />

            <button
                className="tool-btn"
                onClick={onClear}
                title="Clear All"
                style={{ color: '#ff4d4f' }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </button>
        </div>
    );
};

export default Toolbar;
