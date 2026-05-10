<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Services\Tag\TagService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TagController extends Controller
{
    public function __construct(private TagService $tagService)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return TagResource::collection(
            $this->tagService->listAll(),
        );
    }
}
