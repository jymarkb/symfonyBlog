<?php

namespace App\Form;

use App\Entity\Account;
use App\Entity\Blog;
use App\Entity\Category;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ButtonType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\File;

class CreateNewPageType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('title', TextType::class, [
                'required' => true,
            ])
            ->add('status', HiddenType::class, [
                'mapped' => false
            ])
            // ->add('created_at', null, [
            //     'widget' => 'single_text',
            // ])
            // ->add('updated_at', null, [
            //     'widget' => 'single_text',
            // ])
            // ->add('account', EntityType::class, [
            //     'class' => Account::class,
            //     'choice_label' => 'id',
            // ])
            ->add('category', EntityType::class, [
                'class' => Category::class,
                'choice_label' => 'name',
                'placeholder' => 'Select a category',
                'required' => true
            ])
            // ->add('htmlContent', TextareaType::class, [
            //     'required' => false,
            //     'attr' => ['rows' => 6, 'class' => 'form-control',  'placeholder' => 'Blog Content',],
            // ])
            // ->add('htmlStyle', TextareaType::class, [
            //     'required' => false,
            //     'attr' => ['rows' => 4, 'class' => 'form-control',  'placeholder' => 'Blog Style',],
            // ])
            // ->add('htmlScript', TextareaType::class, [
            //     'required' => false,
            //     'attr' => ['rows' => 4, 'class' => 'form-control',  'placeholder' => 'Blog Script',],
            // ])
            // ->add('htmlThumbnail', FileType::class, [
            //     'label' => 'Thumbnail Image',
            //     'mapped' => false, // This prevents Symfony from automatically trying to save it as a string
            //     'required' => false,
            //     'constraints' => [
            //         new File([
            //             'maxSize' => '2M',
            //             'mimeTypes' => ['image/jpeg', 'image/png', 'image/gif'],
            //             'mimeTypesMessage' => 'Please upload a valid image file (JPEG, PNG, GIF)',
            //         ]),
            //     ],
            // ]);
            // ->add('_token', HiddenType::class, [
            //     'mapped' => false,
            // ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Blog::class,
        ]);
    }
}
