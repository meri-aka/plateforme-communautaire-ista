<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // GET /api/admin/users
    public function index(Request $request)
    {
        $query = User::with('filiere');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        return response()->json($query->latest()->paginate(20));
    }

    // GET /api/admin/users/{user}
    public function show(User $user)
    {
        return response()->json($user->load('filiere'));
    }

    // PATCH /api/admin/users/{user}
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'       => 'sometimes|string|max:100',
            'email'      => 'sometimes|email|unique:users,email,' . $user->id,
            'role'       => 'sometimes|in:stagiaire,formateur,admin',
            'bio'        => 'sometimes|nullable|string',
            'filiere_id' => 'sometimes|nullable|exists:filieres,id',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated.',
            'user'    => $user->fresh()->load('filiere'),
        ]);
    }

    // DELETE /api/admin/users/{user}
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}