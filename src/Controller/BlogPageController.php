<?php

namespace App\Controller;

use App\Repository\BlogRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

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

    #[Route('/search/{title}', name: 'search')]
    public function searchBlogByTitle(string $title): Response
    {
        $query = $title;
        $blogData = $this->blogRepository->getBlogByTitle($title);

        if (empty($blogData)) {
            return new Response(
                json_encode([
                    'error' => 'No matching blogs found',
                    'query' => $title,
                ])
            );
        }
        return new Response(
            json_encode(['query' => $title, 'data' => $blogData])
        );
    }

    #[Route('/', name: 'index')]
    public function index(): Response
    {
        $isAdmin = $this->security->isGranted('IS_AUTHENTICATED_FULLY');
        $blogs = $isAdmin
            ? $this->blogRepository->showAllPages()
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
