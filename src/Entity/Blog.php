<?php

namespace App\Entity;

use App\Repository\BlogRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\String\Slugger\SluggerInterface;

#[ORM\Entity(repositoryClass: BlogRepository::class)]
#[ORM\Table(
    name: 'blog',
    indexes: [
        new ORM\Index(name: 'blog_status_idx', columns: ['status']),
        new ORM\Index(name: 'blog_slug_idx', columns: ['slug']),
        new ORM\Index(name: 'blog_created_idx', columns: ['created_at']),
    ]
)]
class Blog
{
    public const DRAFTED = 1;
    public const PUBLISHED = 2;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'blog_id', type: 'integer')]
    #[Groups(['blog:read'])]
    private ?int $blog_id = null;

    #[ORM\ManyToOne(targetEntity: Account::class, inversedBy: 'blogs')]
    #[ORM\JoinColumn(name: 'account_id', referencedColumnName: 'account_id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['blog:read'])]
    private ?Account $account = null;

    #[ORM\ManyToOne(targetEntity: Category::class, inversedBy: 'blogs')]
    #[ORM\JoinColumn(name: 'category_id', referencedColumnName: 'category_id', nullable: false, onDelete: 'CASCADE')]
    #[Groups(['blog:read'])]
    private ?Category $category = null;

    #[ORM\OneToOne(targetEntity: BlogAnalytics::class, mappedBy: 'blog', cascade: ['persist', 'remove'])]
    #[Groups(['blog:read'])]
    private ?BlogAnalytics $blogAnalytics = null;

    #[ORM\Column(length: 255)]
    #[Groups(['blog:read', 'category:read'])]
    private ?string $title = null;

    #[ORM\Column(length: 1)]
    #[Groups(['blog:read', 'category:read'])]
    private ?int $status = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['blog:read'])]
    private ?string $summary = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['blog:read'])]
    private ?string $htmlContent = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['blog:read'])]
    private ?string $htmlStyle = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['blog:read'])]
    private ?string $htmlScript = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(['blog:read'])]
    private ?string $htmlThumbnail = null;

    #[ORM\Column(type: 'string', length: 255, unique: true)]
    #[Groups(['blog:read'])]
    private ?string $slug = null;

    #[ORM\Column(type: 'boolean')]
    #[Groups(['blog:read'])]
    private bool $is_featured = false;

    #[ORM\Column]
    #[Groups(['blog:read'])]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column]
    #[Groups(['blog:read'])]
    private ?\DateTimeImmutable $updated_at = null;

    public function getId(): ?int
    {
        return $this->blog_id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(\DateTimeImmutable $updated_at): static
    {
        $this->updated_at = $updated_at;

        return $this;
    }

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getAccount(): ?Account
    {
        return $this->account;
    }

    public function setAccount(?Account $account): static
    {
        $this->account = $account;

        return $this;
    }

    public function getBlogId(): ?int
    {
        return $this->blog_id;
    }

    public function getHtmlContent(): ?string
    {
        return $this->htmlContent;
    }

    public function setHtmlContent(string $htmlContent): static
    {
        $this->htmlContent = $htmlContent;

        return $this;
    }

    public function getHtmlStyle(): ?string
    {
        return $this->htmlStyle;
    }

    public function setHtmlStyle(string $htmlStyle): static
    {
        $this->htmlStyle = $htmlStyle;

        return $this;
    }

    public function getHtmlScript(): ?string
    {
        return $this->htmlScript;
    }

    public function setHtmlScript(string $htmlScript): static
    {
        $this->htmlScript = $htmlScript;

        return $this;
    }

    public function getHtmlThumbnail(): ?string
    {
        return $this->htmlThumbnail;
    }

    public function setHtmlThumbnail(string $htmlThumbnail): static
    {
        $this->htmlThumbnail = $htmlThumbnail;

        return $this;
    }

    public function generateSlug(SluggerInterface $slugger): void
    {
        $this->slug = $slugger->slug($this->title)->lower();
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }

    public function isFeatured(): ?bool
    {
        return $this->is_featured;
    }

    public function setIsFeatured(bool $is_featured): static
    {
        $this->is_featured = $is_featured;

        return $this;
    }

    public function getSummary(): ?string
    {
        return $this->summary;
    }

    public function setSummary(?string $summary): static
    {
        $this->summary = $summary;

        return $this;
    }

    public function getBlogAnalytics(): ?BlogAnalytics
    {
        return $this->blogAnalytics;
    }

    public function setBlogAnalytics(?BlogAnalytics $blogAnalytics): static
    {
        // unset the owning side of the relation if necessary
        if ($blogAnalytics === null && $this->blogAnalytics !== null) {
            $this->blogAnalytics->setBlog(null);
        }

        // set the owning side of the relation if necessary
        if ($blogAnalytics !== null && $blogAnalytics->getBlog() !== $this) {
            $blogAnalytics->setBlog($this);
        }

        $this->blogAnalytics = $blogAnalytics;

        return $this;
    }
}
