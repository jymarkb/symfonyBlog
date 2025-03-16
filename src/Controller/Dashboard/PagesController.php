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
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\CategoryRepository;

#[Route('/dashboard', name: 'dashboard.')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
final class PagesController extends AbstractController
{
    private BlogRepository $blogRepository;
    private PagesService $pagesService;
    private EntityManagerInterface $em;
    private CategoryRepository $categoryRepository;

    public function __construct(
        BlogRepository $blogRepository,
        PagesService $pagesService,
        EntityManagerInterface $em,
        CategoryRepository $categoryRepository
    ) {
        $this->blogRepository = $blogRepository;
        $this->pagesService = $pagesService;
        $this->em = $em;
        $this->categoryRepository = $categoryRepository;
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
        $form = $this->createForm(CreateNewPageType::class, $blog, [
            'isEditPage' => false,
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $data = $this->formatData($form, $request);
                if ($this->pagesService->CreatePage($data, $blog)) {
                    $this->addFlash('success', [
                        'title' => 'Create Page:',
                        'message' =>  'Page created successfully!'
                    ]);
                    return $this->redirectToRoute('dashboard.pages');
                }

                $this->addFlash('error', [
                    'title' => 'Create Page:',
                    'message' => 'Failed to create the page.'
                ]);
            } catch (\Throwable $e) {
                $this->addFlash('error', [
                    'title' => 'Error:',
                    'message' => $e->getMessage()
                ]);
            }
        }

        return $this->render('dashboard/component/form.blog.html.twig', [
            'form' => $form->createView(),
            'titleForm' => 'Create New Blog Page',
            'submitPath' => 'dashboard.pages.create',
        ]);
    }

    #[Route('/pages/preview', name: 'pages.preview')]
    public function pagePreview(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        $category = $this->categoryRepository->find($data['category']);
        if (!$data) {
            return new Response(
                'Invalid JSON data',
                Response::HTTP_BAD_REQUEST
            );
        }

        return $this->render('dashboard/component/preview.blog.html.twig', [
            'data' => $data,
            'category' => $category,
        ]);
    }

    #[Route('/pages/delete/{id}', name: 'pages.delete')]
    public function deletePage(int $id): Response
    {
        $blog = $this->blogRepository->find($id);
        $this->em->remove($blog);
        $this->em->flush();
        $this->addFlash('success', [
            'title' => 'Delete Page:',
            'message' => 'The blog has been deleted.'
        ]);
        return new Response(json_encode(['success' => true]), 200);
    }

    #[Route('/pages/edit/{slug}', name: 'pages.edit')]
    public function editPage(string $slug, Request $request): Response
    {
        $blog = $this->blogRepository->findOneBy(['slug' => $slug]);

        if (!$blog) {
            throw $this->createNotFoundException('Page not found');
        }

        $form = $this->createForm(CreateNewPageType::class, $blog, [
            'isEditPage' => true,
        ]);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $data = $this->formatData($form, $request);
                $updateData = $this->pagesService->editPage($data);
                if ($updateData) {
                    $this->addFlash('success', [
                        'title' => 'Update Page:',
                        'message' =>  'Page successfully updated!'
                    ]);
                    return $this->redirectToRoute('dashboard.pages');
                }

                $this->addFlash('error', [
                    'title' => 'Update Page:',
                    'message' => 'Failed to update the page.'
                ]);
            } catch (\Throwable $e) {
                $this->addFlash('error', [
                    'title' => 'Error:',
                    'message' => $e->getMessage()
                ]);
            }
        }

        return $this->render('dashboard/component/form.blog.html.twig', [
            'form' => $form->createView(),
            'titleForm' => 'Edit Blog Page',
            'existingThumbnail' => $blog->getHtmlThumbnail()
                ? '/img/blog/thumbnails/' . $blog->getHtmlThumbnail()
                : null,
            'submitPath' => 'dashboard.pages.edit',
            'slug' => $slug,
        ]);
    }

    private function formatData($form, $request): array
    {
        $status = $request->get('status', null);
        $file =
            $request->files->get('create_new_page')['htmlThumbnail'] ?? null;

        $data = [
            'formData' => $form->getData(),
            'status' => $status,
            'file' => $file,
        ];

        return $data;
    }
}
