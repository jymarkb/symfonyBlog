<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return TagResource::collection(Tag::query()->orderBy('name')->paginate(100));
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->has('name') && ! $request->filled('slug')) {
            $request->merge([
                'slug' => Str::slug((string) $request->input('name')),
            ]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:tags,slug'],
        ]);

        $tag = Tag::query()->create([
            'name' => $data['name'],
            'slug' => $data['slug'],
        ]);

        return (new TagResource($tag))->response()->setStatusCode(201);
    }

    public function update(Request $request, Tag $tag): TagResource
    {
        if ($request->has('slug') && ! $request->filled('slug')) {
            $request->merge([
                'slug' => Str::slug((string) $request->input('name', $tag->name)),
            ]);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('tags', 'slug')->ignore($tag->id)],
        ]);

        if (array_key_exists('name', $data)) {
            $tag->name = $data['name'];
        }

        if (array_key_exists('slug', $data)) {
            $tag->slug = $data['slug'];
        }

        $tag->save();

        return new TagResource($tag);
    }

    public function destroy(Tag $tag): JsonResponse
    {
        $tag->delete();

        return response()->json([], 204);
    }
}
