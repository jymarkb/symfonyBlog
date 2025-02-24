<?php

namespace App\EventListener;

use App\Repository\BlogRepository;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\RouterInterface;

final class BlogRouteListener
{
    private Security $security;
    private BlogRepository $blogRepository;
    private RouterInterface $router;
    public function __construct(BlogRepository $blogRepository, Security $security, RouterInterface $router)
    {
        $this->blogRepository = $blogRepository;
        $this->security = $security;
        $this->router = $router;
    }
    #[AsEventListener(event: KernelEvents::REQUEST)]
    public function onKernelRequest(RequestEvent $event): void
    {

        $request = $event->getRequest();

        if (!$request->attributes->get('slug')) {
            return;
        }

        $slug = $request->attributes->get('slug');

        $blog = $this->blogRepository->findOneBy(array('slug' => $slug));

        if (!$blog) {
            return;
        }

        if ($blog->getStatus() === '1' && !$this->security->isGranted('IS_AUTHENTICATED_FULLY')) {
            $event->setResponse(new RedirectResponse($this->router->generate('home.index')));
            return;
        }
    }
}
