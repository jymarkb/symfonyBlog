<?

namespace App\Service;

use App\Repository\BlogRepository;
use Doctrine\ORM\EntityManagerInterface;

class SearchService
{
    private BlogRepository $blogRepository;
    public function __construct(BlogRepository $blogRepository)
    {
        $this->blogRepository = $blogRepository;
    }

    public function SearchBlogWithFilter(array $data)
    {
        $title = $data['title'];
        $filters = $data['filter'];
        $blogs = $this->blogRepository->getBlogWithFilter($title, $filters);
        return $blogs;
    }
}
