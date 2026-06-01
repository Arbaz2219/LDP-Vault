import dotenv from 'dotenv';
import path from 'path';

// Force load env from the backend directory specifically if possible
dotenv.config({ path: path.join(__dirname, '../.env') });
// Also try the root in case it's running from there
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'ldp-secure-vault-fallback-secret-2026';
export const PORT = process.env.PORT || 5000;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

console.log(`[CONFIG] Environment initialized. JWT_SECRET ${process.env.JWT_SECRET ? 'loaded from ENV' : 'using fallback'}`);
