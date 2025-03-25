<?php

namespace App\Form;

use App\Entity\Account;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Validator\Constraints\UserPassword;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

class UpdatePasswordType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
        ->add('oldPassword', PasswordType::class, [
            'label' => 'Current Password',
            'mapped' => false,
            'required' => true,
            'constraints' => [
                new UserPassword(['message' => 'Invalid Current Password']),
            ],
            'label_attr' => ['class' => 'text-xs text-gray-500'], 
        ])
        ->add('newPassword', PasswordType::class, [
            'label' => 'New Password',
            'mapped' => false,
            'required' => true,
            'constraints' => [
                new Assert\NotBlank(['message' => 'New password is required']),
                new Assert\Length([
                    'min' => 6,
                    'minMessage' => 'Your password must be at least {{ limit }} characters',
                ]),
            ],
            'label_attr' => ['class' => 'text-xs text-gray-500'],
        ]);

        $builder->addEventListener(FormEvents::POST_SUBMIT, function (FormEvent $event) {
            $form = $event->getForm();
            $session = $form->getConfig()->getOption('session');
    
            if (!$form->isValid()) {
                foreach ($form->getErrors(true, true) as $error) {
                    $session->getFlashBag()->add('error', [
                        'title' => 'Password Error:',
                        'message' => $error->getMessage()
                    ]);
                }
            }
        });
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Account::class,
            'session' => null
        ]);
    }
}
