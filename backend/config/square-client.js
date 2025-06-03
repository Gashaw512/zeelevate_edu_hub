const { Client, Environment } = require('square');

const square = new Client({
  environment: process.env.SQUARE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN
});

module.exports = square;
