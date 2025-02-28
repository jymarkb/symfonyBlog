<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\BlogRepository;

#[Route('/', name: 'home.')]
final class HomeController extends AbstractController
{
    private BlogRepository $blogRepository;
    public function __construct(BlogRepository $blogRepository){
        $this->blogRepository = $blogRepository;
    }

    #[Route('/', name: 'index')]
    public function index(): Response
    {
        $data = $this->blogRepository->getLatestBlogPost();
        return $this->render('home/index.html.twig', [
            'data' => $data
        ]);
    }
}
