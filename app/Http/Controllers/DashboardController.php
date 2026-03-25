<?php

namespace App\Http\Controllers;

use App\Support\DemoCatalog;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('dashboard', DemoCatalog::forDashboard());
    }
}
