<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class FooterController extends AbstractController
{
    #[Route('/facebook', name: 'facebook')]
    public function facebook(): Response
    {
        return $this->redirect('https://www.facebook.com/mackyhoho');
    }

    #[Route('/github', name: 'github')]
    public function github(): Response
    {
        return $this->redirect('https://github.com/jymarkb/symfonyBlog');
    }

    #[Route('/email', name: 'email')]
    public function email(): RedirectResponse
    {
        return new RedirectResponse('mailto:someone@example.com');
    }

    #[Route('/linkedin', name: 'linkedin')]
    public function linkedin(): Response
    {
        return $this->redirect('https://www.linkedin.com/in/jaymark-borja/');
    }
}
