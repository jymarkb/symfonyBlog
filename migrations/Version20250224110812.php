<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250224110812 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update: blog entity for html content';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blog ADD html_content LONGTEXT NOT NULL, ADD html_style LONGTEXT NOT NULL, ADD html_script LONGTEXT NOT NULL, ADD html_thumbnail TINYTEXT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blog DROP html_content, DROP html_style, DROP html_script, DROP html_thumbnail');
    }
}
