<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $request->validate([
            'key'   => 'required|string',
            'value' => 'nullable|string',
        ]);

        Setting::set($request->key, $request->value);

        return response()->json(['message' => 'Setting updated.']);
    }
}
