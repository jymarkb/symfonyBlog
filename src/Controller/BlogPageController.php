<?php

namespace App\Controller;

use App\Entity\Blog;
use App\Repository\BlogRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/blog', name: 'blog.')]
final class BlogPageController extends AbstractController
{
    private BlogRepository $blogRepository;
    private Security $security;
    public function __construct(
        BlogRepository $blogRepository,
        Security $security
    ) {
        $this->blogRepository = $blogRepository;
        $this->security = $security;
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
        $isAdmin = $this->security->isGranted('IS_AUTHENTICATED_FULLY');
        $blogs = $isAdmin
            ? $this->blogRepository->findAll()
            : $this->blogRepository->showPageByStatusId();

        return $this->render('blog/index.html.twig', [
            'blogs' => $blogs,
        ]);
    }

    #[Route('/{slug}', name: 'blog.pageView')]
    public function pageView(string $slug): Response
    {
        $blog = $this->blogRepository->findOneBy(['slug' => $slug]);
        return $this->render('blog/pageView.html.twig', [
            'blog' => $blog,
        ]);
    }
}
