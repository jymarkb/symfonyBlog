<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/dashboard', name: 'dashboard.')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
final class DashboardController extends AbstractController
{
    #[Route('/', name: 'index')]
    public function index(): Response
    {
        return $this->render('dashboard/pages/dashboard.html.twig');
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
