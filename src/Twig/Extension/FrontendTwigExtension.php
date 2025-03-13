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
            new TwigFunction('blogStatus', [$this, 'blogStatus']),
            new TwigFunction('blogIcon', [$this, 'blogIcon']),
            new TwigFunction('formatViews', [$this, 'formatViews']),
        ];
    }

    public function activePage(string $route, string $current_dir): string
    {
        return $route === $current_dir ? 'active' : '';
    }

    public function blogStatus(int $id): string
    {
        $status = ['1' => 'Drafted', '2' => 'Published'];

        return $status[$id];
    }

    public function blogIcon(int $id): string
    {
        $icons = ['1' => 'icon-newspaper', '2' => 'icon-rss', '3' => 'icon-book-text'];
        return $icons[$id];
    }

    public function formatViews(int $viewCount): string
    {
        if ($viewCount >= 1000) {
            return number_format($viewCount / 1000, 1) . "K"; 
        }
        return $viewCount;
    }
}
