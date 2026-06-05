import * as msal from '@azure/msal-node';
import { BACKEND_URL } from '../config';

const msalConfig = {
    auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID || "",
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || "common"}`,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    }
};

export const msalClient = new msal.ConfidentialClientApplication(msalConfig);

export const REDIRECT_URI = process.env.API_DOMAIN 
    ? `https://${process.env.API_DOMAIN}/api/auth/microsoft/callback`
    : `${BACKEND_URL}/api/auth/microsoft/callback`;
