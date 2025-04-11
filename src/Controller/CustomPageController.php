<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class CustomPageController extends AbstractController
{
    #[Route('/about', name: 'about.index')]
    public function about(): Response
    {
        return $this->render('about/index.html.twig');
    }
    
    #[Route('/contact', name: 'contact.index')]
    public function contact(): Response
    {
        return $this->render('contact/index.html.twig');
    }
}
