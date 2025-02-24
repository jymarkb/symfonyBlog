<?php

namespace App\Controller;

use App\Entity\Account;
use App\Form\SignupCustomType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

class SecurityController extends AbstractController
{
    private EntityManagerInterface $em;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher)
    {
        $this->em = $em;
        $this->passwordHasher = $passwordHasher;
    }

    #[Route(path: '/login', name: 'login')]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('account/login.html.twig', ['last_username' => $lastUsername, 'error' => $error]);
    }

    #[Route('/signup', name: 'signup')]
    public function signup(Request $request): Response
    {
        $account = new Account();
        $form = $this->createForm(SignupCustomType::class, $account);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {

            $data = $form->getData();
            // dd($data);
            $account = new Account();
            $account->setFirstName($data->getFirstName());
            $account->setLastname($data->getLastName());
            $account->setEmail($data->getEmail());

            $hashedPassword = $this->passwordHasher->hashPassword($account, $data->getPassword());
            $account->setPassword($hashedPassword);

            $account->setCreatedAt(new \DateTimeImmutable('now'));
            $account->setUpdatedAt(new \DateTimeImmutable('now'));

            $this->em->persist($account);
            $this->em->flush();

            return $this->redirect($this->generateUrl('login'));
        }

        return $this->render('account/register.html.twig', [
            'form' => $form->createView()
        ]);
    }

    #[Route('/forgot-password', name: 'forgot-password')]
    public function forgotPassword(): Response
    {
        return $this->render('account/forgotPassword.html.twig', [
            'controller_name' => 'ForgotPasswordController',
        ]);
    }


    #[Route(path: '/logout', name: 'logout')]
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}
