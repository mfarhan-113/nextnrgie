-- Production database schema (EXACTLY matches your current working schema)
CREATE DATABASE IF NOT EXISTS nextnrgie CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nextnrgie;

-- Users table (exactly as you have it)
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clients table (exactly as you have it)
CREATE TABLE IF NOT EXISTS clients (
    id INT NOT NULL AUTO_INCREMENT,
    client_number VARCHAR(50) NOT NULL UNIQUE,
    client_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    tva_number VARCHAR(100),
    tsa_number VARCHAR(100),
    contact_person VARCHAR(255),
    contact_person_phone VARCHAR(50),
    contact_person_designation VARCHAR(255),
    client_address TEXT,
    owner_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contracts table (exactly as you have it)
CREATE TABLE IF NOT EXISTS contracts (
    id INT NOT NULL AUTO_INCREMENT,
    command_number VARCHAR(255) NOT NULL UNIQUE,
    price FLOAT NOT NULL,
    date DATE NOT NULL,
    deadline DATE NOT NULL,
    guarantee_percentage FLOAT,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    contact_address VARCHAR(500),
    name VARCHAR(255),
    client_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contract details table
CREATE TABLE IF NOT EXISTS contract_details (
    id INT NOT NULL AUTO_INCREMENT,
    contract_id INT NOT NULL,
    description TEXT NOT NULL,
    qty INT NOT NULL,
    unit_price FLOAT NOT NULL,
    tva FLOAT NOT NULL,
    total_ht FLOAT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Factures table
CREATE TABLE IF NOT EXISTS factures (
    id INT NOT NULL AUTO_INCREMENT,
    contract_id INT NOT NULL,
    description TEXT NOT NULL,
    qty FLOAT NOT NULL,
    unit_price FLOAT NOT NULL,
    tva FLOAT NOT NULL,
    total_ht FLOAT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id INT NOT NULL AUTO_INCREMENT,
    invoice_number VARCHAR(255) NOT NULL UNIQUE,
    contract_id INT NOT NULL,
    amount FLOAT NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'unpaid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Miscellaneous table
CREATE TABLE IF NOT EXISTS miscellaneous (
    id INT NOT NULL AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL,
    units INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Salaries table
CREATE TABLE IF NOT EXISTS salaries (
    id INT NOT NULL AUTO_INCREMENT,
    employee_name VARCHAR(255) NOT NULL,
    working_days INT NOT NULL,
    leaves INT NOT NULL,
    salary_per_day FLOAT NOT NULL,
    total_salary FLOAT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_clients_owner_id ON clients(owner_id);
CREATE INDEX idx_contracts_client_id ON contracts(client_id);
CREATE INDEX idx_contracts_date ON contracts(date);
CREATE INDEX idx_contract_details_contract_id ON contract_details(contract_id);
CREATE INDEX idx_factures_contract_id ON factures(contract_id);
CREATE INDEX idx_invoices_contract_id ON invoices(contract_id);
CREATE INDEX idx_invoices_status ON invoices(status);
