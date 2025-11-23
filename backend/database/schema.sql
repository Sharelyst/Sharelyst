-- Sharelyst Database Schema
-- PostgreSQL/MySQL compatible schema for payment tracking and group transactions
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    group_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(group_number) ON DELETE
    SET NULL
);
-- Groups Table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_number INTEGER UNIQUE NOT NULL CHECK (
        group_number >= 100000
        AND group_number <= 999999
    ),
    name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Transactions Table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    transaction_id INTEGER UNIQUE NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    split BOOLEAN DEFAULT false,
    group_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);
-- Payments Table (individual payments within a transaction)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    user_id INTEGER NOT NULL,
    transaction_id INTEGER,
    group_id INTEGER,
    payment_type VARCHAR(50) DEFAULT 'transaction',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CHECK (
        transaction_id IS NOT NULL
        OR group_id IS NOT NULL
    )
);
-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_group_id ON users(group_id);
CREATE INDEX idx_groups_group_number ON groups(group_number);
CREATE INDEX idx_transactions_group_id ON transactions(group_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_group_id ON payments(group_id);
-- Trigger to update updated_at timestamp (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE
UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE
UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE
UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();