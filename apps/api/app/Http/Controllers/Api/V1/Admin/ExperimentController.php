<?php
namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExperimentReportResource;
use App\Services\Experiment\ExperimentReportService;
use Illuminate\Http\Request;

class ExperimentController extends Controller
{
    public function __construct(private ExperimentReportService $reportService) {}

    public function index(Request $request)
    {
        $experiment = $request->query('experiment', 'auth_gate');
        $rows = $this->reportService->report($experiment);
        return ExperimentReportResource::collection(collect($rows));
    }
}
