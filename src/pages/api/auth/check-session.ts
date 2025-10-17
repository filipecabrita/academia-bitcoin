import type { APIRoute } from 'astro';
import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET as string;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const token = cookies.get('nostr_session');
    if (!token) {
      return new Response(JSON.stringify({ authenticated: false }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Valida o JWT
    const decoded = jwt.verify(token.value, JWT_SECRET) as { pubkey: string, exp?: number };

    return new Response(JSON.stringify({
      authenticated: true,
      pubkey: decoded.pubkey,
      expires: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (e: any) {
    return new Response(JSON.stringify({
      authenticated: false,
      error: e.message || "Sessão inválida"
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
};