<?php

namespace App\Http\Controllers;

use App\Support\DemoCatalog;
use Inertia\Inertia;
use Inertia\Response;

class InvoicesController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('invoices', DemoCatalog::forInvoices());
    }
}
