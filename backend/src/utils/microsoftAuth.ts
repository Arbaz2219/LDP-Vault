import * as msal from '@azure/msal-node';

const msalConfig = {
    auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID || "",
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID || "common"}`,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    }
};

export const msalClient = new msal.ConfidentialClientApplication(msalConfig);

export const REDIRECT_URI = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/microsoft/callback`;
