import type { Tool, CanvasElement } from './Tool';
import { v4 as uuidv4 } from 'uuid';

export class ShapeTool implements Tool {
    private type: 'rect' | 'circle';

    constructor(type: 'rect' | 'circle') {
        this.type = type;
    }

    onMouseDown(e: React.MouseEvent, _ctx: CanvasRenderingContext2D, color: string, strokeWidth: number, fillColor?: string): CanvasElement | null {
        const { clientX, clientY } = e;
        return {
            id: uuidv4(),
            type: this.type,
            x: clientX,
            y: clientY,
            width: 0,
            height: 0,
            color,
            fillColor, // Store fill color if provided
            strokeWidth
        };
    }

    onMouseMove(e: React.MouseEvent, ctx: CanvasRenderingContext2D, element: CanvasElement | null): CanvasElement | null {
        if (!element) return null;

        const { clientX, clientY } = e;
        const width = clientX - (element.x || 0);
        const height = clientY - (element.y || 0);

        this.draw(ctx, { ...element, width, height });

        return { ...element, width, height };
    }

    onMouseUp(_e: React.MouseEvent, _ctx: CanvasRenderingContext2D, _element: CanvasElement | null): void {
        // No specific finish logic needed
    }

    draw(ctx: CanvasRenderingContext2D, element: CanvasElement): void {
        ctx.strokeStyle = element.color;
        ctx.lineWidth = element.strokeWidth;
        ctx.beginPath();

        const x = element.x || 0;
        const y = element.y || 0;
        const w = element.width || 0;
        const h = element.height || 0;

        if (element.type === 'rect') {
            ctx.rect(x, y, w, h); // Use rect path
        } else if (element.type === 'circle') {
            const radius = Math.sqrt(w * w + h * h);
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
        }

        if (element.fillColor) {
            ctx.fillStyle = element.fillColor;
            ctx.fill();
        }
        ctx.stroke();
    }
}
