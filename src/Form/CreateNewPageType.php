<?php

namespace App\Form;

use App\Entity\Blog;
use App\Entity\Category;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\File;

class CreateNewPageType extends AbstractType
{
    public function buildForm(
        FormBuilderInterface $builder,
        array $options
    ): void {
        $builder
            ->add('title', TextType::class, [
                'required' => true,
            ])
            ->add('status', HiddenType::class, [
                'mapped' => false,
            ])
            ->add('summary', TextareaType::class)
            ->add('category', EntityType::class, [
                'class' => Category::class,
                'choice_label' => 'name',
                'placeholder' => 'Select a category',
                'required' => true,
            ])
            ->add('htmlContent', TextareaType::class, [
                'required' => true,
                'attr' => [
                    'rows' => 6,
                    'class' => 'form-control hidden',
                    'placeholder' => 'Blog Content',
                ],
            ])
            ->add('htmlStyle', TextareaType::class, [
                'required' => false,
                'empty_data' => '',
                'attr' => [
                    'rows' => 4,
                    'class' => 'form-control hidden',
                    'placeholder' => 'Blog Style',
                ],
            ])
            ->add('htmlScript', TextareaType::class, [
                'required' => false,
                'empty_data' => '',
                'attr' => [
                    'rows' => 4,
                    'class' => 'form-control hidden',
                    'placeholder' => 'Blog Script',
                ],
            ])
            ->add('htmlThumbnail', FileType::class, [
                'label' => 'Thumbnail Image',
                'mapped' => false,
                'required' => $options['isEditPage'] ? false : true,
                'constraints' => [
                    new File([
                        'maxSize' => '2M',
                        'mimeTypes' => [
                            'image/jpeg',
                            'image/png',
                            'image/webp',
                        ],
                        'mimeTypesMessage' =>
                        'Please upload a valid image file (JPG, JPEG, PNG, WEBP)',
                    ]),
                ],
                'attr' => [
                    'class' => 'hidden',
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Blog::class,
            'isEditPage' => false,
        ]);
    }
}
