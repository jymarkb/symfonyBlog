<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/forgot-password', name: 'forgot-password.')]
final class ForgotPasswordController extends AbstractController
{
    #[Route('/', name: 'index')]
    public function index(): Response
    {
        return $this->render('account/forgotPassword.html.twig', [
            'controller_name' => 'ForgotPasswordController',
        ]);
    }
}
