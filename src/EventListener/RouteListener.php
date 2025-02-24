<?php

namespace App\EventListener;

use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Routing\RouterInterface;

final class RouteListener
{
    private Security $security;
    private RouterInterface $router;
    private array $restrictedPaths = ['signup', 'forgot-password', 'login'];
    public function __construct(Security $security, RouterInterface $router)
    {
        $this->security = $security;
        $this->router = $router;
    }

    #[AsEventListener(event: KernelEvents::REQUEST)]
    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$this->security->isGranted('IS_AUTHENTICATED_FULLY')) {
            return; // Skip processing if the user is not authenticated
        }

        $request = $event->getRequest();
        $path = $request->getPathInfo();

        foreach ($this->restrictedPaths as $restrictedPath) {
            if (str_starts_with($path, "/$restrictedPath")) {
                $event->setResponse(new RedirectResponse($this->router->generate('home.index')));
                return;
            }
        }
    }
}
