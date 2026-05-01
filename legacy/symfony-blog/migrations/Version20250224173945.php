<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250224173945 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Temporary nullable column';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blog CHANGE html_content html_content LONGTEXT DEFAULT NULL, CHANGE html_style html_style LONGTEXT DEFAULT NULL, CHANGE html_script html_script LONGTEXT DEFAULT NULL, CHANGE html_thumbnail html_thumbnail TINYTEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blog CHANGE html_content html_content LONGTEXT NOT NULL, CHANGE html_style html_style LONGTEXT NOT NULL, CHANGE html_script html_script LONGTEXT NOT NULL, CHANGE html_thumbnail html_thumbnail TINYTEXT NOT NULL');
    }
}
