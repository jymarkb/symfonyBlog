<?php

namespace App\Controller\Dashboard;

use App\Entity\Account;
use App\Entity\Blog;
use App\Entity\Category;
use App\Form\CreateNewPageType;
use App\Repository\BlogRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/dashboard', name: 'dashboard.')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
final class PagesController extends AbstractController
{
    private BlogRepository $blogRepository;
    private SerializerInterface $serializer;
    private CreateNewPageType $createPages;
    private Security $security;
    private EntityManagerInterface $em;
    private SluggerInterface $slugger;

    public function __construct(
        BlogRepository $blogRepository,
        SerializerInterface $serializer,
        CreateNewPageType $createPages,
        Security $security,
        EntityManagerInterface $em,
        SluggerInterface $slugger,
    ) {
        $this->blogRepository = $blogRepository;
        $this->serializer = $serializer;
        $this->createPages = $createPages;
        $this->security = $security;
        $this->em = $em;
        $this->slugger = $slugger;
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
            $status = $request->get('status');
            $blog = new Blog();
            $data = $form->getData();
            $category = $data->getCategory();
            $account = $this->security->getUser();

            $blog->setTitle($data->getTitle());
            $blog->setStatus($status);
            $blog->setAccount($account);
            $blog->setCategory($category);
            $blog->setCreatedAt(new \DateTimeImmutable('now'));
            $blog->setUpdatedAt(new \DateTimeImmutable('now'));
            $blog->generateSlug($this->slugger);

            $this->em->persist($blog);
            $this->em->flush();

            return $this->redirect($this->generateUrl('dashboard.pages'));
        }

        return $this->render('dashboard/forms/form.blog.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
