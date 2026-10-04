import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();
app.use('/api/auth', authRoutes);

function listRoutes(stack, basePath = '') {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`${methods} ${basePath}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      listRoutes(layer.handle.stack, basePath + (layer.regexp.source.replace(/\\/g, '').replace(/\^/g, '').replace(/\?/g, '').replace(/\([^)]*\)/g, '')));
    }
  });
}

console.log('Registered Auth Routes:');
listRoutes(authRoutes.stack, '/api/auth');