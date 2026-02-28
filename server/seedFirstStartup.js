const { pool } = require("./src/database");

async function seedFirstStartup() {
  try {
    console.log("Starting seeding for FIRSTSTARTUP...");

    // 1. Find the organization FIRSTSTARTUP
    const orgRes = await pool.query(
      `SELECT organization_id FROM organizations WHERE name = 'FIRSTSTARTUP' LIMIT 1`,
    );
    if (orgRes.rows.length === 0) {
      console.error("FIRSTSTARTUP organization not found.");
      process.exit(1);
    }
    const orgId = orgRes.rows[0].organization_id;

    // 2. Get some users from who belong to FIRSTSTARTUP
    const usersRes = await pool.query(
      `
      SELECT user_id FROM organization_members WHERE organization_id = $1
    `,
      [orgId],
    );

    if (usersRes.rows.length === 0) {
      console.error("No members found in FIRSTSTARTUP.");
      process.exit(1);
    }
    const memberIds = usersRes.rows.map((row) => row.user_id);
    const ownerId = memberIds[0];

    // 3. Create dummy projects
    const projects = [
      {
        title: "Platform Scalability Initiative",
        description:
          "Upgrade the core infrastructure to support 10x user growth. Focus on database clustering and aggressive caching strategies.",
        status: "Active",
        priority: "High",
        category: "Engineering",
        start_date: new Date(),
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        progress: 15,
      },
      {
        title: "Q4 Marketing Campaign",
        description:
          "End of year marketing push across all major social platforms, targeting enterprise clients.",
        status: "Planning",
        priority: "Medium",
        category: "Marketing",
        start_date: new Date(),
        due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
        progress: 0,
      },
    ];

    for (const p of projects) {
      const pRes = await pool.query(
        `
        INSERT INTO projects (title, description, status, priority, category, start_date, due_date, progress, owner_org_id, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `,
        [
          p.title,
          p.description,
          p.status,
          p.priority,
          p.category,
          p.start_date,
          p.due_date,
          p.progress,
          orgId,
          ownerId,
        ],
      );

      const projectId = pRes.rows[0].id;

      // Add members to project
      for (const uid of memberIds) {
        await pool.query(
          `
          INSERT INTO project_members (project_id, user_id, role)
          VALUES ($1, $2, 'member')
          ON CONFLICT DO NOTHING
        `,
          [projectId, uid],
        );
      }

      // Make owner the owner in project_members
      await pool.query(
        `
        UPDATE project_members SET role = 'owner' WHERE project_id = $1 AND user_id = $2
      `,
        [projectId, ownerId],
      );

      // Seed activity
      await pool.query(
        `
        INSERT INTO project_activities (project_id, user_id, content) VALUES ($1, $2, $3)
      `,
        [
          projectId,
          ownerId,
          `<p>Project initialized by FIRSTSTARTUP Seeder.</p>`,
        ],
      );

      // Seed some tasks
      await pool.query(
        `
        INSERT INTO tasks (project_id, title, description, priority, organization_id, kanban_status, created_by)
        VALUES 
        ($1, 'Database Sharding', 'Research database sharding for Postgres', 'High', $2, 'In Progress', $3),
        ($1, 'API Rate Limiting', 'Implement Redis based rate limiting', 'Medium', $2, 'To Do', $3)
      `,
        [projectId, orgId, ownerId],
      );

      try {
        await pool.query(
          `
          INSERT INTO project_expenses (project_id, description, category, vendor_name, amount, expense_date, status)
          VALUES 
          ($1, 'AWS Infrastructure setup', 'Software', 'Amazon Web Services', 1500.00, CURRENT_DATE, 'Paid')
        `,
          [projectId],
        );
      } catch (e) {
        console.log(
          "Could not insert expenses, table might differ or not exist:",
          e.message,
        );
      }

      console.log(
        `Seeded length FIRSTSTARTUP project: ${p.title} (ID: ${projectId})`,
      );
    }

    console.log("Successfully seeded FIRSTSTARTUP data.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedFirstStartup();
