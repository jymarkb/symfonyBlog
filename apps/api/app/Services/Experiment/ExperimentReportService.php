<?php
namespace App\Services\Experiment;

use Illuminate\Support\Facades\Storage;

class ExperimentReportService
{
    public function report(string $experiment): array
    {
        $path = 'logs/experiments.log';

        if (!Storage::disk('local')->exists($path)) {
            return [];
        }

        $contents = Storage::disk('local')->get($path);
        $lines = array_filter(explode("\n", trim($contents)));

        $counts = []; // ['modal' => ['triggered' => 0, 'converted' => 0, 'dismissed' => 0]]

        foreach ($lines as $line) {
            $entry = json_decode($line, true);
            if (!is_array($entry)) continue;
            if (($entry['experiment'] ?? '') !== $experiment) continue;

            $variant = $entry['variant'] ?? 'unknown';
            $event   = $entry['event']   ?? 'unknown';

            if (!isset($counts[$variant])) {
                $counts[$variant] = ['triggered' => 0, 'converted' => 0, 'dismissed' => 0];
            }
            if (isset($counts[$variant][$event])) {
                $counts[$variant][$event]++;
            }
        }

        $result = [];
        foreach ($counts as $variant => $events) {
            $triggered = $events['triggered'];
            $converted = $events['converted'];
            $result[] = [
                'variant'         => $variant,
                'triggered'       => $triggered,
                'converted'       => $converted,
                'dismissed'       => $events['dismissed'],
                'conversion_rate' => $triggered > 0 ? round($converted / $triggered * 100, 1) : 0.0,
            ];
        }

        return $result;
    }
}
