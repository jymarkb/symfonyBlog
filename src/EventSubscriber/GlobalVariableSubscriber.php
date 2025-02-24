<?php

namespace App\EventSubscriber;

use Symfony\Component\HttpKernel\Event\RequestEvent;
use Twig\Environment;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class GlobalVariableSubscriber implements EventSubscriberInterface
{
    private Environment $twig;

    public function __construct(Environment $twig)
    {
        $this->twig = $twig;
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $sidebarCookie = $request->cookies->get('sidebarCookie', 'default_value');

        // Make sidebarCookie available in all Twig templates
        $this->twig->addGlobal('sidebarCookie', $sidebarCookie);
    }

    public static function getSubscribedEvents(): array
    {
        return [
            RequestEvent::class => 'onKernelRequest',
        ];
    }
}
