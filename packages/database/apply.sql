-- AlterTable
ALTER TABLE `folio_lines` ADD COLUMN `adjusted_line_id` INTEGER NULL,
    ADD COLUMN `parent_line_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `payments` DROP COLUMN `updated_at`;

-- CreateIndex
CREATE INDEX `folio_lines_parent_line_id_idx` ON `folio_lines`(`parent_line_id`);

-- CreateIndex
CREATE INDEX `folio_lines_adjusted_line_id_idx` ON `folio_lines`(`adjusted_line_id`);

-- AddForeignKey
ALTER TABLE `folio_lines` ADD CONSTRAINT `folio_lines_parent_line_id_fkey` FOREIGN KEY (`parent_line_id`) REFERENCES `folio_lines`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `folio_lines` ADD CONSTRAINT `folio_lines_adjusted_line_id_fkey` FOREIGN KEY (`adjusted_line_id`) REFERENCES `folio_lines`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

