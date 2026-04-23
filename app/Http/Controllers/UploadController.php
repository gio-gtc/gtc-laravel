<?php

namespace App\Http\Controllers;

use App\Support\ItemCatalogGuard;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:20480'],
            'scope' => ['nullable', 'string', 'max:128'],
        ]);

        $scope = $request->input('scope');
        if (! is_string($scope) || $scope === '') {
            $scope = 'session:'.$request->session()->getId();
        }

        /** @var UploadedFile $file */
        $file = $request->file('file');

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        $uuid = (string) Str::uuid();
        $path = $file->storeAs(
            'forms/'.$uuid,
            Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension(),
            'public',
        );

        ItemCatalogGuard::rememberUploadedPath($scope, $path);

        return response()->json([
            'path' => $path,
            'url' => $disk->url($path),
            'size' => $file->getSize(),
            'mime' => $file->getMimeType(),
            'name' => $file->getClientOriginalName(),
        ]);
    }
}
