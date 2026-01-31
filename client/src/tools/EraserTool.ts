import type { Tool, CanvasElement } from './Tool';
import { v4 as uuidv4 } from 'uuid';

export class EraserTool implements Tool {
    onMouseDown(e: React.MouseEvent, _ctx: CanvasRenderingContext2D, _color: string, strokeWidth: number): CanvasElement | null {
        const { clientX, clientY } = e;
        return {
            id: uuidv4(),
            type: 'eraser',
            points: [{ x: clientX, y: clientY }],
            color: '#000000', // Irrelevant for eraser but needed for type
            strokeWidth: strokeWidth * 5 // Eraser is usually bigger
        };
    }

    onMouseMove(e: React.MouseEvent, ctx: CanvasRenderingContext2D, element: CanvasElement | null): CanvasElement | null {
        if (!element || element.type !== 'eraser') return null;

        const { clientX, clientY } = e;
        const newPoints = [...(element.points || []), { x: clientX, y: clientY }];

        this.draw(ctx, { ...element, points: newPoints });

        return { ...element, points: newPoints };
    }

    onMouseUp(_e: React.MouseEvent, _ctx: CanvasRenderingContext2D, _element: CanvasElement | null): void {
    }

    draw(ctx: CanvasRenderingContext2D, element: CanvasElement): void {
        if (!element.points || element.points.length < 2) return;

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out'; // This makes it erase
        ctx.lineWidth = element.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(element.points[0].x, element.points[0].y);

        for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }
}
