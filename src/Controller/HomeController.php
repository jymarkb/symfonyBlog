<?php

namespace App\Controller;

use App\Repository\BlogAnalyticsRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\BlogRepository;

#[Route('/', name: 'home.')]
final class HomeController extends AbstractController
{
    private BlogRepository $blogRepository;
    private BlogAnalyticsRepository $blogAnalyticsRepository;
    public function __construct(BlogRepository $blogRepository, BlogAnalyticsRepository $blogAnalyticsRepository)
    {
        $this->blogRepository = $blogRepository;
        $this->blogAnalyticsRepository = $blogAnalyticsRepository;
    }

    #[Route('/', name: 'index')]
    public function index(): Response
    {
        $blogData = $this->blogRepository->getLatestBlogPost();
        $featured = reset($blogData);
        $latest = array_slice($blogData, 1);
        $most = $this->blogAnalyticsRepository->getMostViewBlogPost();

        $data = [
            'featured' => $featured,
            'latest' => $latest,
            'most' => $most
        ];

        return $this->render('home/index.html.twig', [
            'featureData' => $data
        ]);
    }

    public function healthCheack(): Response
    {
        return new Response("OK");
    }
}
