<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\TrackExperimentRequest;
use App\Services\Experiment\ExperimentLogger;
use Illuminate\Http\JsonResponse;

class ExperimentTrackController extends Controller
{
    public function __construct(private ExperimentLogger $logger)
    {
    }

    public function store(TrackExperimentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $this->logger->log(
            $validated['experiment'],
            $validated['variant'],
            $validated['event'],
            $request->user()?->id,
        );

        return response()->json([], 202);
    }
}
