// src/pages/api/protected.ts
import type { APIRoute } from 'astro';
import { verifyEvent, type Event } from 'nostr-tools';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Extrair o token do header Authorization
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Nostr ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Decodificar o evento base64
    const base64Event = authHeader.replace('Nostr ', '');
    const eventData = JSON.parse(atob(base64Event)) as Event;

    // Validar o evento Nostr
    if (eventData.kind !== 27235) {
      throw new Error('Invalid event kind');
    }

    // Verificar timestamp (60 segundos de tolerância)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - eventData.created_at) > 60) {
      throw new Error('Event expired');
    }

    // Verificar URL no tag 'u'
    const urlTag = eventData.tags.find(tag => tag[0] === 'u');
    if (!urlTag || urlTag[1] !== request.url) {
      throw new Error('URL mismatch');
    }

    // Verificar método HTTP no tag 'method'
    const methodTag = eventData.tags.find(tag => tag[0] === 'method');
    if (!methodTag || methodTag[1] !== request.method) {
      throw new Error('Method mismatch');
    }

    // Verificar assinatura do evento
    const isValid = verifyEvent(eventData);
    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Autenticação bem-sucedida
    const userPubkey = eventData.pubkey;
    
    return new Response(JSON.stringify({ 
      success: true, 
      pubkey: userPubkey,
      data: "Seus dados protegidos aqui"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: 'Authentication failed',
      details: error.message 
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
}
