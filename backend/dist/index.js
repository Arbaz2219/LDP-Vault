"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const vault_1 = __importDefault(require("./routes/vault"));
const org_1 = __importDefault(require("./routes/org"));
const logs_1 = __importDefault(require("./routes/logs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const prisma = new client_1.PrismaClient();
exports.prisma = prisma;
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/vault', vault_1.default);
app.use('/api/org', org_1.default);
app.use('/api/logs', logs_1.default);
// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'LDP Bitwarden API' });
});
// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
