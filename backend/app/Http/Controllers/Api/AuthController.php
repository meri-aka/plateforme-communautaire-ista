<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'       => 'required|string|max:100',
            'email'      => 'required|email|unique:users',
            'password'   => 'required|string|min:8|confirmed',
            'role'       => 'sometimes|in:stagiaire,formateur',
            'filiere_id' => 'nullable|exists:filieres,id',
            'bio'        => 'nullable|string',
        ]);

        $user = User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'role'       => $request->role ?? 'stagiaire',
            'filiere_id' => $request->filiere_id ?: null,
            'bio'        => $request->bio,
            'last_seen'  => now(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user->load('filiere'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $user->update(['last_seen' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $user->load('filiere'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->update(['last_seen' => null]);
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('filiere');
        return response()->json(array_merge($user->toArray(), [
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
            'is_following'    => false,
        ]));
    }

    public function updateMe(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'bio'        => 'sometimes|nullable|string',
            'filiere_id' => 'sometimes|nullable|exists:filieres,id',
            'name'       => 'sometimes|string|max:100',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated.',
            'user'    => $user->fresh()->load('filiere'),
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $user = $request->user();

        // Delete old avatar file if it exists and is locally stored
        if ($user->avatar && str_starts_with($user->avatar, 'avatars/')) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return response()->json([
            'message'    => 'Avatar updated.',
            'avatar_url' => Storage::disk('public')->url($path),
            'user'       => $user->fresh()->load('filiere'),
        ]);
    }
}