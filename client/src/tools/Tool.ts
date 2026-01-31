export interface CanvasElement {
    id: string;
    type: string;
    points?: { x: number; y: number }[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    fontSize?: number;
    color: string;
    fillColor?: string; // Add support for fill
    strokeWidth: number;
    author?: string; // Username of the creator
}

export interface Tool {
    onMouseDown(e: React.MouseEvent, ctx: CanvasRenderingContext2D, color: string, strokeWidth: number, fillColor?: string): CanvasElement | null;
    onMouseMove(e: React.MouseEvent, ctx: CanvasRenderingContext2D, element: CanvasElement | null): CanvasElement | null; // Returns updated element
    onMouseUp(e: React.MouseEvent, ctx: CanvasRenderingContext2D, element: CanvasElement | null): void;
    draw(ctx: CanvasRenderingContext2D, element: CanvasElement): void;
}
