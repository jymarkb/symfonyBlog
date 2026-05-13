<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExperimentReportResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'variant'         => $this->resource['variant'],
            'triggered'       => $this->resource['triggered'],
            'converted'       => $this->resource['converted'],
            'dismissed'       => $this->resource['dismissed'],
            'conversion_rate' => $this->resource['conversion_rate'],
        ];
    }
}
