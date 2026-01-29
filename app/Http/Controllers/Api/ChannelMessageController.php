<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChannelMessageController extends Controller
{
    /**
     * Update a message (edit). Only the sender can edit.
     */
    public function update(Request $request, string $channelId, string $id): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $content = $request->input('content');
        if ($content === null) {
            return response()->json(['message' => 'Content is required.'], 422);
        }

        $message = $this->fetchMessage($channelId, $id);
        if (! $message) {
            return response()->json(['message' => 'Message not found.'], 404);
        }

        $senderId = (int) $message['sender_id'];
        if ($senderId !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $url = config('services.supabase.url').'/rest/v1/messages?id=eq.'.$id;
        $response = Http::withHeaders($this->supabaseHeaders())
            ->patch($url, [
                'content' => $content,
                'status' => 'edited',
            ]);

        if (! $response->successful()) {
            return response()->json(
                ['message' => 'Failed to update message.'],
                $response->status()
            );
        }

        return response()->json(['message' => 'Message updated.']);
    }

    /**
     * Soft-delete a message. Only the sender can delete.
     */
    public function destroy(Request $request, string $channelId, string $id): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $message = $this->fetchMessage($channelId, $id);
        if (! $message) {
            return response()->json(['message' => 'Message not found.'], 404);
        }

        $senderId = (int) $message['sender_id'];
        if ($senderId !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $url = config('services.supabase.url').'/rest/v1/messages?id=eq.'.$id;
        $response = Http::withHeaders($this->supabaseHeaders())
            ->patch($url, [
                'status' => 'deleted',
            ]);

        if (! $response->successful()) {
            return response()->json(
                ['message' => 'Failed to delete message.'],
                $response->status()
            );
        }

        return response()->json(['message' => 'Message deleted.']);
    }

    private function fetchMessage(string $channelId, string $id): ?array
    {
        $url = config('services.supabase.url').'/rest/v1/messages?id=eq.'.$id.'&channel_id=eq.'.urlencode($channelId).'&select=sender_id';
        $response = Http::withHeaders($this->supabaseHeaders())
            ->get($url);

        if (! $response->successful()) {
            return null;
        }

        $data = $response->json();
        if (! is_array($data) || count($data) === 0) {
            return null;
        }

        return $data[0];
    }

    private function supabaseHeaders(): array
    {
        $key = config('services.supabase.secret_key');
        if (! $key) {
            abort(500, 'Supabase secret key not configured (SUPABASE_SECRET_KEY).');
        }

        $headers = [
            'apikey' => $key,
            'Content-Type' => 'application/json',
            'Prefer' => 'return=minimal',
        ];

        // New secret keys (sb_secret_...) are not JWTs; use only apikey header.
        if (! str_starts_with($key, 'sb_secret_')) {
            $headers['Authorization'] = 'Bearer '.$key;
        }

        return $headers;
    }
}
