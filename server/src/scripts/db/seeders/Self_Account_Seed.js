const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const { pool } = require("../../../database");

const seedSelfAccount = async () => {
  const username = process.argv[2];

  if (!username) {
    console.error(
      "❌ Please provide a username. Usage: node src/scripts/Self_Account_Seed.js <username>",
    );
    process.exit(1);
  }

  try {
    console.log(
      `Connecting to database to seed 'Self' data for user: ${username}...`,
    );

    // 1. Find User
    const userResult = await pool.query(
      "SELECT id, username FROM users WHERE username = $1",
      [username],
    );
    if (userResult.rows.length === 0) {
      console.error(`❌ User '${username}' not found.`);
      process.exit(1);
    }
    const userId = userResult.rows[0].id;
    console.log(`✅ Found user: ${username} (ID: ${userId})`);

    // 2. Clear Existing Data
    console.log(
      "🧹 Clearing existing personal projects and independent tasks...",
    );

    // Independent tasks
    await pool.query(
      "DELETE FROM tasks WHERE created_by = $1 AND project_id IS NULL AND organization_id IS NULL",
      [userId],
    );

    // Projects and their tasks are cascaded
    await pool.query(
      "DELETE FROM projects WHERE owner_user_id = $1 AND owner_org_id IS NULL",
      [userId],
    );

    // 3. Update User Profile & Experience Record
    console.log("🌟 Updating Profile and Experience Records...");

    const publicProfile = {
      occupation: "Serial Entrepreneur & Consultant",
      isPublic: true,
      experiences: [
        {
          id: Date.now().toString() + "-exp1",
          role: "Founder & CEO",
          company: "TechScale Innovations",
          duration: "2021 - Present",
          description: "Bootstrapped a B2B SaaS startup. Scaled to $1M ARR.",
        },
        {
          id: Date.now().toString() + "-exp2",
          role: "Senior Product Manager",
          company: "Global Tech Inc.",
          duration: "2018 - 2021",
          description:
            "Led the development of a cloud analytics platform used by over 500 enterprise clients.",
        },
      ],
      education: [
        {
          id: Date.now().toString() + "-edu1",
          school: "Stanford University",
          degree: "M.S. Computer Science",
          duration: "2016 - 2018",
          description:
            "Specialized in Artificial Intelligence and Human-Computer Interaction.",
        },
      ],
      projects: [
        {
          id: Date.now().toString() + "-proj1",
          name: "Analytics Dashboard",
          link: "https://demo.techscale.io",
          description:
            "An open-source visualization tool handling millions of data points.",
        },
      ],
      achievements: [
        {
          id: Date.now().toString() + "-ach1",
          title: "Top 30 Under 30 in Tech",
          issuer: "Tech Innovators Magazine",
          date: "Oct 2022",
          description: "Recognized for contributions to B2B SaaS architecture.",
        },
      ],
      socialLinks: [
        {
          id: Date.now().toString() + "-soc1",
          platform: "LinkedIn",
          url: "https://linkedin.com/in/alexfounder301",
        },
        {
          id: Date.now().toString() + "-soc2",
          platform: "GitHub",
          url: "https://github.com/alexfounder301",
        },
      ],
    };

    const bio =
      "Passionate builder, operator, and advisor. Love solving complex problems and scaling products from 0 to 1.";
    const skills = [
      "Product Management",
      "SaaS",
      "Go-To-Market Strategy",
      "Node.js",
      "React",
    ];

    await pool.query(
      `
      UPDATE users 
      SET bio = $1, 
          job_title = $2, 
          location = $3, 
          skills = $4,
          social_github = $5,
          social_linkedin = $6,
          social_website = $7,
          public_profile = $8
      WHERE id = $9
    `,
      [
        bio,
        "Serial Entrepreneur",
        "San Francisco, CA",
        skills,
        "https://github.com/alexfounder301",
        "https://linkedin.com/in/alexfounder301",
        "https://alexfounder.io",
        publicProfile,
        userId,
      ],
    );

    // 4. Create Dummy Projects
    console.log("📁 Creating Personal Projects...");
    const pastDate1 = new Date();
    pastDate1.setMonth(pastDate1.getMonth() - 5);
    const pastDate2 = new Date();
    pastDate2.setMonth(pastDate2.getMonth() - 2);
    const pastDate3 = new Date();
    pastDate3.setMonth(pastDate3.getMonth() - 1);

    const projectsData = [
      {
        title: "Personal Portfolio Revamp",
        description:
          "Redesigning my personal portrolio using React and Framer Motion.",
        priority: "high",
        category: "Development",
        createdAt: pastDate1,
        progress: 85,
      },
      {
        title: "Machine Learning Alpha Algorithm",
        description: "Researching and writing an alpha predictive model.",
        priority: "medium",
        category: "Research",
        createdAt: pastDate2,
        progress: 40,
      },
      {
        title: "Mobile App Launchpad",
        description:
          "Drafting the initial specs and UI/UX for the new consumer app.",
        priority: "high",
        category: "Product",
        createdAt: pastDate3,
        progress: 15,
      },
    ];

    const insertedProjects = [];
    for (const p of projectsData) {
      const res = await pool.query(
        `
        INSERT INTO projects (title, description, status, priority, category, progress, owner_user_id, created_by, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
        RETURNING id
      `,
        [
          p.title,
          p.description,
          "active",
          p.priority,
          p.category,
          p.progress,
          userId,
          userId,
          p.createdAt,
        ],
      );

      const pId = res.rows[0].id;
      insertedProjects.push({
        id: pId,
        title: p.title,
        createdAt: p.createdAt,
      });

      // Add user as project member
      await pool.query(
        `
        INSERT INTO project_members (project_id, user_id, role, joined_at)
        VALUES ($1, $2, 'owner', $3)
      `,
        [pId, userId, p.createdAt],
      );
    }

    // Helper to generate a random date between two dates
    const randomDate = (start, end) =>
      new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime()),
      );

    // Statuses & Priorities
    const statuses = ["todo", "in_progress", "done"];
    const priorities = ["Low", "Medium", "High"];

    // JSONB Checklist Generator
    const generateChecklist = () => {
      const checklist = [];
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 1; i <= count; i++) {
        checklist.push({
          id: "sub-" + Date.now().toString() + "-" + i,
          title: `Subtask action item ${i}`,
          completed: Math.random() > 0.5,
        });
      }
      return JSON.stringify(checklist);
    };

    // 5. Create Tasks for Projects
    console.log("✅ Creating Tasks for Projects...");
    let fileAssetCounter = 1;

    for (const proj of insertedProjects) {
      const taskCount = Math.floor(Math.random() * 11) + 5; // 5 to 15 tasks

      for (let i = 0; i < taskCount; i++) {
        const isDone = Math.random() > 0.6; // 40% completed
        const isOverdue = !isDone && Math.random() > 0.7; // of the pending, 30% overdue
        const isArchived = isDone && Math.random() > 0.7; // of done ones, 30% are "archived/old"

        let status = isDone
          ? "done"
          : Math.random() > 0.5
            ? "in_progress"
            : "todo";
        let dueDate;
        let createdAt = randomDate(proj.createdAt, new Date());

        if (isDone) {
          if (isArchived) {
            // Highly in the past
            dueDate = randomDate(
              proj.createdAt,
              new Date(new Date().setMonth(new Date().getMonth() - 1)),
            );
            createdAt = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Created 1 week before due
          } else {
            dueDate = randomDate(
              new Date(new Date().setMonth(new Date().getMonth() - 1)),
              new Date(),
            );
          }
        } else if (isOverdue) {
          dueDate = randomDate(
            new Date(new Date().setMonth(new Date().getMonth() - 2)),
            new Date(new Date().setDate(new Date().getDate() - 2)),
          ); // Overdue between 2 days and 2 months ago
        } else {
          dueDate = randomDate(
            new Date(new Date().setDate(new Date().getDate() + 1)),
            new Date(new Date().setMonth(new Date().getMonth() + 2)),
          ); // Future
        }

        const taskRes = await pool.query(
          `
          INSERT INTO tasks (project_id, title, description, kanban_status, priority, due_date, subtasks, created_by, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
          RETURNING id
        `,
          [
            proj.id,
            `${proj.title} - Task ${i + 1}`,
            `This is a detailed description for task ${i + 1} covering all requirements for ${proj.title}.`,
            status,
            priorities[Math.floor(Math.random() * priorities.length)],
            dueDate,
            generateChecklist(),
            userId,
            createdAt,
          ],
        );

        const taskId = taskRes.rows[0].id;

        // Assign to user
        await pool.query(
          `
          INSERT INTO task_assignees (task_id, user_id, assigned_at)
          VALUES ($1, $2, $3)
        `,
          [taskId, userId, createdAt],
        );

        // Add dummy file attachments randomly
        if (Math.random() > 0.7) {
          await pool.query(
            `
            INSERT INTO file_assets (file_name, mime_type, size_bytes, storage_url, context_type, context_id, uploader_user_id, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
            [
              `Requirement_doc_${fileAssetCounter}.pdf`,
              `application/pdf`,
              Math.floor(Math.random() * 5000000) + 100000, // 100kb to 5MB
              `/org/0/private/task/dummy_${fileAssetCounter}.pdf`, // Using 0 as dummy OrgID
              "task",
              taskId,
              userId,
              createdAt,
            ],
          );
          fileAssetCounter++;
        }
      }
    }

    // 6. Create Independent Tasks
    console.log("✅ Creating Independent Tasks...");
    const independentTaskCount = 8;
    for (let i = 0; i < independentTaskCount; i++) {
      const isDone = Math.random() > 0.5;
      const isOverdue = !isDone && Math.random() > 0.6;
      let status = isDone
        ? "done"
        : Math.random() > 0.5
          ? "in_progress"
          : "todo";
      let dueDate;

      const recentPast = new Date(
        new Date().setMonth(new Date().getMonth() - 1),
      );

      if (isDone) {
        dueDate = randomDate(recentPast, new Date());
      } else if (isOverdue) {
        dueDate = randomDate(
          recentPast,
          new Date(new Date().setDate(new Date().getDate() - 1)),
        );
      } else {
        dueDate = randomDate(
          new Date(new Date().setDate(new Date().getDate() + 1)),
          new Date(new Date().setMonth(new Date().getMonth() + 1)),
        );
      }

      const taskRes = await pool.query(
        `
          INSERT INTO tasks (title, description, kanban_status, priority, due_date, subtasks, created_by, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
          RETURNING id
        `,
        [
          `Independent Action Item ${i + 1}`,
          `Personal task that doesn't belong to any project.`,
          status,
          priorities[Math.floor(Math.random() * priorities.length)],
          dueDate,
          generateChecklist(),
          userId,
          new Date(dueDate.getTime() - 5 * 24 * 60 * 60 * 1000), // Created 5 days before due
        ],
      );

      const indTaskId = taskRes.rows[0].id;

      // Assign to user
      await pool.query(
        `
          INSERT INTO task_assignees (task_id, user_id)
          VALUES ($1, $2)
        `,
        [indTaskId, userId],
      );
    }

    console.log(
      "🎉 Seed Complete! All Self account features for user",
      username,
      "are populated with rich dummy data.",
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Error running script:", err);
    process.exit(1);
  }
};

seedSelfAccount();
