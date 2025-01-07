import { parse } from 'url';
import next from 'next';
import { createServer } from 'http';
import { Server as HocuspocusServer } from '@hocuspocus/server';

const port = 3000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, experimentalHttpsServer: true });
const nextHandler = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        nextHandler(req, res, parsedUrl);
    });

    const hocuspocusServer = HocuspocusServer.configure({
        port: 3001,
        name: 'hocuspocus-next',
        onRequest: async ({ request, response }) => {
            if (request.headers.accept && request.headers.accept.includes('text/html')) {
                response.writeHead(301, { Location: `http://localhost:${port}${request.url}` });
                response.end();
                return;
            }
            return Promise.reject();
        },

        onUpgrade: async ({ request, socket, head }) => {
            if (request.url?.startsWith('/_next/webpack-hmr')) {
                // Handle WebSocket upgrade for Next.js HMR
                nextApp.getServer().emit('upgrade', request, socket, head);
                throw null;
            }
        },

        onConnect: async () => {
            console.log('🔮 Hocuspocus Client Connected');
        }
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });

    hocuspocusServer.listen();
}).catch(err => {
    console.error('Error during nextApp.prepare():', err);
});