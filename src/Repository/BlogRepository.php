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

    //    /**
    //     * @return Blog[] Returns an array of Blog objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('b')
    //            ->andWhere('b.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('b.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Blog
    //    {
    //        return $this->createQueryBuilder('b')
    //            ->andWhere('b.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }

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
            ->where('b.status = :published')
            ->setParameter('published', $statusId)
            ->orderBy('b.created_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function getLatestBlogPost(){
        return $this->createQueryBuilder('b')
        ->leftJoin('b.category', 'c')
        ->select('b.title', 'b.slug', 'b.htmlThumbnail', 'b.created_at', 'b.summary')
        ->addSelect('c.name', 'c.category_id')
        ->leftJoin('b.account', 'a')
        ->addSelect('a.firstName', 'a.lastName')
        ->orderBy('b.created_at', 'DESC')
        ->setMaxResults(4)
        ->getQuery()
        ->getResult();
    }
}
