import type { Tool, CanvasElement } from './Tool';
import { v4 as uuidv4 } from 'uuid';

export class TextTool implements Tool {
    onMouseDown(e: React.MouseEvent, _ctx: CanvasRenderingContext2D, color: string, strokeWidth: number): CanvasElement | null {
        // Text tool involves a prompt or an input field. 
        // For simplicity in Canvas, we'll prompt immediately, or place a cursor.
        // Let's use a simple prompt for v1.
        const text = prompt("Enter text:");
        if (!text) return null;

        const { clientX, clientY } = e;
        return {
            id: uuidv4(),
            type: 'text',
            x: clientX,
            y: clientY,
            text,
            fontSize: 24, // Default
            color,
            strokeWidth
        };
    }

    onMouseMove(_e: React.MouseEvent, _ctx: CanvasRenderingContext2D, element: CanvasElement | null): CanvasElement | null {
        return element; // Text doesn't drag-resize on creation in this simple version
    }

    onMouseUp(_e: React.MouseEvent, _ctx: CanvasRenderingContext2D, _element: CanvasElement | null): void {
    }

    draw(ctx: CanvasRenderingContext2D, element: CanvasElement): void {
        if (!element.text) return;
        ctx.font = `${element.fontSize || 24}px sans-serif`;
        ctx.fillStyle = element.color; // Text uses fill
        ctx.fillText(element.text, element.x || 0, element.y || 0);
    }
}
