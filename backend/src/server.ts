import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import extractRoutes from './routes/extract';
import generateRoutes from './routes/generate';
import applyRoutes from './routes/apply';

const server = Fastify({ logger: true });

server.register(cors, { origin: true });

// Register routes
server.register(extractRoutes, { prefix: '/api' });
server.register(generateRoutes, { prefix: '/api' });
server.register(applyRoutes, { prefix: '/api' });

// Health / root route
server.get('/', async (_request, reply) => {
  return { status: 'ok', service: 'fasttrack-backend' };
});

const start = async () => {
  try {
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    await server.listen({ port, host: '127.0.0.1' });
    server.log.info(`Server listening on http://127.0.0.1:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
