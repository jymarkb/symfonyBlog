<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/dashboard', name: 'dashboard.')]
final class DashboardController extends AbstractController
{
    #[Route('/', name: 'index')]
    public function index(): Response
    {
        return $this->render('dashboard/pages/dashboard.html.twig');
    }

    #[Route('/pages', name: 'pages')]
    public function pages(): Response
    {
        return $this->render('dashboard/pages/pages.html.twig');
    }

    #[Route('/account', name: 'account')]
    public function account(): Response
    {
        return $this->render('dashboard/pages/account.html.twig');
    }

    #[Route('/inbox', name: 'inbox')]
    public function inbox(): Response
    {
        return $this->render('dashboard/pages/inbox.html.twig');
    }
}
