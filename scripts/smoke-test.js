import assert from 'node:assert/strict';
import { once } from 'node:events';

process.env.NODE_ENV = 'test';
const { default: app } = await import('../src/app.js');
const { default: db } = await import('../src/config/database.js');
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');

try {
  const response = await fetch(`http://127.0.0.1:${server.address().port}/health`, {
    signal: AbortSignal.timeout(3000),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
  console.log('Smoke-test: сервер відповідає.');
} finally {
  await new Promise((resolve) => server.close(resolve));
  db.close();
}
