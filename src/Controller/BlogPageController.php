<?php

namespace App\Controller;

use App\Repository\BlogRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use App\Service\SearchService;

#[Route('/blog', name: 'blog.')]
final class BlogPageController extends AbstractController
{
    private BlogRepository $blogRepository;
    private Security $security;
    private SearchService $searchService;
    public function __construct(
        BlogRepository $blogRepository,
        Security $security,
        SearchService $searchService
    ) {
        $this->blogRepository = $blogRepository;
        $this->security = $security;
        $this->searchService = $searchService;
    }

    #[Route('/', name: 'index')]
    public function index(): Response
    {
        $blogs = $this->blogRepository->showPageByStatusId();

        return $this->render('blog/blog.post.html.twig', [
            'blogs' => $blogs,
        ]);
    }

    #[Route('/search', name: 'search,')]
    public function searchBlogFilter(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);

        $searchData = $this->searchService->SearchBlogWithFilter($data);

        return new Response(json_encode($searchData));
    }

    #[Route('/{slug}', name: 'view')]
    public function view(string $slug): Response
    {
        $blog = $this->blogRepository->findOneBy(['slug' => $slug]);
        return $this->render('blog/page.view.html.twig', [
            'blog' => $blog,
        ]);
    }
}
