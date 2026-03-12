-- scripts/global-settings-init.sql
CREATE TABLE IF NOT EXISTS global_settings (
  `key` VARCHAR(50) PRIMARY KEY,
  `value` TEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO global_settings (`key`, `value`) VALUES 
('sa_kill_switch', 'false'),
('sa_broadcast_msg', '')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
