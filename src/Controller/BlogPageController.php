<?php

namespace App\Controller;

use App\Entity\Blog;
use App\Repository\BlogRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/blog', name: 'blog.')]
final class BlogPageController extends AbstractController
{
    private BlogRepository $blogRepository;
    public function __construct(BlogRepository $blogRepository)
    {
        $this->blogRepository = $blogRepository;
    }


    #[Route('/test', name: 'test')]
    public function test(): Response
    {
        return $this->render('blog_page/index.html.twig', [
            'controller_name' => 'BlogPageController',
        ]);
    }

    #[Route('/', name: 'index')]
    public function index(): Response
    {
        return $this->render('blog/index.html.twig');
    }

    #[Route('/{slug}', name: 'blog.pageView')]
    public function pageView(string $slug): Response
    {
        $blog = $this->blogRepository->findOneBy(array('slug' => $slug));
        return $this->render('blog/pageView.html.twig', [
            'blog' => $blog
        ]);
    }
}
