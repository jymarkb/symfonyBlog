<?php

namespace App\Controller;

use App\Entity\Account;
use App\Form\SignupCustomType;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;


#[Route('/signup', name: 'signup.')]
final class RegistrationController extends AbstractController
{
    private EntityManagerInterface $em;
    private UserPasswordHasherInterface $passwordHasher;
    public function __construct(EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher)
    {
        $this->em = $em;
        $this->passwordHasher = $passwordHasher;
    }

    #[Route('/', name: 'index')]
    public function index(Request $request): Response
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

    public function createAccount() {}
}
