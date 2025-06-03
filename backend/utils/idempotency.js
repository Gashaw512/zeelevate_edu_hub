const { randomUUID } = require('crypto');
const generateKey = () => randomUUID();
module.exports = { generateKey };
