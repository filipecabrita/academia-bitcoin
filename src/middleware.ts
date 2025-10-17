// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET;

export const onRequest = defineMiddleware(async ({ request, cookies, locals, url }, next) => {
  // Apenas validar em rotas /api/protected/*
  if (url.pathname.startsWith('/api/protected/')) {
    const token = cookies.get('nostr_session')?.value;

    if (!token) {
      return new Response(JSON.stringify({ error: 'No session' }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { pubkey: string };
      locals.userPubkey = decoded.pubkey; // Disponível em todos os endpoints
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  return next();
});
