<?

namespace App\Service\Account;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

use function PHPUnit\Framework\isEmpty;

class UpdatePasswordService
{
    private EntityManagerInterface $em;
    private UserPasswordHasherInterface $passwordHasher;
    public function __construct(EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher)
    {
        $this->em = $em;
        $this->passwordHasher = $passwordHasher;
    }

    public function UpdatePassword($formData)
    {
        $data = $formData->getData();
        $newPassword = $formData->get('newPassword')->getData();

        if(!$newPassword) return false;

        $hashedPassword = $this->passwordHasher->hashPassword($data, $newPassword);
        $data->setPassword($hashedPassword);
        $data->setUpdatedAt(new \DateTimeImmutable());

        $this->em->persist($data);
        $this->em->flush();

        return true;
    }
}
