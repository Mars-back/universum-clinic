import { execFileSync } from 'node:child_process';
import express from 'express';
import clinicRoutes from './routes/clinic.routes.js';

const app = express();
let sha;

try {
  sha = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch {
  sha = 'uncommitted';
}

app.use(express.json());
app.use('/api', clinicRoutes);

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/version', (_request, response) => {
  response.json({ sha });
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Маршрут не знайдено.' });
});

app.use((error, _request, response, _next) => {
  response.status(error.status ?? 500).json({
    error: error.status ? error.message : 'Помилка сервера.',
  });
});

export default app;
