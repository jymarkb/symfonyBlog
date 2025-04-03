<?php

namespace App\Repository;

use App\Entity\Blog;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Blog>
 */
class BlogRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Blog::class);
    }
    
    public function showAllPages(): array
    {
        return $this->createQueryBuilder('b')
            ->orderBy('b.blog_id', 'DESC')
            ->getQuery()
            ->getResult();
    }
    public function showPageByStatusId(int $statusId = Blog::PUBLISHED): array
    {
        return $this->createQueryBuilder('b')
            ->select(
                'b.title',
                'b.slug',
                'b.htmlThumbnail',
                'b.created_at',
                'b.summary'
            )
            ->leftJoin('b.category', 'c')
            ->addSelect('c.name', 'c.category_id')
            ->leftJoin('b.account', 'a')
            ->addSelect('a.firstName', 'a.lastName', 'a.avatar')
            ->leftJoin('b.blogAnalytics', 'analytics')
            ->addSelect('analytics.views', 'analytics.readingTime')
            ->where('b.status = :published')
            ->setParameter('published', $statusId)
            ->orderBy('b.created_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function getLatestBlogPost()
    {
        return $this->createQueryBuilder('b')
            ->leftJoin('b.category', 'c')
            ->select(
                'b.title',
                'b.slug',
                'b.htmlThumbnail',
                'b.created_at',
                'b.summary'
            )
            ->addSelect('c.name', 'c.category_id')
            ->leftJoin('b.account', 'a')
            ->addSelect('a.firstName', 'a.lastName', 'a.avatar')
            ->leftJoin('b.blogAnalytics', 'analytics')
            ->addSelect('analytics.views', 'analytics.readingTime')
            ->orderBy('b.created_at', 'DESC')
            ->getQuery()
            ->setMaxResults(4)
            ->getResult();
    }

    public function getBlogByTitle(string $title)
    {
        return $this->createQueryBuilder('b')
            ->select(
                'b.blog_id',
                'b.title',
                'b.created_at',
                'b.updated_at',
                'b.status'
            )
            ->leftJoin('b.category', 'c')
            ->addSelect('c.category_id', 'c.name')
            ->leftJoin('b.account', 'a')
            ->addSelect('a.firstName', 'a.lastName')
            ->where('b.title LIKE :paramTitle')
            ->setParameter('paramTitle', '%' . $title . '%')
            ->getQuery()
            ->getArrayResult();
    }

    public function getBlogWithFilter(?string $title, array $filters = []): array
    {
        $qb = $this->createQueryBuilder('b');

        $qb->select('b.title', 'b.blog_id', 'b.status', 'b.slug', 'b.created_at', 'b.updated_at');
        $qb->leftJoin('b.category', 'category');
        $qb->addSelect('category.category_id', 'category.name');
        $qb->leftJoin('b.account', 'account');
        $qb->addSelect('account.firstName', 'account.lastName');

        if ($title) {
            $qb->andWhere('b.title LIKE :title')->setParameter(
                'title',
                "%$title%"
            );
        }

        if (!empty($filters['status'])) {
            $qb->andWhere('b.status IN (:status)')->setParameter(
                'status',
                $filters['status']
            );
        }

        if (!empty($filters['category'])) {
            $qb->andWhere('b.category IN (:category)')->setParameter(
                'category',
                $filters['category']
            );
        }

        return $qb->getQuery()->getArrayResult();
    }
}
