<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->fill($validated);

        // If the request uses split first/last name, keep "name" in sync
        // (the rest of the UI expects auth.user.name to exist).
        if (
            array_key_exists('first_name', $validated) ||
            array_key_exists('last_name', $validated)
        ) {
            $first = trim((string) ($validated['first_name'] ?? $user->first_name ?? ''));
            $last = trim((string) ($validated['last_name'] ?? $user->last_name ?? ''));
            $fullName = trim("{$first} {$last}");

            if ($fullName !== '') {
                $user->name = $fullName;
            }
        }

        if (array_key_exists('out_of_office', $validated) && ! $validated['out_of_office']) {
            $user->out_of_office_start_date = null;
            $user->out_of_office_end_date = null;
        }

        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');

            if ($photo) {
                if ($user->profile_photo_path) {
                    Storage::disk('public')->delete($user->profile_photo_path);
                }

                $user->profile_photo_path = $photo->storePublicly('avatars', 'public');
            }
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return back();
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
