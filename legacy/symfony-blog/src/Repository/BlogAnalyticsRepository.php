<?php

namespace App\Repository;

use App\Entity\BlogAnalytics;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<BlogAnalytics>
 */
class BlogAnalyticsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, BlogAnalytics::class);
    }

    public function getMostViewBlogPost()
    {
        return $this->createQueryBuilder('analytics')
            ->select('analytics.views', 'analytics.readingTime')
            ->leftJoin('analytics.blog', 'blog')
            ->addSelect(
                'blog.title',
                'blog.slug',
                'blog.htmlThumbnail',
                'blog.created_at',
                'blog.summary'
            )
            ->leftJoin('blog.account', 'account')
            ->addSelect('account.firstName', 'account.lastName', 'account.avatar')
            ->leftJoin('blog.category', 'category')
            ->addSelect('category.name', 'category.category_id')
            ->orderBy('analytics.views', 'DESC')
            ->setMaxResults(3)
            ->getQuery()
            ->getResult()

        ;
    }
}
