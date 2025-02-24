<?php

namespace App\Entity;

use App\Repository\CategoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: CategoryRepository::class)]
class Category
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: "category_id", type: "integer")]
    #[Groups(['category:read', 'blog:read'])]
    private ?int $category_id = null;

    #[ORM\OneToMany(mappedBy: 'category', targetEntity: Blog::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[Groups(['category:read'])]
    private Collection $blogs;

    #[ORM\Column(length: 50)]
    #[Groups(['category:read', 'blog:read'])]
    private ?string $name = null;

    public function __construct()
    {
        $this->blogs = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->category_id;
    }

    public function getName(): ?string
    {
        return ucfirst($this->name);
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return Collection<int, Blog>
     */
    public function getBlog(): Collection
    {
        return $this->blog;
    }

    public function addBlog(Blog $blog): static
    {
        if (!$this->blog->contains($blog)) {
            $this->blog->add($blog);
            $blog->setCategory($this);
        }

        return $this;
    }

    public function removeBlog(Blog $blog): static
    {
        if ($this->blog->removeElement($blog)) {
            // set the owning side to null (unless already changed)
            if ($blog->getCategory() === $this) {
                $blog->setCategory(null);
            }
        }

        return $this;
    }

    public function getCategoryId(): ?int
    {
        return $this->category_id;
    }

    /**
     * @return Collection<int, Blog>
     */
    public function getBlogs(): Collection
    {
        return $this->blogs;
    }
}
