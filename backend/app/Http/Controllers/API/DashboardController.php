<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard summary statistics.
     */
    public function summary(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [],
        ]);
    }
}
