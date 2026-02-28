const { pool } = require("../database");

const createOrgFinanceTables = async () => {
  try {
    console.log("Creating Organization Finance tables...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS fin_config_profile (
          id SERIAL PRIMARY KEY,
          organization_id INTEGER UNIQUE REFERENCES organizations(organization_id) ON DELETE CASCADE,
          base_currency VARCHAR(10) DEFAULT 'INR',
          gst_registered BOOLEAN DEFAULT FALSE,
          gstin VARCHAR(50),
          financial_year_start_month INTEGER DEFAULT 4, -- April for India
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fin_coa_category (
          id SERIAL PRIMARY KEY,
          organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
          description TEXT,
          is_system BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fin_approval_rule (
          id SERIAL PRIMARY KEY,
          organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
          category_id INTEGER REFERENCES fin_coa_category(id) ON DELETE CASCADE,
          min_amount NUMERIC(15, 2) DEFAULT 0,
          max_amount NUMERIC(15, 2),
          approver_role VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fin_capital_tranche (
          id SERIAL PRIMARY KEY,
          organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          amount NUMERIC(15, 2) NOT NULL,
          currency VARCHAR(10) DEFAULT 'INR',
          received_date DATE NOT NULL,
          investor_name VARCHAR(255),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fin_tax_mandate (
          id SERIAL PRIMARY KEY,
          organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
          category_id INTEGER REFERENCES fin_coa_category(id) ON DELETE CASCADE,
          tax_type VARCHAR(50) NOT NULL, -- 'GST', 'TDS'
          tax_rate NUMERIC(5, 2) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS financial_transactions (
          id SERIAL PRIMARY KEY,
          organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
          project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
          transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('INCOME', 'EXPENSE')),
          category_id INTEGER REFERENCES fin_coa_category(id) ON DELETE RESTRICT,
          amount NUMERIC(15, 2) NOT NULL,
          currency VARCHAR(10) DEFAULT 'INR',
          description TEXT NOT NULL,
          vendor_name VARCHAR(255),
          status VARCHAR(50) DEFAULT 'POSTED',
          receipt_url TEXT,
          expense_date DATE NOT NULL,
          created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_fin_tx_org ON financial_transactions(organization_id);
      CREATE INDEX IF NOT EXISTS idx_fin_tx_project ON financial_transactions(project_id);
    `);

    console.log("Organization Finance tables created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    pool.end();
  }
};

createOrgFinanceTables();
