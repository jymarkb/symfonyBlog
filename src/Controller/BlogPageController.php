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

    #[Route('/test', name: 'test')]
    public function test(): Response
    {
        return $this->render('blog_page/index.html.twig', [
            'controller_name' => 'BlogPageController',
        ]);
    }

    #[Route('/search', name: 'search,')]
    public function searchBlogFilter(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);

        $searchData = $this->searchService->SearchBlogWithFilter($data);

        return new Response(json_encode($searchData));
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

    #[Route('/{slug}', name: 'pageView')]
    public function pageView(string $slug): Response
    {
        $blog = $this->blogRepository->findOneBy(['slug' => $slug]);
        return $this->render('blog/pageView.html.twig', [
            'blog' => $blog,
        ]);
    }
}
