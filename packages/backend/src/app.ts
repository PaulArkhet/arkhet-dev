import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { projectRouter } from './routes/projects';
import { datasetRouter } from './routes/datasets';
import { authRouter } from './routes/auth';
import { styleguideRouter } from './routes/styleguides';
import { Server as SocketServer } from 'socket.io';
import { serve } from '@hono/node-server';
import { HTTPException } from 'hono/http-exception';
import { serveStatic } from 'hono/bun';
import { attachSocketEventListeners } from './ws';
import { prototypeRouter } from './routes/prototypes';
import { multipagePathRouter } from './routes/multipage-path';
import { shapesRouter } from './routes/shapes';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = new Hono();

// Middleware
app.use(logger());

// Error handler
app.onError((err, c) => {
  console.error('err caught by global err handler');
  if (err instanceof HTTPException) {
    console.error(
      'Caught HTTP Exception: \n',
      err.cause ? err.cause : err.message
    );

    return err.getResponse();
  } else {
    console.error(`Uncaught error ${err.name}: ${err.message}`);
    return c.json({ error: err }, 500);
  }
});

// Api Routes

const apiRoutes = app
  .basePath('/api/v0')
  .route('/auth', authRouter)
  .route('/projects', projectRouter)
  .route('/datasets', datasetRouter)
  .route('/styleguides', styleguideRouter)
  .route('/prototypes', prototypeRouter)
  .route('/multipage-paths', multipagePathRouter)
  .route('/shapes', shapesRouter);

// Static Routes
app.get('*', serveStatic({ root: '../frontend/dist' }));
app.notFound((c) => c.html(Bun.file('../frontend/dist/index.html').text()));

export type ApiRoutes = typeof apiRoutes;

const server = serve({
  port: PORT,
  hostname: '0.0.0.0',
  fetch: app.fetch,
});

const io = new SocketServer(server, {
  path: '/ws',
  serveClient: false,
});

attachSocketEventListeners(io);

console.log('App listening on port: ', PORT);
