const { pool } = require("../database");

const seedProject = async () => {
  try {
    console.log("Seeding dummy project...");

    // Get the first user
    const userResult = await pool.query("SELECT id FROM users LIMIT 1");
    if (userResult.rows.length === 0) {
      console.error("No users found. Please create a user first.");
      process.exit(1);
    }
    const userId = userResult.rows[0].id;

    // Check if project exists
    const projectCheck = await pool.query(
      "SELECT * FROM projects WHERE title = 'Website Redesign 2.0'",
    );
    if (projectCheck.rows.length > 0) {
      console.log("Dummy project already exists.");
      process.exit(0);
    }

    // Insert project
    const result = await pool.query(
      `INSERT INTO projects 
       (title, description, status, priority, start_date, due_date, owner_user_id, created_by, progress)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        "Website Redesign 2.0",
        "Revamping the marketing site with new branding.",
        "Active",
        "High",
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        userId,
        userId,
        25,
      ],
    );

    const newProject = result.rows[0];

    // Add member
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [newProject.id, userId],
    );

    console.log(
      `Dummy project 'Website Redesign 2.0' created for user ID ${userId}.`,
    );
    process.exit(0);
  } catch (err) {
    console.error("Error seeding project:", err);
    process.exit(1);
  }
};

seedProject();
