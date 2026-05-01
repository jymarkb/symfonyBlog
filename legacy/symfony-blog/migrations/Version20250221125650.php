<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250221125650 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE account (account_id INT AUTO_INCREMENT NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone_number VARCHAR(255) DEFAULT NULL, avatar VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_7D3656A4E7927C74 (email), PRIMARY KEY(account_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE blog (blog_id INT AUTO_INCREMENT NOT NULL, account_id INT NOT NULL, category_id INT NOT NULL, title VARCHAR(255) NOT NULL, status VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_C01551439B6B5FBA (account_id), INDEX IDX_C015514312469DE2 (category_id), PRIMARY KEY(blog_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE category (category_id INT AUTO_INCREMENT NOT NULL, name VARCHAR(50) NOT NULL, PRIMARY KEY(category_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE blog ADD CONSTRAINT FK_C01551439B6B5FBA FOREIGN KEY (account_id) REFERENCES account (account_id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE blog ADD CONSTRAINT FK_C015514312469DE2 FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blog DROP FOREIGN KEY FK_C01551439B6B5FBA');
        $this->addSql('ALTER TABLE blog DROP FOREIGN KEY FK_C015514312469DE2');
        $this->addSql('DROP TABLE account');
        $this->addSql('DROP TABLE blog');
        $this->addSql('DROP TABLE category');
    }
}
