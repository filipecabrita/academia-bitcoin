// src/pages/api/protected/profile.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
    const userPubkey = locals.userPubkey;

    return new Response(JSON.stringify({
        pubkey: userPubkey,
        message: "Dados do perfil do utilizador autenticado"
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

export const POST: APIRoute = async ({ request }) => {
    const body = await request.text();
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
    const hashHex = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    // Comparar com o tag payload do evento Nostr
    const payloadTag = eventData.tags.find(tag => tag[0] === 'payload');
    if (payloadTag && payloadTag[1] !== hashHex) {
        throw new Error('Payload hash mismatch');
    }
}