const { pool } = require("../database");
const { Parser } = require("json2csv");

const orgFinanceController = {
  /**
   * 1. Get Organizational Financial Overview Metrics
   * Consolidates Org-level transactions and isolated Project expenses.
   */
  getOverviewMetrics: async (req, res) => {
    const orgId = req.org?.organization_id;
    if (!orgId)
      return res.status(400).json({ error: "Missing organization context" });

    try {
      // 1. Get total Organization Income (from financial_transactions)
      const incomeQuery = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM financial_transactions WHERE organization_id = $1 AND transaction_type = 'INCOME' AND status != 'CANCELLED'",
        [orgId],
      );
      const totalIncome = parseFloat(incomeQuery.rows[0].total);

      // 2. Get total Organization Expenses (from financial_transactions)
      const orgExpenseQuery = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) as total FROM financial_transactions WHERE organization_id = $1 AND transaction_type = 'EXPENSE' AND status != 'CANCELLED'",
        [orgId],
      );
      const orgExpenses = parseFloat(orgExpenseQuery.rows[0].total);

      // 3. Get total Project Expenses associated with this organization
      const projExpenseQuery = await pool.query(
        `
        SELECT COALESCE(SUM(pe.amount), 0) as total
        FROM project_expenses pe
        JOIN projects p ON pe.project_id = p.id
        WHERE p.owner_org_id = $1 AND pe.status != 'Refunded' AND pe.status != 'Cancelled'
      `,
        [orgId],
      );
      const projExpenses = parseFloat(projExpenseQuery.rows[0].total);

      const totalExpenses = orgExpenses + projExpenses;
      const netCashflow = totalIncome - totalExpenses;

      // Simplistic Health Score logic (can be expanded with AI later)
      let healthScore = 80; // base score
      if (netCashflow > 0) healthScore += 10;
      if (totalExpenses > totalIncome && totalIncome > 0) healthScore -= 20;
      if (totalIncome === 0 && totalExpenses > 0) healthScore -= 30;

      res.status(200).json({
        metrics: {
          totalIncome,
          totalExpenses,
          orgExpenses,
          projExpenses,
          netCashflow,
          healthScore: Math.max(0, Math.min(100, healthScore)),
        },
      });
    } catch (error) {
      console.error("Error fetching financial overview:", error);
      res.status(500).json({ error: "Failed to fetch overview metrics" });
    }
  },

  /**
   * 2. Get Organizational Transactions (Ledger)
   */
  getTransactions: async (req, res) => {
    const orgId = req.org?.organization_id;
    const { page = 1, limit = 20, type = "ALL", category = "ALL" } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let queryParams = [orgId];
    let whereClause = "WHERE t.organization_id = $1";

    if (type !== "ALL" && (type === "INCOME" || type === "EXPENSE")) {
      queryParams.push(type);
      whereClause += ` AND t.transaction_type = $${queryParams.length}`;
    }

    if (category !== "ALL" && !isNaN(parseInt(category))) {
      queryParams.push(parseInt(category));
      whereClause += ` AND t.category_id = $${queryParams.length}`;
    }

    try {
      const queryStr = `
        SELECT t.*, c.name as category_name, cl.name as classification_name, cl.root_type, u.name as creator_name
        FROM financial_transactions t
        LEFT JOIN fin_coa_category c ON t.category_id = c.id
        LEFT JOIN fin_coa_classification cl ON c.classification_id = cl.id
        LEFT JOIN users u ON t.created_by_id = u.id
        ${whereClause}
        ORDER BY t.expense_date DESC, t.created_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      const limitOffsetParams = [...queryParams, parseInt(limit), offset];

      const countQueryStr = `SELECT COUNT(*) FROM financial_transactions t ${whereClause}`;

      const [txRes, countRes] = await Promise.all([
        pool.query(queryStr, limitOffsetParams),
        pool.query(countQueryStr, queryParams),
      ]);

      const totalElements = parseInt(countRes.rows[0].count);
      const totalPages = Math.ceil(totalElements / parseInt(limit));

      res.status(200).json({
        transactions: txRes.rows,
        pagination: {
          totalElements,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  },

  /**
   * 3. Add Transaction (ACID compliant)
   */
  addTransaction: async (req, res) => {
    const orgId = req.org?.organization_id;
    const userId = req.user?.id;
    const {
      transaction_type,
      category_id,
      amount,
      description,
      vendor_name,
      expense_date,
      currency = "USD",
    } = req.body;

    if (!transaction_type || !amount || !description || !expense_date) {
      return res
        .status(400)
        .json({ error: "Missing required transaction fields" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        INSERT INTO financial_transactions 
        (organization_id, transaction_type, category_id, amount, currency, description, vendor_name, expense_date, created_by_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
        [
          orgId,
          transaction_type,
          category_id || null,
          parseFloat(amount),
          currency,
          description,
          vendor_name,
          expense_date,
          userId,
        ],
      );

      await client.query("COMMIT");
      res.status(201).json({
        message: "Transaction added successfully",
        transaction: result.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error adding transaction:", error);
      res.status(500).json({ error: "Failed to add transaction" });
    } finally {
      client.release();
    }
  },

  /**
   * 3a. Update Transaction
   */
  updateTransaction: async (req, res) => {
    const orgId = req.org?.organization_id;
    const txId = req.params.id;
    const {
      transaction_type,
      category_id,
      amount,
      description,
      vendor_name,
      expense_date,
      status,
    } = req.body;

    try {
      const result = await pool.query(
        `
        UPDATE financial_transactions 
        SET 
          transaction_type = COALESCE($1, transaction_type),
          category_id = $2,
          amount = COALESCE($3, amount),
          description = COALESCE($4, description),
          vendor_name = COALESCE($5, vendor_name),
          expense_date = COALESCE($6, expense_date),
          status = COALESCE($7, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 AND organization_id = $9
        RETURNING *
      `,
        [
          transaction_type,
          category_id || null,
          amount ? parseFloat(amount) : null,
          description,
          vendor_name,
          expense_date,
          status,
          txId,
          orgId,
        ],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.status(200).json({
        message: "Transaction updated successfully",
        transaction: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  },

  /**
   * 3b. Delete Transaction
   */
  deleteTransaction: async (req, res) => {
    const orgId = req.org?.organization_id;
    const txId = req.params.id;

    try {
      const result = await pool.query(
        "DELETE FROM financial_transactions WHERE id = $1 AND organization_id = $2 RETURNING id",
        [txId, orgId],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  },

  /**
   * 4. Export Consolidated Financial Data (CSV)
   */
  exportFinancialData: async (req, res) => {
    const orgId = req.org?.organization_id;

    try {
      // Fetch Org Transactions
      const orgTxRes = await pool.query(
        `
        SELECT 
          'Organization' as source,
          t.transaction_type,
          t.expense_date as date,
          t.amount,
          t.currency,
          c.name as category,
          cl.name as classification,
          t.description,
          t.vendor_name,
          t.status
        FROM financial_transactions t
        LEFT JOIN fin_coa_category c ON t.category_id = c.id
        LEFT JOIN fin_coa_classification cl ON c.classification_id = cl.id
        WHERE t.organization_id = $1
      `,
        [orgId],
      );

      // Fetch Project Expenses
      const projTxRes = await pool.query(
        `
        SELECT 
          CONCAT('Project: ', p.title) as source,
          'EXPENSE' as transaction_type,
          pe.expense_date as date,
          pe.amount,
          'USD' as currency,
          pe.category,
          pe.category as classification,
          pe.description,
          pe.vendor_name,
          pe.status
        FROM project_expenses pe
        JOIN projects p ON pe.project_id = p.id
        WHERE p.owner_org_id = $1
      `,
        [orgId],
      );

      const allRecords = [...orgTxRes.rows, ...projTxRes.rows];

      // Sort by date descending
      allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

      const fields = [
        "source",
        "transaction_type",
        "date",
        "amount",
        "currency",
        "category",
        "classification",
        "description",
        "vendor_name",
        "status",
      ];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(allRecords);

      res.header("Content-Type", "text/csv");
      res.attachment("startup_financial_export.csv");
      return res.send(csv);
    } catch (error) {
      console.error("Error exporting financial data:", error);
      res.status(500).json({ error: "Failed to export financial data" });
    }
  },

  /**
   * 5. Get Fin Config & Categories
   */
  getConfig: async (req, res) => {
    const orgId = req.org?.organization_id;

    try {
      const configRes = await pool.query(
        "SELECT * FROM fin_config_profile WHERE organization_id = $1",
        [orgId],
      );
      const classificationsRes = await pool.query(
        "SELECT * FROM fin_coa_classification WHERE organization_id = $1 OR is_system = true ORDER BY name ASC",
        [orgId],
      );
      const categoriesRes = await pool.query(
        `SELECT c.*, cl.root_type 
         FROM fin_coa_category c
         LEFT JOIN fin_coa_classification cl ON c.classification_id = cl.id
         WHERE c.organization_id = $1 OR c.is_system = true 
         ORDER BY c.name ASC`,
        [orgId],
      );

      let profile = configRes.rows[0];
      if (!profile) {
        // Create default profile
        const newProfile = await pool.query(
          "INSERT INTO fin_config_profile (organization_id, base_currency, compliance_fields) VALUES ($1, 'INR', '[]'::jsonb) RETURNING *",
          [orgId],
        );
        profile = newProfile.rows[0];
      }

      res.status(200).json({
        profile,
        classifications: classificationsRes.rows,
        categories: categoriesRes.rows,
      });
    } catch (error) {
      console.error("Error fetching config:", error);
      res.status(500).json({ error: "Failed to fetch financial config" });
    }
  },

  /**
   * 6. Update Config Profile
   */
  updateConfig: async (req, res) => {
    const orgId = req.org?.organization_id;
    const { base_currency, gst_registered, gstin, financial_year_start_month, compliance_fields } =
      req.body;

    // RBAC: Assume middleware ensures requester has rights, but can enforce here if needed.

    try {
      const result = await pool.query(
        `
        UPDATE fin_config_profile 
        SET 
          base_currency = COALESCE($1, base_currency),
          gst_registered = COALESCE($2, gst_registered),
          gstin = COALESCE($3, gstin),
          financial_year_start_month = COALESCE($4, financial_year_start_month),
          compliance_fields = COALESCE($5, compliance_fields),
          updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = $6
        RETURNING *
      `,
        [
          base_currency,
          gst_registered,
          gstin,
          financial_year_start_month,
          compliance_fields ? JSON.stringify(compliance_fields) : null,
          orgId,
        ],
      );

      res.status(200).json({
        message: "Config updated successfully",
        profile: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating config:", error);
      res.status(500).json({ error: "Failed to update config" });
    }
  },

  /**
   * 7. Add COA Category
   */
  addCategory: async (req, res) => {
    const orgId = req.org?.organization_id;
    const { name, classification_id, description } = req.body;

    if (!name || !classification_id)
      return res.status(400).json({ error: "Name and classification are required" });

    try {
      // Get the classification to copy the root_type to the category's type column
      const classRes = await pool.query(`SELECT root_type FROM fin_coa_classification WHERE id = $1`, [classification_id]);
      if (classRes.rowCount === 0) return res.status(404).json({ error: "Classification not found" });
      const rootType = classRes.rows[0].root_type;

      const result = await pool.query(
        `
        INSERT INTO fin_coa_category (organization_id, name, type, classification_id, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
        [orgId, name, rootType, classification_id, description],
      );

      res.status(201).json({
        message: "Category created successfully",
        category: result.rows[0],
      });
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  },

  deleteCategory: async (req, res) => {
    const orgId = req.org?.organization_id;
    const categoryId = req.params.id;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Check if it's a system category
      const checkRes = await client.query("SELECT is_system FROM fin_coa_category WHERE id = $1 AND organization_id = $2", [categoryId, orgId]);
      if (checkRes.rowCount === 0) return res.status(404).json({ error: "Category not found or unauthorized" });
      if (checkRes.rows[0].is_system) return res.status(403).json({ error: "Cannot delete system categories" });

      // Find the "General" category
      const genCatRes = await client.query("SELECT id FROM fin_coa_category WHERE name = 'General' AND is_system = true LIMIT 1");
      const generalId = genCatRes.rows[0]?.id;
      if (!generalId) throw new Error("General category not found");

      // Reassign transactions
      await client.query("UPDATE financial_transactions SET category_id = $1 WHERE category_id = $2", [generalId, categoryId]);

      // Delete the category
      await client.query("DELETE FROM fin_coa_category WHERE id = $1 AND organization_id = $2", [categoryId, orgId]);

      await client.query("COMMIT");
      res.status(200).json({ message: "Category deleted and transactions reassigned" });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    } finally {
      client.release();
    }
  },

  addClassification: async (req, res) => {
    const orgId = req.org?.organization_id;
    const { name, root_type } = req.body;

    if (!name || !root_type) return res.status(400).json({ error: "Name and root_type are required" });

    try {
      const result = await pool.query(
        `INSERT INTO fin_coa_classification (organization_id, name, root_type) VALUES ($1, $2, $3) RETURNING *`,
        [orgId, name, root_type]
      );
      res.status(201).json({ message: "Classification created", classification: result.rows[0] });
    } catch (error) {
      console.error("Error adding classification:", error);
      res.status(500).json({ error: "Failed to create classification" });
    }
  },

  deleteClassification: async (req, res) => {
    const orgId = req.org?.organization_id;
    const classificationId = req.params.id;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      const checkRes = await client.query("SELECT is_system FROM fin_coa_classification WHERE id = $1 AND organization_id = $2", [classificationId, orgId]);
      if (checkRes.rowCount === 0) return res.status(404).json({ error: "Classification not found or unauthorized" });
      if (checkRes.rows[0].is_system) return res.status(403).json({ error: "Cannot delete system classifications" });

      // First find all categories belonging to this classification
      const catsRes = await client.query("SELECT id FROM fin_coa_category WHERE classification_id = $1", [classificationId]);
      const catIds = catsRes.rows.map(r => r.id);

      // Reassign transactions for all those categories to General
      const genCatRes = await client.query("SELECT id FROM fin_coa_category WHERE name = 'General' AND is_system = true LIMIT 1");
      const generalId = genCatRes.rows[0]?.id;

      if (catIds.length > 0 && generalId) {
        await client.query("UPDATE financial_transactions SET category_id = $1 WHERE category_id = ANY($2::int[])", [generalId, catIds]);
      }

      // Delete the categories
      if (catIds.length > 0) {
        await client.query("DELETE FROM fin_coa_category WHERE classification_id = $1", [classificationId]);
      }

      // Finally delete the classification itself
      await client.query("DELETE FROM fin_coa_classification WHERE id = $1 AND organization_id = $2", [classificationId, orgId]);

      await client.query("COMMIT");
      res.status(200).json({ message: "Classification deleted" });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error deleting classification:", error);
      res.status(500).json({ error: "Failed to delete classification" });
    } finally {
      client.release();
    }
  },
};

module.exports = orgFinanceController;
