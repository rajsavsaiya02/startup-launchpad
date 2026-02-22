require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const { pool } = require("../database");

const seedTasks = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get a user to attach tasks to
    const userResult = await client.query("SELECT id FROM users LIMIT 1");
    if (userResult.rows.length === 0) {
      console.log("No users found. Please create a user first.");
      return;
    }
    const userId = userResult.rows[0].id;

    // Get all projects
    const projectResult = await client.query("SELECT id, title FROM projects");
    if (projectResult.rows.length === 0) {
      console.log("No projects found. Please create a project first.");
      return;
    }
    const projects = projectResult.rows;

    console.log(`Found ${projects.length} projects. Seeding tasks...`);

    const dummyTasksTemplate = [
      {
        title: "Design Landing Page Mockups",
        desc: "Create high-fidelity mockups for the new homepage.",
        status: "todo",
        priority: "High",
      },
      {
        title: "Develop User Authentication Flow",
        desc: "Implement sign-up, login, and password reset.",
        status: "todo",
        priority: "Medium",
      },
      {
        title: "Setup Staging Environment",
        desc: "Configure the server and deployment pipeline.",
        status: "todo",
        priority: "High",
      },
      {
        title: "Write Homepage Copy",
        desc: "Draft compelling copy for the main sections.",
        status: "progress",
        priority: "Low",
      },
      {
        title: "Finalize Brand Style Guide",
        desc: "Complete the documentation for colors and typography.",
        status: "done",
        priority: "Medium",
      },
      {
        title: "Project Kick-off Meeting",
        desc: "Initial meeting with all stakeholders.",
        status: "done",
        priority: "Low",
      },
      {
        title: "Integrate Payment Gateway",
        desc: "Connect Stripe API for subscription handling.",
        status: "todo",
        priority: "High",
      },
      {
        title: "Optimize DB Queries",
        desc: "Review slow queries and add indexes.",
        status: "progress",
        priority: "Medium",
      },
      {
        title: "Create Marketing Assets",
        desc: "Design banners and social media posts.",
        status: "todo",
        priority: "Medium",
      },
      {
        title: "Write API Documentation",
        desc: "Document all endpoints in Swagger.",
        status: "todo",
        priority: "Low",
      },
      {
        title: "Fix Navigation Bug",
        desc: "Resolve issue with mobile menu toggle.",
        status: "done",
        priority: "High",
      },
      {
        title: "Implement Search Feature",
        desc: "Add full-text search capability.",
        status: "progress",
        priority: "High",
      },
      {
        title: "Review User Feedback",
        desc: "Analyze beta tester feedback for UI improvements.",
        status: "todo",
        priority: "Low",
      },
      {
        title: "Update Privacy Policy",
        desc: "Ensure latest compliance requirements are met.",
        status: "done",
        priority: "High",
      },
      {
        title: "Migrate Old Data",
        desc: "Move legacy data to the new schema.",
        status: "progress",
        priority: "Medium",
      },
      {
        title: "Conduct Security Audit",
        desc: "Hire external firm to review codebase.",
        status: "todo",
        priority: "High",
      },
      {
        title: "Setup CI/CD Pipeline",
        desc: "Automate testing and deployment to production.",
        status: "done",
        priority: "Medium",
      },
      {
        title: "Refactor Authentication Logic",
        desc: "Clean up code and improve security for JWT handling.",
        status: "todo",
        priority: "Medium",
      },
      {
        title: "Create User Onboarding Tutorial",
        desc: "Build an interactive guide for new sign-ups.",
        status: "progress",
        priority: "Low",
      },
      {
        title: "Resolve Memory Leak in Node Process",
        desc: "Investigate and fix memory ballooning in worker threads.",
        status: "todo",
        priority: "High",
      },
    ];

    let totalSeeded = 0;

    for (const project of projects) {
      console.log(
        `Seeding tasks for project: ${project.title} (ID: ${project.id})`,
      );
      for (const task of dummyTasksTemplate) {
        await client.query(
          `
           INSERT INTO tasks (project_id, title, description, kanban_status, priority, created_by)
           VALUES ($1, $2, $3, $4, $5, $6)
         `,
          [
            project.id,
            task.title,
            task.desc,
            task.status,
            task.priority,
            userId,
          ],
        );
        totalSeeded++;
      }
    }

    await client.query("COMMIT");
    console.log(
      `Successfully seeded ${totalSeeded} tasks across ${projects.length} projects!`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error seeding tasks:", error);
  } finally {
    client.release();
    pool.end();
  }
};

seedTasks();
