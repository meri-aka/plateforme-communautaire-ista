<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index()
    {
        $reports = Report::with('reporter')
            ->latest()
            ->paginate(10);

        return response()->json($reports);
    }

    public function store(Request $request)
    {
        $request->validate([
            'reportable_id'   => 'required|integer',
            'reportable_type' => 'required|in:post,comment,user',
            'reason'          => 'required|in:spam,harassment,inappropriate,other',
        ]);

        $report = Report::create([
            'reporter_id'     => $request->user()->id,
            'reportable_id'   => $request->reportable_id,
            'reportable_type' => $request->reportable_type,
            'reason'          => $request->reason,
        ]);

        return response()->json($report, 201);
    }

    public function update(Request $request, Report $report)
    {
        $request->validate([
            'status' => 'required|in:pending,reviewed,dismissed',
        ]);

        $report->update(['status' => $request->status]);

        return response()->json($report);
    }
}