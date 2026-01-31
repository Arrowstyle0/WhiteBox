import type { Tool, CanvasElement } from './Tool';
import { v4 as uuidv4 } from 'uuid';

export class PenTool implements Tool {
    onMouseDown(e: React.MouseEvent, _ctx: CanvasRenderingContext2D, color: string, strokeWidth: number): CanvasElement | null {
        const { clientX, clientY } = e;
        // Adjust for canvas offset if needed (assuming full screen for now)
        return {
            id: uuidv4(),
            type: 'path',
            points: [{ x: clientX, y: clientY }],
            color,
            strokeWidth
        };
    }

    onMouseMove(e: React.MouseEvent, ctx: CanvasRenderingContext2D, element: CanvasElement | null): CanvasElement | null {
        if (!element || element.type !== 'path') return null;

        const { clientX, clientY } = e;
        const newPoints = [...(element.points || []), { x: clientX, y: clientY }];

        // Immediate render feedback
        ctx.strokeStyle = element.color;
        ctx.lineWidth = element.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (newPoints.length > 1) {
            const lastPoint = newPoints[newPoints.length - 2];
            ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(clientX, clientY);
            ctx.stroke();
        }

        return { ...element, points: newPoints };
    }

    onMouseUp(_e: React.MouseEvent, _ctx: CanvasRenderingContext2D, _element: CanvasElement | null): void {
        // Finalize logic if needed
    }

    draw(ctx: CanvasRenderingContext2D, element: CanvasElement): void {
        if (element.type !== 'path' || !element.points || element.points.length < 2) return;

        ctx.strokeStyle = element.color;
        ctx.lineWidth = element.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(element.points[0].x, element.points[0].y);

        // Smooth curve using quadraticBezier or just simple lineTo for now
        for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
        }
        ctx.stroke();
    }
}
