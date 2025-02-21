<?php

namespace App\Twig\Extension;

use App\Twig\Runtime\FrontendTwigExtensionRuntime;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

class FrontendTwigExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('activePage', [$this, 'activePage']),
        ];
    }

    public function activePage(string $route, string $current_dir): string
    {
        return $route === $current_dir ? 'active' : '';
    }
}
