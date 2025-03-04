<?php

namespace App\Entity;

use App\Entity\Blog;
use App\Repository\BlogAnalyticsRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BlogAnalyticsRepository::class)]
#[ORM\Table(name: 'blog_analytics')]
class BlogAnalytics
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: Blog::class, inversedBy: 'blogAnalytics')]
    #[ORM\JoinColumn(name: 'blog_id', referencedColumnName: 'blog_id', nullable: false, onDelete: 'CASCADE')]
    private Blog $blog;

    #[ORM\Column]
    private ?int $views = null;

    #[ORM\Column]
    private ?int $likes = null;

    #[ORM\Column(length: 255)]
    private ?int $dislikes = null;

    #[ORM\Column]
    private ?int $readingTime = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getViews(): ?int
    {
        return $this->views;
    }

    public function setViews(int $views): static
    {
        $this->views = $views;

        return $this;
    }

    public function getLikes(): ?int
    {
        return $this->likes;
    }

    public function setLikes(int $likes): static
    {
        $this->likes = $likes;

        return $this;
    }

    public function getDislikes(): ?string
    {
        return $this->dislikes;
    }

    public function setDislikes(string $dislikes): static
    {
        $this->dislikes = $dislikes;

        return $this;
    }

    public function getReadingTime(): ?int
    {
        return $this->readingTime;
    }

    public function setReadingTime(int $readingTime): static
    {
        $this->readingTime = $readingTime;

        return $this;
    }

    public function getBlog(): ?Blog
    {
        return $this->blog;
    }

    public function setBlog(Blog $blog): static
    {
        $this->blog = $blog;

        return $this;
    }
}
