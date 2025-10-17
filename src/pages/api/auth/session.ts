// src/pages/api/auth/session.ts
import type { APIRoute } from 'astro';
import { verifyEvent, type Event } from 'nostr-tools';
import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const event: Event = body.event;

    // Validar evento Nostr (similar ao código anterior)
    if (!verifyEvent(event) || event.kind !== 27235) {
      throw new Error('Invalid Nostr event');
    }

    // Criar JWT com o pubkey do utilizador
    const token = jwt.sign(
      { pubkey: event.pubkey },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Guardar em cookie httpOnly
    cookies.set('nostr_session', token, {
      httpOnly: true,
      secure: import.meta.env.PROD, // Only secure in production
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/'
    });

    return new Response(JSON.stringify({ 
      success: true,
      token 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
}
