/**
 * ============================================================
 *  seedProjectFull.js — Comprehensive Project & Task Seeder
 * ============================================================
 *  Injects multiple projects and tasks to showcase all aspects:
 *  - Diverse Project statuses, priorities, and budgets
 *  - Diverse Task statuses, subtasks, and time logs
 *  - Project Activity records
 *  - Project Expense records
 *  - Dummy resource links (via file_assets)
 *
 *  Usage:
 *    node server/src/scripts/db/seeders/seedProjectFull.js
 * ============================================================
 */

"use strict";

require("dotenv").config({
  path: require("path").resolve(__dirname, "../../../../.env"),
});
const { pool } = require("../../../database");

const seedProjectFull = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("🚀 Starting comprehensive seeding...");

    // 1. Fetch Specific User 'aryan_mehta'
    const targetUsername = "aryan_mehta";
    const userResult = await client.query("SELECT id FROM users WHERE username = $1", [targetUsername]);
    
    if (userResult.rows.length === 0) {
      console.error(`❌ User '${targetUsername}' not found. Seeding failed.`);
      return;
    }
    const userId = userResult.rows[0].id;

    // Fetch organization associated with this user
    const orgMemberResult = await client.query(
      "SELECT organization_id FROM organization_members WHERE user_id = $1 LIMIT 1",
      [userId]
    );
    
    const orgId = orgMemberResult.rows.length > 0 ? orgMemberResult.rows[0].organization_id : null;

    if (!orgId) {
      console.warn(`⚠️ User '${targetUsername}' has no organization. Creating projects and tasks without organization context.`);
    }

    // 2. Define Dummy Projects
    const dummyProjects = [
      {
        title: "Alpha Centauri Launchpad",
        description: "Building the next generation interstellar launch console.",
        status: "active",
        priority: "High",
        category: "Product Development",
        budget: 500000.00,
        progress: 45
      },
      {
        title: "Quantum Ledger Integration",
        description: "Migrating financial systems to post-quantum safe encryption.",
        status: "on-hold",
        priority: "Medium",
        category: "Security",
        budget: 250000.00,
        progress: 15
      },
      {
        title: "Neuro-Link Interface UI",
        description: "Designing the brain-computer interface dashboard for end-users.",
        status: "active",
        priority: "Critical",
        category: "UI/UX Design",
        budget: 120000.00,
        progress: 75
      }
    ];

    for (const p of dummyProjects) {
      console.log(`\n📦 Seeding Project: ${p.title}`);
      
      // Insert Project
      const projInsert = await client.query(
        `INSERT INTO projects 
         (title, description, status, priority, category, budget, progress, owner_user_id, owner_org_id, created_by, start_date, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          p.title,
          p.description,
          p.status,
          p.priority,
          p.category,
          p.budget,
          p.progress,
          userId,
          orgId,
          userId,
          new Date(),
          new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
        ]
      );
      const projectId = projInsert.rows[0].id;

      // Add project member
      await client.query(
        `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'owner')`,
        [projectId, userId]
      );

      // 3. Define Dummy Tasks
      const dummyTasks = [
        {
          title: "Initial Architecture Review",
          description: "Reviewing the proposed microservices architecture for scalability.",
          kanban_status: "done",
          priority: "High",
          category: "Planning",
          is_milestone: true,
          time_spent: 480
        },
        {
          title: "API Endpoint Implementation",
          description: "Developing core CRUD endpoints for the prototype.",
          kanban_status: "progress",
          priority: "Medium",
          category: "Development",
          time_spent: 120,
          time_logs: JSON.stringify([
            { start: new Date(Date.now() - 3600000), end: new Date(), duration: 60 },
            { start: new Date(Date.now() - 7200000), end: new Date(Date.now() - 3600000), duration: 60 }
          ])
        },
        {
          title: "Unit Test Suite",
          description: "Achieving 90%+ coverage for the authentication module.",
          kanban_status: "todo",
          priority: "Low",
          category: "QA",
          subtasks: JSON.stringify([
            { id: 1, title: "Write login tests", completed: true },
            { id: 2, title: "Write registration tests", completed: false }
          ])
        }
      ];

      for (const t of dummyTasks) {
        await client.query(
          `INSERT INTO tasks 
           (project_id, organization_id, title, description, kanban_status, priority, category, is_milestone, time_spent, time_logs, subtasks, created_by, due_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            projectId,
            orgId,
            t.title,
            t.description,
            t.kanban_status,
            t.priority,
            t.category,
            t.is_milestone || false,
            t.time_spent || 0,
            t.time_logs || '[]',
            t.subtasks || '[]',
            userId,
            new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
          ]
        );
      }

      // 4. Add Project Activities
      const activities = [
        "Project created and initial roadmap finalized.",
        "Onboarded primary engineering team.",
        `First sprint completed with ${p.progress}% progress.`
      ];

      for (const content of activities) {
        await client.query(
          `INSERT INTO project_activities (project_id, user_id, content) VALUES ($1, $2, $3)`,
          [projectId, userId, content]
        );
      }

      // 5. Add Project Expenses (Experience Records)
      const expenses = [
        {
          description: "AWS Cloud Infrastructure - Q1",
          category: "Infrastructure",
          vendor: "Amazon Web Services",
          amount: 1500.00,
          brief: "Hosting and data storage for development environments."
        },
        {
          description: "UI/UX Design Tools - License",
          category: "Software",
          vendor: "Figma Inc.",
          amount: 450.00,
          brief: "Annual professional license for the design team."
        }
      ];

      for (const e of expenses) {
        await client.query(
          `INSERT INTO project_expenses 
           (project_id, description, category, vendor_name, expense_date, amount, status, brief, created_by_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            projectId,
            e.description,
            e.category,
            e.vendor,
            new Date(),
            e.amount,
            "Approved",
            e.brief,
            userId
          ]
        );
      }

      // 6. Add Dummy Resource Links (via file_assets)
      const resources = [
        {
          name: "Project Wiki (Internal)",
          url: "https://wiki.launchpad.com/projects/alpha-centauri",
          desc: "Complete documentation and architecture maps."
        },
        {
          name: "Figma Design Mockups",
          url: "https://figma.com/file/dummy-design-guidelines",
          desc: "High-fidelity mockups for current sprint."
        }
      ];

      for (const r of resources) {
        await client.query(
          `INSERT INTO file_assets 
           (file_name, storage_url, is_external, context_type, context_id, description, uploader_user_id, organization_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            r.name,
            r.url,
            true, // is_external
            "project",
            projectId,
            r.desc,
            userId,
            orgId
          ]
        );
      }
    }

    await client.query("COMMIT");
    console.log("\n✨ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
};

seedProjectFull();
