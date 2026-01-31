import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Guest Mode: Trust x-user-id header or generate one if strictly needed (though usually client sends it)
    const guestId = req.header('x-user-id');

    if (guestId) {
        req.user = { userId: guestId };
        return next();
    }

    // Fallback for existing tests or if no header (should be handled by client)
    // We can just deny or generate a temp one, but for Dashboard to work we need consistency.
    // Let's allow access but req.user might be undefined if not provided, 
    // OR we can enforce it.

    // For now, if no ID, we can't persist ownership properly.
    return res.status(401).json({ error: 'No user identity provided' });
};
