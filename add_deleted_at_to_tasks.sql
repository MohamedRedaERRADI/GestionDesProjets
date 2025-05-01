-- Ce script SQL ajoute la colonne deleted_at à la table tasks
-- Exécutez ce script dans votre base de données MySQL/MariaDB

ALTER TABLE tasks 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- L'index n'est pas obligatoire mais peut améliorer les performances
CREATE INDEX tasks_deleted_at_index ON tasks (deleted_at); 