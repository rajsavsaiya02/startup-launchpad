const { pool } = require("../database");

const getFinancialSummary = async (req, res) => {
  try {
    const { id: projectId } = req.params;

    // 1. Get project budget
    const projectRes = await pool.query(
      "SELECT budget FROM projects WHERE id = $1",
      [projectId],
    );

    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    const budget = parseFloat(projectRes.rows[0].budget) || 0;

    // 2. Calculate actual spent from project_expenses based on status
    const expenseRes = await pool.query(
      `SELECT 
          SUM(
            CASE 
              WHEN status IN ('Paid', 'Partially', 'Pending', 'Allocated', 'Recurring') THEN amount 
              WHEN status = 'Refunded' THEN -amount
              ELSE 0 
            END
          ) as total_spent 
       FROM project_expenses 
       WHERE project_id = $1`,
      [projectId],
    );

    const totalSpent = parseFloat(expenseRes.rows[0].total_spent) || 0;
    const remaining = budget - totalSpent;

    return res.status(200).json({
      budget,
      totalSpent,
      remaining,
    });
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { budget } = req.body;

    if (budget === undefined || isNaN(budget) || parseFloat(budget) < 0) {
      return res.status(400).json({ error: "Invalid budget value" });
    }

    const result = await pool.query(
      "UPDATE projects SET budget = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING budget",
      [parseFloat(budget), projectId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({
      message: "Budget updated successfully",
      budget: parseFloat(result.rows[0].budget),
    });
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      category = "",
    } = req.query;

    const isExport = limit === "all";
    const offset = isExport ? 0 : (parseInt(page) - 1) * parseInt(limit);
    const queryLimit = isExport
      ? ""
      : `LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    let queryParams = [projectId];
    let whereClause = "WHERE project_id = $1";

    // Build dynamic WHERE clause based on filters
    if (search) {
      queryParams.push(`%${search}%`);
      whereClause += ` AND (description ILIKE $${queryParams.length} OR brief ILIKE $${queryParams.length} OR vendor_name ILIKE $${queryParams.length})`;
    }

    if (status) {
      queryParams.push(status);
      whereClause += ` AND status = $${queryParams.length}`;
    }

    if (category) {
      queryParams.push(category);
      whereClause += ` AND category = $${queryParams.length}`;
    }

    // Main Query
    const queryStr = `
            SELECT 
                pe.*, 
                COALESCE(
                  (
                    SELECT json_agg(json_build_object(
                      'file_asset_id', fa.file_asset_id,
                      'attachment_name', fa.file_name,
                      'attachment_url', fa.storage_url,
                      'attachment_type', fa.mime_type
                    ))
                    FROM expense_attachments ea
                    JOIN file_assets fa ON ea.file_asset_id = fa.file_asset_id
                    WHERE ea.expense_id = pe.id
                  ),
                  '[]'::json
                ) as attachments
            FROM project_expenses pe
            ${whereClause} 
            ORDER BY pe.expense_date DESC 
            ${queryLimit}
        `;

    // Count total for pagination
    const countQueryStr = `SELECT COUNT(*) as total FROM project_expenses pe ${whereClause}`;

    const [expensesRes, countRes] = await Promise.all([
      pool.query(queryStr, queryParams),
      pool.query(countQueryStr, queryParams),
    ]);

    const totalElements = parseInt(countRes.rows[0].total);
    const totalPages = isExport
      ? 1
      : Math.ceil(totalElements / parseInt(limit));

    res.status(200).json({
      expenses: expensesRes.rows,
      pagination: {
        totalElements,
        totalPages,
        currentPage: isExport ? 1 : parseInt(page),
        limit: isExport ? totalElements : parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const createExpense = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const {
      description,
      brief,
      category,
      vendor_name,
      expense_date,
      amount,
      status,
      attachment_ids,
      payment_modes, // Array of type [{mode: 'Bank', amount: 100}]
    } = req.body;

    if (!description || !category || !expense_date || amount === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `
            INSERT INTO project_expenses 
            (project_id, description, brief, category, vendor_name, expense_date, amount, status, payment_modes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `,
      [
        projectId,
        description,
        brief || null,
        category,
        vendor_name || null,
        expense_date,
        parseFloat(amount),
        status || "Pending",
        payment_modes ? JSON.stringify(payment_modes) : "[]",
      ],
    );

    const expenseId = result.rows[0].id;

    if (
      attachment_ids &&
      Array.isArray(attachment_ids) &&
      attachment_ids.length > 0
    ) {
      const values = attachment_ids
        .map((id) => `(${expenseId}, ${parseInt(id)})`)
        .join(",");
      await pool.query(
        `INSERT INTO expense_attachments (expense_id, file_asset_id) VALUES ${values} ON CONFLICT DO NOTHING`,
      );
    }

    res.status(201).json({
      message: "Expense created successfully",
      expense: { ...result.rows[0], attachments: [] },
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id: projectId, expenseId } = req.params;
    const {
      description,
      brief,
      category,
      vendor_name,
      expense_date,
      amount,
      status,
      attachment_ids,
      payment_modes,
    } = req.body;

    const result = await pool.query(
      `
            UPDATE project_expenses 
            SET 
                description = COALESCE($1, description),
                brief = COALESCE($2, brief),
                category = COALESCE($3, category),
                vendor_name = COALESCE($4, vendor_name),
                expense_date = COALESCE($5, expense_date),
                amount = COALESCE($6, amount),
                status = COALESCE($7, status),
                payment_modes = COALESCE($8, payment_modes),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $9 AND project_id = $10
            RETURNING *
        `,
      [
        description,
        brief,
        category,
        vendor_name,
        expense_date,
        amount !== undefined ? parseFloat(amount) : undefined,
        status,
        payment_modes ? JSON.stringify(payment_modes) : undefined,
        expenseId,
        projectId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (attachment_ids && Array.isArray(attachment_ids)) {
      await pool.query(
        "DELETE FROM expense_attachments WHERE expense_id = $1",
        [expenseId],
      );
      if (attachment_ids.length > 0) {
        const values = attachment_ids
          .map((id) => `(${expenseId}, ${parseInt(id)})`)
          .join(",");
        await pool.query(
          `INSERT INTO expense_attachments (expense_id, file_asset_id) VALUES ${values} ON CONFLICT DO NOTHING`,
        );
      }
    }

    res.status(200).json({
      message: "Expense updated successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id: projectId, expenseId } = req.params;

    const result = await pool.query(
      "DELETE FROM project_expenses WHERE id = $1 AND project_id = $2 RETURNING id",
      [expenseId, projectId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getFinancialSummary,
  updateBudget,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
