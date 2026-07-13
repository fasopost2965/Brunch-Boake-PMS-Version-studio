-- PMS Brunch Bouaké - Schéma de Base de Données MySQL (Hostinger)
-- Fichier de création de tables et de données initiales

CREATE DATABASE IF NOT EXISTS `u707543112_bb_db_v1` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `u707543112_bb_db_v1`;

-- --------------------------------------------------------
-- Table 1: Clients (Guests)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `clients` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `status` ENUM('Régulier', 'VIP', 'Corporate', 'Nouveau') NOT NULL DEFAULT 'Nouveau',
  `notes` TEXT NULL,
  `gender` VARCHAR(10) NULL,
  `birthDate` DATE NULL,
  `nationality` VARCHAR(50) NULL,
  `idType` VARCHAR(50) NULL,
  `idNumber` VARCHAR(50) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 2: Chambres (Rooms)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `chambres` (
  `id` VARCHAR(10) NOT NULL, -- Numéro de chambre (ex: '101')
  `type` VARCHAR(50) NOT NULL, -- 'Standard', 'Deluxe', 'Suite Royale', 'Pavillon Brunch'
  `status` ENUM('Libre', 'Occupé', 'Sale', 'Maintenance', 'OOO', 'OOS') NOT NULL DEFAULT 'Libre',
  `price` INT NOT NULL, -- Prix en FCFA
  `capacity` INT NOT NULL DEFAULT 2,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 3: Réservations (Reservations)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` VARCHAR(50) NOT NULL, -- 'RES-XXX'
  `guestName` VARCHAR(100) NOT NULL,
  `guestEmail` VARCHAR(100) NOT NULL,
  `roomNumber` VARCHAR(10) NOT NULL,
  `checkIn` DATE NOT NULL,
  `checkOut` DATE NOT NULL,
  `totalBill` INT NOT NULL DEFAULT 0, -- FCFA
  `paidAmount` INT NOT NULL DEFAULT 0, -- FCFA
  `status` ENUM('Confirmé', 'En Cours', 'Terminé') NOT NULL DEFAULT 'Confirmé',
  
  -- Champs fiche de police et administratif étendu
  `gender` VARCHAR(10) NULL,
  `birthDate` DATE NULL,
  `nationality` VARCHAR(50) NULL,
  `idType` VARCHAR(50) NULL,
  `idNumber` VARCHAR(50) NULL,
  `guestPhone` VARCHAR(30) NULL,
  `address` VARCHAR(255) NULL,
  `city` VARCHAR(100) NULL,
  `country` VARCHAR(100) NULL,
  `postalCode` VARCHAR(20) NULL,
  `language` VARCHAR(20) NULL,
  `emergencyContact` VARCHAR(100) NULL,
  `adults` INT NOT NULL DEFAULT 1,
  `children` INT NOT NULL DEFAULT 0,
  `notes` TEXT NULL,
  `docScanUrl` TEXT NULL, -- Scan Base64 ou URL de fichier
  `signatureData` TEXT NULL, -- Signature du client Base64
  `agreedToTerms` TINYINT(1) NOT NULL DEFAULT 0,
  
  -- Origine et canal d'acquisition
  `source` VARCHAR(50) NULL, -- 'Direct', 'OTA', 'Walk-In', etc.
  `bookingSource` VARCHAR(50) NULL,
  `channelType` VARCHAR(50) NULL,
  `channelName` VARCHAR(50) NULL,
  `otaReference` VARCHAR(50) NULL,
  `originCountry` VARCHAR(50) NULL,
  `createdFrom` VARCHAR(50) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_room_number` (`roomNumber`),
  CONSTRAINT `fk_reservations_room` FOREIGN KEY (`roomNumber`) REFERENCES `chambres` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table 4: Paiements (Payments)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `paiements` (
  `id` VARCHAR(50) NOT NULL, -- 'PAY-XXX'
  `reservationId` VARCHAR(50) NOT NULL,
  `guestName` VARCHAR(100) NOT NULL,
  `amount` INT NOT NULL, -- Montant en FCFA
  `method` VARCHAR(50) NOT NULL, -- 'Espèces', 'Orange Money', 'MTN Momo', 'Moov Money', 'Carte Bancaire', 'Virement'
  `date` DATETIME NOT NULL,
  `reference` VARCHAR(100) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_reservation_id` (`reservationId`),
  CONSTRAINT `fk_paiements_reservation` FOREIGN KEY (`reservationId`) REFERENCES `reservations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------
-- DONNÉES DE DÉPART (SEEDS)
-- --------------------------------------------------------

-- Insertion des Chambres par défaut
INSERT INTO `chambres` (`id`, `type`, `status`, `price`, `capacity`) VALUES
('101', 'Standard', 'Libre', 35000, 2),
('102', 'Standard', 'Occupé', 35000, 2),
('103', 'Standard', 'Sale', 35000, 2),
('104', 'Standard', 'Maintenance', 35000, 2),
('201', 'Deluxe', 'Libre', 55000, 2),
('202', 'Deluxe', 'Occupé', 55000, 2),
('203', 'Deluxe', 'Libre', 55000, 2),
('301', 'Suite Royale', 'Occupé', 95000, 4),
('302', 'Suite Royale', 'Libre', 95000, 4),
('PV-1', 'Pavillon Brunch', 'Occupé', 120000, 6),
('PV-2', 'Pavillon Brunch', 'Libre', 120000, 6);

-- Insertion de quelques Clients fictifs d'exemple (Bouaké VIPs)
INSERT INTO `clients` (`id`, `name`, `email`, `phone`, `status`, `notes`, `gender`, `birthDate`, `nationality`, `idType`, `idNumber`) VALUES
('G-101', 'M. Koffi Kouamé Jean', 'koffi.jean@gmail.com', '+225 07 48 59 12 34', 'VIP', 'Préfère la chambre 301 et adore notre brunch signature au Pavillon.', 'Masculin', '1982-04-15', 'Ivoirienne', 'CNI', 'CI00293849'),
('G-102', 'Mme Aminata Diallo', 'aminata.diallo@yahoo.fr', '+225 01 02 03 04 05', 'Régulier', 'Cliente d\'affaires régulière, facture au nom de SIFCA.', 'Féminin', '1990-11-22', 'Guinéenne', 'Passeport', 'GN0093849'),
('G-103', 'Dr. Touré Ibrahim', 'ibrahim.toure@univ-bouake.ci', '+225 05 66 77 88 99', 'Corporate', 'Professeur à l\'Université de Bouaké.', 'Masculin', '1975-08-30', 'Ivoirienne', 'CNI', 'CI00847382'),
('G-104', 'Mlle Sophie Dubois', 'sophie.dubois@outlook.com', '+33 6 12 34 56 78', 'Nouveau', 'Touriste de passage, adore l\'architecture de l\'hôtel.', 'Féminin', '1995-02-05', 'Française', 'Passeport', 'FR1827384');

-- Insertion de Réservations d'exemple (Juillet 2026, correspondant aux mocks)
INSERT INTO `reservations` (`id`, `guestName`, `guestEmail`, `roomNumber`, `checkIn`, `checkOut`, `totalBill`, `paidAmount`, `status`, `gender`, `birthDate`, `nationality`, `idType`, `idNumber`, `guestPhone`, `address`, `city`, `country`, `adults`, `children`, `source`, `bookingSource`, `channelType`, `channelName`) VALUES
('RES-001', 'M. Koffi Kouamé Jean', 'koffi.jean@gmail.com', '301', '2026-07-10', '2026-07-15', 475000, 475000, 'En Cours', 'Masculin', '1982-04-15', 'Ivoirienne', 'CNI', 'CI00293849', '+225 07 48 59 12 34', 'Quartier Nimbo', 'Bouaké', 'Côte d\'Ivoire', 2, 1, 'Direct', 'Direct', 'Direct', 'Appel'),
('RES-002', 'Mme Aminata Diallo', 'aminata.diallo@yahoo.fr', '202', '2026-07-11', '2026-07-13', 110000, 55000, 'En Cours', 'Féminin', '1990-11-22', 'Guinéenne', 'Passeport', 'GN0093849', '+225 01 02 03 04 05', 'Cocody Mermoz', 'Abidjan', 'Côte d\'Ivoire', 1, 0, 'OTA', 'OTA', 'OTA', 'Booking.com'),
('RES-003', 'Mlle Sophie Dubois', 'sophie.dubois@outlook.com', '102', '2026-07-12', '2026-07-14', 70000, 0, 'Confirmé', 'Féminin', '1995-02-05', 'Française', 'Passeport', 'FR1827384', '+33 6 12 34 56 78', 'Rue de Paris', 'Lille', 'France', 1, 0, 'Direct', 'Direct', 'Direct', 'Site Direct');

-- Insertion de Paiements d'exemple
INSERT INTO `paiements` (`id`, `reservationId`, `guestName`, `amount`, `method`, `date`, `reference`) VALUES
('PAY-001', 'RES-001', 'M. Koffi Kouamé Jean', 475000, 'Carte Bancaire', '2026-07-10 14:35:00', 'REF-CB-84738'),
('PAY-002', 'RES-002', 'Mme Aminata Diallo', 55000, 'Orange Money', '2026-07-11 11:20:00', 'REF-OM-93840294');
