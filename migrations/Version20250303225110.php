<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250303225110 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update blog table column';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blog ADD summary LONGTEXT DEFAULT NULL, ADD is_featured TINYINT(1) NOT NULL, CHANGE html_thumbnail html_thumbnail VARCHAR(255) DEFAULT NULL, CHANGE slug slug VARCHAR(255) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_C0155143989D9B62 ON blog (slug)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_C0155143989D9B62 ON blog');
        $this->addSql('ALTER TABLE blog DROP summary, DROP is_featured, CHANGE html_thumbnail html_thumbnail TINYTEXT DEFAULT NULL, CHANGE slug slug TINYTEXT NOT NULL');
    }
}
