require('dotenv').config();
const { REDIRECT_URI } = require('./src/utils/microsoftAuth');
console.log('Current REDIRECT_URI:', REDIRECT_URI);
console.log('CLIENT_ID:', process.env.MICROSOFT_CLIENT_ID);
console.log('SECRET:', process.env.MICROSOFT_CLIENT_SECRET?.substring(0, 5) + '...');
