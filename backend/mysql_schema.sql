SET FOREIGN_KEY_CHECKS=0;

DROP DATABASE IF EXISTS client_management;
CREATE DATABASE client_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE client_management;


CREATE TABLE alembic_version (
	version_num VARCHAR(32) NOT NULL, 
	CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
)

;


CREATE TABLE clients (
	id INTEGER NOT NULL, 
	client_number VARCHAR(255) NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	phone VARCHAR(255) NOT NULL, 
	tva_number VARCHAR(255), 
	owner_id INTEGER, 
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	client_name VARCHAR(255), 
	PRIMARY KEY (id), 
	FOREIGN KEY(owner_id) REFERENCES users (id)
)

;


CREATE TABLE users (
	id INTEGER NOT NULL, 
	email VARCHAR(255) NOT NULL, 
	hashed_password VARCHAR(255) NOT NULL, 
	full_name VARCHAR(255) NOT NULL, 
	phone VARCHAR(255), 
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id)
)

;


CREATE TABLE contract_details (
	id INTEGER, 
	contract_id INTEGER NOT NULL, 
	description TEXT NOT NULL, 
	qty INTEGER NOT NULL, 
	unit_price REAL NOT NULL, 
	tva REAL NOT NULL, 
	total_ht REAL NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(contract_id) REFERENCES contracts (id) ON DELETE CASCADE
)

;


CREATE TABLE contracts (
	id INTEGER NOT NULL, 
	command_number VARCHAR(255) NOT NULL, 
	price FLOAT NOT NULL, 
	date DATE NOT NULL, 
	deadline DATE NOT NULL, 
	guarantee_percentage FLOAT, 
	contact_person VARCHAR(255), 
	name VARCHAR(255), 
	client_id INTEGER NOT NULL, 
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id), 
	FOREIGN KEY(client_id) REFERENCES clients (id)
)

;


CREATE TABLE invoices (
	id INTEGER NOT NULL, 
	invoice_number VARCHAR(255) NOT NULL, 
	contract_id INTEGER NOT NULL, 
	amount FLOAT NOT NULL, 
	due_date DATE NOT NULL, 
	status VARCHAR(255), 
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	paid_amount REAL DEFAULT (0.0) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(contract_id) REFERENCES contracts (id)
)

;


CREATE TABLE invoices_new (
	id INTEGER, 
	invoice_number VARCHAR(255) NOT NULL, 
	contract_id INTEGER NOT NULL, 
	amount REAL NOT NULL, 
	paid_amount REAL DEFAULT (0.0) NOT NULL, 
	due_date DATE NOT NULL, 
	status VARCHAR(255) DEFAULT 'unpaid' NOT NULL, 
	created_at TIMESTAMP, 
	updated_at TIMESTAMP, 
	PRIMARY KEY (id), 
	FOREIGN KEY(contract_id) REFERENCES contracts (id)
)

;


CREATE TABLE miscellaneous (
	id INTEGER NOT NULL, 
	description VARCHAR(255) NOT NULL, 
	price FLOAT NOT NULL, 
	units INTEGER NOT NULL, 
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id)
)

;


CREATE TABLE salaries (
	id INTEGER NOT NULL, 
	employee_name VARCHAR(255) NOT NULL, 
	working_days INTEGER NOT NULL, 
	leaves INTEGER NOT NULL, 
	salary_per_day FLOAT NOT NULL, 
	total_salary FLOAT NOT NULL, 
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	PRIMARY KEY (id)
)

;


-- Adding foreign key constraints

ALTER TABLE clients ADD CONSTRAINT fk_clients_users FOREIGN KEY(owner_id) REFERENCES users(id);
ALTER TABLE contract_details ADD CONSTRAINT fk_contract_details_contracts FOREIGN KEY(contract_id) REFERENCES contracts(id);
ALTER TABLE contracts ADD CONSTRAINT fk_contracts_clients FOREIGN KEY(client_id) REFERENCES clients(id);
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_contracts FOREIGN KEY(contract_id) REFERENCES contracts(id);
ALTER TABLE invoices_new ADD CONSTRAINT fk_invoices_new_contracts FOREIGN KEY(contract_id) REFERENCES contracts(id);

SET FOREIGN_KEY_CHECKS=1;