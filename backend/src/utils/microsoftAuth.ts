import * as msal from '@azure/msal-node';
import { BACKEND_URL } from '../config';
import { Request } from 'express';

const msalConfig = {
    auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID || "",
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || "common"}`,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    }
};

export const msalClient = new msal.ConfidentialClientApplication(msalConfig);

/**
 * Dynamically determines the redirect URI based on the request host.
 * This allows the same backend to work across localhost, ngrok, and production.
 */
export const getRedirectUri = (req: Request) => {
    const host = req.get('host') || '';
    const isProduction = process.env.API_DOMAIN && host.startsWith(process.env.API_DOMAIN);

    // In development, if NGROK_URL is set, use it as the primary redirect URI
    // This ensures Microsoft SSO works even when accessing via localhost
    if (!isProduction && process.env.NGROK_URL) {
        return `${process.env.NGROK_URL}/api/auth/microsoft/callback`;
    }

    if (!host) return `${BACKEND_URL}/api/auth/microsoft/callback`;

    // Detect protocol
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const isNgrok = host.includes('ngrok-free.dev');
    
    // Ngrok and Production should use HTTPS
    const protocol = (isLocal && !isNgrok) ? 'http' : 'https';
    
    return `${protocol}://${host}/api/auth/microsoft/callback`;
};

