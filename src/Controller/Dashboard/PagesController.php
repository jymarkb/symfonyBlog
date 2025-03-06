<?php

namespace App\Controller\Dashboard;

use App\Entity\Blog;
use App\Form\CreateNewPageType;
use App\Repository\BlogRepository;
use App\Service\PagesService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/dashboard', name: 'dashboard.')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
final class PagesController extends AbstractController
{
    private BlogRepository $blogRepository;
    private PagesService $pagesService;

    public function __construct(
        BlogRepository $blogRepository,
        PagesService $pagesService
    ) {
        $this->blogRepository = $blogRepository;
        $this->pagesService = $pagesService;
    }

    #[Route('/pages', name: 'pages')]
    public function pages(): Response
    {
        $blogs = $this->blogRepository->findAll();
        // $blogData = $this->serializer->serialize($blogs, 'json', ['groups' => 'blog:read']);
        return $this->render('dashboard/pages/pages.html.twig', [
            'blogs' => $blogs,
        ]);
    }

    #[Route('/pages/create', name: 'pages.create')]
    public function pageCreate(Request $request): Response
    {
        $blog = new Blog();
        $form = $this->createForm(CreateNewPageType::class, $blog);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $status = $request->get('status', null);
            $file = $request->files->get('create_new_page')['htmlThumbnail'] ?? null;

            $data = [
                'formData' => $form->getData(),
                'status' => $status,
                'file' => $file,
            ];

            try {
                if ($this->pagesService->CreatePage($data, $blog)) {
                    $this->addFlash('success', 'Page created successfully!');
                    return $this->redirectToRoute('dashboard.pages');
                }

                $this->addFlash('error', 'Failed to create the page.');
            } catch (\Throwable $e) {
                $this->addFlash('error', 'Error: ' . $e->getMessage());
            }
        }

        return $this->render('dashboard/component/form.blog.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    #[Route('/pages/preview', name: 'pages.preview')]
    public function pagePreview(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return new Response('Invalid JSON data', Response::HTTP_BAD_REQUEST);
        }

        // dump($data); die;
        return $this->render('dashboard/component/preview.blog.html.twig', [
            'data' => $data,
        ]);
    }
}
