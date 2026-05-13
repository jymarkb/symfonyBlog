<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use App\Services\Admin\TagService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    public function __construct(private readonly TagService $tags) {}

    public function index(): AnonymousResourceCollection
    {
        return TagResource::collection($this->tags->list());
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

        $tag = $this->tags->create($data);

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

        return new TagResource($this->tags->update($tag, $data));
    }

    public function destroy(Tag $tag): JsonResponse
    {
        $this->tags->delete($tag);

        return response()->json([], 204);
    }
}
