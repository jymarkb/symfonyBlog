<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;


#[Route('/signup', name: 'signup.')]
final class RegistrationController extends AbstractController
{

    public function index(): Response
    {
        return $this->render('account/register.html.twig', [
            'controller_name' => 'RegistrationController',
        ]);
    }
}
