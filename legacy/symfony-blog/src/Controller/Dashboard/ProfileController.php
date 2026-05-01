<?php

namespace App\Controller\Dashboard;

use App\Form\UpdatePasswordType;
use App\Service\Account\UpdatePasswordService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\HttpFoundation\Request;

#[Route('/dashboard', name: 'dashboard.')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
final class ProfileController extends AbstractController
{
    private UpdatePasswordService $updatePasswordService;
    public function __construct(UpdatePasswordService $updatePasswordService)
    {
        $this->updatePasswordService = $updatePasswordService;
    }

    #[Route('/profile/overview', name: 'profile.overview')]
    public function index(): Response
    {
        return $this->render('dashboard/pages/profile.html.twig');
    }

    #[Route('/profile/my-profile', name: 'profile.myprofile')]
    public function myprofile(): Response
    {
        $user = $this->getUser();
        return $this->render('dashboard/component/profile/myprofile.html.twig', [
            'user' => $user
        ]);
    }

    #[Route('/profile/security', name: 'profile.security')]
    public function security(Request $request): Response
    {

        $user = $this->getUser();
        $form = $this->createForm(UpdatePasswordType::class, $user, [
            'session' => $request->getSession(),
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                $updatePassword = $this->updatePasswordService->UpdatePassword($form);
                if ($updatePassword) {
                    $this->addFlash('success', [
                        'title' => 'Password Success:',
                        'message' => 'Password has been updated.'
                    ]);
                    return $this->redirectToRoute('dashboard.profile.security');
                }
            } catch (\Throwable $th) {
                $this->addFlash('errr', [
                    'title' => 'System Error:',
                    'message' => $th
                ]);
                return $this->redirectToRoute('dashboard.profile.security');
            }
        }

        $user = $this->getUser();
        return $this->render('dashboard/component/profile/security.html.twig', [
            'form' => $form->createView(),
            'user' => $user
        ]);
    }

    #[Route('/profile/delete', name: 'profile.delete')]
    public function delete(): Response
    {
        return $this->render('dashboard/pages/profile.html.twig');
    }
}
