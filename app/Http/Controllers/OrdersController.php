<?php

namespace App\Http\Controllers;

use App\Support\DemoCatalog;
use Inertia\Inertia;
use Inertia\Response;

class OrdersController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('orders', DemoCatalog::forOrders());
    }
}
