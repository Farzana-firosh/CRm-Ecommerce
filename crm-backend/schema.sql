-- CRM Database Schema
-- This file contains all the table definitions needed for the CRM system

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) DEFAULT 'Product',
    description TEXT,
    unit_of_measure VARCHAR(50) NOT NULL,
    default_rate DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    reference_no VARCHAR(100) UNIQUE NOT NULL,
    created_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Draft',
    total_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create quotation_versions table
CREATE TABLE IF NOT EXISTS quotation_versions (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER REFERENCES quotations(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft',
    quotation_date DATE,
    validity_date DATE,
    contact_info TEXT,
    remarks TEXT,
    terms_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sales_orders table
CREATE TABLE IF NOT EXISTS sales_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    quotation_id INTEGER REFERENCES quotations(id),
    status VARCHAR(50) DEFAULT 'Draft',
    total_amount DECIMAL(10,2) DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    sales_order_id INTEGER REFERENCES sales_orders(id),
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'Draft',
    total_amount DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_type VARCHAR(20),
    discount_value DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    taxable_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_date DATE NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
    id SERIAL PRIMARY KEY,
    currency_code VARCHAR(10) UNIQUE NOT NULL,
    currency_name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(10,4) DEFAULT 1.0
);

-- Create tax_settings table
CREATE TABLE IF NOT EXISTS tax_settings (
    id SERIAL PRIMARY KEY,
    tax_name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create organization_info table
CREATE TABLE IF NOT EXISTS organization_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_info TEXT,
    logo_url VARCHAR(500),
    currency_id INTEGER REFERENCES currencies(id),
    default_tax_id INTEGER REFERENCES tax_settings(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (role_name) VALUES 
    ('Admin'),
    ('Sales'),
    ('Finance'),
    ('Manager')
ON CONFLICT (role_name) DO NOTHING;

-- Insert default currencies
INSERT INTO currencies (currency_code, currency_name, symbol, exchange_rate) VALUES 
    ('USD', 'US Dollar', '$', 1.0),
    ('EUR', 'Euro', '€', 0.85),
    ('GBP', 'British Pound', '£', 0.73)
ON CONFLICT (currency_code) DO NOTHING;

-- Insert default tax settings
INSERT INTO tax_settings (tax_name, rate, description) VALUES 
    ('VAT', 20.0, 'Value Added Tax'),
    ('Sales Tax', 8.5, 'Sales Tax'),
    ('No Tax', 0.0, 'No Tax Applied')
ON CONFLICT DO NOTHING;

-- Insert test users
INSERT INTO users (name, email, password) VALUES 
    ('Admin User', 'admin@example.com', '$2b$10$vEkyLIsSuwmiO0Q87WmkI.Tgrn4YyWphj80zvXXb8qMtUte78r0v6'), -- password: admin123
    ('Sales User', 'sales@example.com', '$2b$10$r3jAcrc8K44dbvdIx63hyuCNfxzDCuzVdkzGFlKfU7ieelmoNddGm'), -- password: sales123
    ('Finance User', 'finance@example.com', '$2b$10$3fXkYnljoPaUCrRitJqb0uKZ5YlIo2iJMLFBdJa7TbQYoSvSDKiaO') -- password: finance123
ON CONFLICT (email) DO NOTHING;

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id) VALUES 
    (1, 1), -- Admin user gets Admin role
    (2, 2), -- Sales user gets Sales role
    (3, 3)  -- Finance user gets Finance role
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Insert sample items
INSERT INTO items (name, item_type, description, unit_of_measure, default_rate, tax_rate, status) VALUES 
    ('Laptop Computer', 'Product', 'High-performance laptop for business use', 'Unit', 1200.00, 10.0, 'Active'),
    ('Office Chair', 'Product', 'Ergonomic office chair', 'Unit', 150.00, 8.5, 'Active'),
    ('Consulting Service', 'Service', 'Professional consulting services', 'Hour', 100.00, 0.0, 'Active'),
    ('Software License', 'Product', 'Annual software license', 'License', 500.00, 20.0, 'Active'),
    ('Maintenance Service', 'Service', 'Monthly maintenance service', 'Month', 200.00, 0.0, 'Active')
ON CONFLICT DO NOTHING;

-- Insert sample data for dashboard
INSERT INTO customers (name, email, phone) VALUES 
    ('ABC Company', 'contact@abc.com', '+1-555-0123'),
    ('XYZ Corp', 'info@xyz.com', '+1-555-0456'),
    ('Tech Solutions', 'hello@tech.com', '+1-555-0789')
ON CONFLICT DO NOTHING;

INSERT INTO items (name, description, unit_price) VALUES 
    ('Web Development', 'Custom web application development', 5000.00),
    ('Mobile App', 'iOS and Android mobile application', 8000.00),
    ('Consulting', 'Technical consulting services', 150.00)
ON CONFLICT DO NOTHING;

-- Insert sample quotations
INSERT INTO quotations (customer_name, reference_no, created_by, status, total_amount) VALUES 
    ('ABC Company', 'Q-001', 1, 'Draft', 2500.00),
    ('XYZ Corp', 'Q-002', 2, 'Submitted', 3500.00),
    ('Tech Solutions', 'Q-003', 1, 'Approved', 5000.00)
ON CONFLICT (reference_no) DO NOTHING;

-- Insert sample sales orders
INSERT INTO sales_orders (order_number, customer_id, quotation_id, status, total_amount, created_by) VALUES 
    ('SO-001', 1, 1, 'Draft', 2500.00, 1),
    ('SO-002', 2, 2, 'Confirmed', 3500.00, 2),
    ('SO-003', 3, 3, 'Shipped', 5000.00, 1)
ON CONFLICT (order_number) DO NOTHING;

-- Insert sample invoices
INSERT INTO invoices (invoice_number, customer_id, invoice_date, due_date, sales_order_id, status, total_amount, balance_due, created_by) VALUES 
    ('INV-001', 1, '2024-01-15', '2024-02-15', 1, 'Draft', 2500.00, 2500.00, 1),
    ('INV-002', 2, '2024-01-20', '2024-02-20', 2, 'Sent', 3500.00, 3500.00, 2),
    ('INV-003', 3, '2024-01-25', '2024-02-25', 3, 'Paid', 5000.00, 0.00, 1),
    ('INV-004', 1, '2024-02-01', '2024-03-01', NULL, 'Unpaid', 1200.00, 1200.00, 1)
ON CONFLICT (invoice_number) DO NOTHING;
