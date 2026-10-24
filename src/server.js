import app from './app.js';

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Server: http://127.0.0.1:${server.address().port}`);
});
