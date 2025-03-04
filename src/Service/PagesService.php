<?

namespace App\Service;

use App\Entity\Blog;
use Doctrine\ORM\EntityManagerInterface;
use Error;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\BrowserKit\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

class PagesService
{

    private EntityManagerInterface $em;
    private Security $security;
    private SluggerInterface $slugger;
    private string $targetDirectory;
    public function __construct(string $targetDirectory, EntityManagerInterface $em, Security $security, SluggerInterface $slugger)
    {
        $this->em = $em;
        $this->security = $security;
        $this->slugger = $slugger;
        $this->targetDirectory = $targetDirectory;
    }

    public function CreatePage(array $data, Blog $blog)
    {
        try {
            $category = $data['formData']->getCategory();
            $account = $this->security->getUser();
            $thumbnail = $this->thumbnailUpload($data['file']);

            $blog->setTitle($data['formData']->getTitle());
            $blog->setStatus($data['status']);
            $blog->setAccount($account);
            $blog->setCategory($category);
            $blog->setCreatedAt(new \DateTimeImmutable('now'));
            $blog->setUpdatedAt(new \DateTimeImmutable('now'));
            $blog->generateSlug($this->slugger);
            $blog->setHtmlContent($data['formData']->gethtmlContent());
            $blog->setHtmlStyle($data['formData']->gethtmlStyle());
            $blog->setHtmlScript($data['formData']->gethtmlScript());
            $blog->setSummary($data['formData']->getSummary());
            $blog->setHtmlThumbnail($thumbnail);
            $this->em->persist($blog);
            $this->em->flush();
            return true;
        } catch (Error $e) {
            return new Response('Create Error:' . $e);
        }
    }

    private function thumbnailUpload(?UploadedFile $file): string|false
    {
        if (!$file) {
            return false; // Return false if no file is uploaded
        }

        // Validate file size (e.g., max 2MB)
        if ($file->getSize() > 2 * 1024 * 1024) { // 2MB limit
            throw new \Exception('File size exceeds 2MB');
        }

        // Validate file type
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMimeTypes)) {
            throw new \Exception('Invalid file type. Only JPG, PNG, and WEBP are allowed.');
        }

        $constant = "blog-thumbnail";
        // Generate a unique filename
        $fileName = sprintf('%s-%s.%s', $constant, uniqid(), $file->guessExtension());

        // Move file to the target directory
        $file->move($this->targetDirectory, $fileName);

        return $fileName;
    }
}
