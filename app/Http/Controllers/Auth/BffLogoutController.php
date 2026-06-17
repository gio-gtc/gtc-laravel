<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\BffAuthSession;
use Illuminate\Http\Request;

class BffLogoutController extends Controller
{
    /**
     * Clear BFF session state (API token and cached user payload) and rotate the session.
     */
    public function destroy(Request $request)
    {
        BffAuthSession::clear($request);

        return redirect()->route('login');
    }
}
