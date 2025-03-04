<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250304001101 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add new Entity BlogAnalytics';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE blog_analytics (id INT AUTO_INCREMENT NOT NULL, blog_id INT NOT NULL, views INT NOT NULL, likes INT NOT NULL, dislikes INT NOT NULL, reading_time INT NOT NULL, UNIQUE INDEX UNIQ_4FBC0EC7DAE07E97 (blog_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE blog_analytics ADD CONSTRAINT FK_4FBC0EC7DAE07E97 FOREIGN KEY (blog_id) REFERENCES blog (blog_id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blog_analytics DROP FOREIGN KEY FK_4FBC0EC7DAE07E97');
        $this->addSql('DROP TABLE blog_analytics');
    }
}
