<?php

namespace App\Entity;

use App\Repository\BlogRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\String\Slugger\SluggerInterface;

#[ORM\Entity(repositoryClass: BlogRepository::class)]
class Blog
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: "blog_id", type: "integer")]
    private ?int $blog_id = null;

    #[ORM\ManyToOne(targetEntity: Account::class, inversedBy: 'blogs')]
    #[ORM\JoinColumn(name: "account_id", referencedColumnName: "account_id", nullable: false, onDelete: "CASCADE")]
    #[Groups(['blog:read'])]
    private ?Account $account = null;

    #[ORM\ManyToOne(targetEntity: Category::class, inversedBy: 'blogs')]
    #[ORM\JoinColumn(name: "category_id", referencedColumnName: "category_id", nullable: false, onDelete: "CASCADE")]
    #[Groups(['blog:read'])]
    private ?Category $category = null;

    #[ORM\Column(length: 255)]
    #[Groups(['blog:read', 'category:read'])]
    private ?string $title = null;

    #[ORM\Column(length: 50)]
    #[Groups(['blog:read', 'category:read'])]
    private ?string $status = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $htmlContent = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $htmlStyle = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $htmlScript = null;

    #[ORM\Column(type: 'text', length: 255, nullable: true)]
    private ?string $htmlThumbnail = null;

    #[ORM\Column(type: 'text', length: 255)]
    private ?string $slug = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\Column]
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
}
