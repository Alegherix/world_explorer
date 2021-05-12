// Deno server used for hosting socket server for multiPlayer world

import { serve } from 'https://deno.land/std@0.95.0/http/server.ts';
import {
  acceptWebSocket,
  acceptable,
} from 'https://deno.land/std@0.95.0/ws/mod.ts';
import { worldConnection } from './worldConnection.ts';

const port = 8000;
const server = serve({ port });
console.log(`Starting socket server at: http://localhost:${port}`);

while (true) {
  try {
    for await (const req of server) {
      if (req.url === '/ws' && acceptable(req)) {
        acceptWebSocket({
          conn: req.conn,
          bufReader: req.r,
          bufWriter: req.w,
          headers: req.headers,
        }).then(worldConnection);
      }
    }
  } catch (error) {
    console.log('Error :<');
    console.log(error);
  }
}
