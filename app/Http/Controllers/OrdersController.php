<?php

namespace App\Http\Controllers;

use App\Support\OrdersAssembler;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrdersController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('orders', OrdersAssembler::forIndex($request));
    }
}
