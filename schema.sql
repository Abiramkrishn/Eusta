-- ==========================================================
-- Eusta Portal - Complete MySQL Database Schema & Initial Data
-- Compatible with Hostinger MySQL / phpMyAdmin / MariaDB
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `phone` VARCHAR(50) DEFAULT '',
  `plan` VARCHAR(50) DEFAULT '6 Months',
  `status` VARCHAR(50) DEFAULT 'Active',
  `joinedDate` VARCHAR(50) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `categories`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(100) DEFAULT 'chair',
  `status` VARCHAR(50) DEFAULT 'Active',
  `created` VARCHAR(50) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `products`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) DEFAULT '',
  `category` VARCHAR(100) DEFAULT '',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `oldPrice` DECIMAL(10,2) DEFAULT NULL,
  `stock` INT DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'Active',
  `description` TEXT,
  `image` VARCHAR(500) DEFAULT '',
  `images` JSON DEFAULT NULL,
  `onSale` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `enquiries`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `enquiries` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) DEFAULT '',
  `email` VARCHAR(255) DEFAULT '',
  `phone` VARCHAR(100) DEFAULT '',
  `subject` VARCHAR(255) DEFAULT '',
  `message` TEXT,
  `date` VARCHAR(100) DEFAULT '',
  `status` VARCHAR(50) DEFAULT 'Unread',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `subscription_plans`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `duration` INT NOT NULL,
  `cost` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`duration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `subscriptions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` VARCHAR(64) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `date` VARCHAR(100) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_val` LONGTEXT,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `product_clicks`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_clicks` (
  `product_id` VARCHAR(64) NOT NULL,
  `views` INT DEFAULT 0,
  `whatsappClicks` INT DEFAULT 0,
  `lastClicked` VARCHAR(100) DEFAULT '',
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `analytics_logs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `analytics_logs` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `productId` VARCHAR(64) DEFAULT '',
  `productName` VARCHAR(255) DEFAULT '',
  `type` VARCHAR(50) DEFAULT '',
  `timestamp` VARCHAR(100) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Initial Seed Data: Subscription Plans
-- --------------------------------------------------------
INSERT IGNORE INTO `subscription_plans` (`duration`, `cost`) VALUES
(1, 29.00),
(3, 79.00),
(6, 149.00),
(12, 269.00);

-- --------------------------------------------------------
-- Initial Seed Data: Default Admin User (Password: admin123)
-- --------------------------------------------------------
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `plan`, `status`, `joinedDate`) VALUES
('usr_admin_1', 'Eusta Admin', 'admin@eusta.com', 'admin123', 'admin', '+1 555 019 283', '12 Months', 'Active', '2026-01-15'),
('usr_super_1', 'Super Admin', 'super@eusta.com', 'super123', 'super-admin', '+1 555 999 888', 'Enterprise', 'Active', '2026-01-01');
