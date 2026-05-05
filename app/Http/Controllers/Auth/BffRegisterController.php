<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;

class BffRegisterController extends Controller
{
    public function create()
    {
        return redirect()->route('login');
    }
}
