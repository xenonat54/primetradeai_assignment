const app = require('./app');

require('dotenv').config({ path: '../.env' });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\nServer running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});
