<?php

namespace App\Services\Experiment;

use Illuminate\Support\Facades\Storage;

class ExperimentLogger
{
    public function log(string $experiment, string $variant, string $event, ?int $userId): void
    {
        Storage::disk('local')->append('logs/experiments.log', json_encode([
            'experiment' => $experiment,
            'variant'    => $variant,
            'event'      => $event,
            'user_id'    => $userId,
            'timestamp'  => now()->toISOString(),
        ]));
    }
}
