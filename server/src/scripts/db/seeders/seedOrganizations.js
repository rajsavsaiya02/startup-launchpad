const { pool } = require("../../../database");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const firstNames = [
  "John",
  "Jane",
  "Michael",
  "Sarah",
  "David",
  "Emily",
  "James",
  "Emma",
  "Robert",
  "Olivia",
  "William",
  "Sophia",
  "Joseph",
  "Isabella",
  "Charles",
  "Mia",
  "Thomas",
  "Charlotte",
  "Daniel",
  "Amelia",
  "Matthew",
  "Harper",
  "Anthony",
  "Evelyn",
  "Mark",
  "Abigail",
  "Paul",
  "Elizabeth",
  "Steven",
  "Avery",
  "Andrew",
  "Sofia",
  "Kenneth",
  "Ella",
  "Joshua",
  "Madison",
  "Kevin",
  "Scarlett",
  "Brian",
  "Victoria",
];
const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
];
const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "HR",
  "Product",
  "Design",
  "Finance",
  "Operations",
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedOrganizations() {
  try {
    console.log("Starting Organization Seed Script...");
    const csvPath = path.join(
      __dirname,
      "../../../docs/organization_accounts.csv",
    );
    const csvHeaders =
      "Email,Password,Name,Role,OrgRole,Department,Designation\n";
    let csvContent = csvHeaders;

    // 1. Create 1 Organization
    const orgRes = await pool.query(
      "INSERT INTO organizations (name, workspace_url, timezone) VALUES ('Acme Corp', 'acme-corp', 'UTC') RETURNING organization_id",
    );
    const orgId = orgRes.rows[0].organization_id;
    console.log("Created Organization: Acme Corp (ID: " + orgId + ")");

    // 2. Create Designations
    const designationsList = [];
    for (const dept of departments) {
      const levels = ["Manager", "Senior", "Specialist", "Intern"];
      for (let i = 0; i < levels.length; i++) {
        const title = levels[i] + " " + dept;
        const desigRes = await pool.query(
          "INSERT INTO organization_designations (organization_id, title, department, hierarchy_level) VALUES ($1, $2, $3, $4) RETURNING designation_id, title",
          [orgId, title, dept, 4 - i],
        );
        designationsList.push({ ...desigRes.rows[0], department: dept });
      }
    }
    console.log("Created " + designationsList.length + " Designations.");

    // 3. Generate 55 Profiles
    const usersToCreate = [];
    const basePassword = "Password123!";
    const hashedPassword = await bcrypt.hash(basePassword, 10);

    // First user must be Founder
    usersToCreate.push({
      firstName: "Alex",
      lastName: "Founder",
      email: "alex.founder@acmecorp.com",
      sysRole: "founder",
      orgRole: "FOUNDER",
      password: basePassword,
      passwordHash: hashedPassword,
      dept: "Executive",
      designationId: null,
    });

    // 5 Admins
    for (let i = 0; i < 5; i++) {
      const fn = getRandomItem(firstNames);
      const ln = getRandomItem(lastNames);
      usersToCreate.push({
        firstName: fn,
        lastName: ln,
        email:
          fn.toLowerCase() +
          "." +
          ln.toLowerCase() +
          "_admin" +
          i +
          "@acmecorp.com",
        sysRole: "normal_user",
        orgRole: "ADMIN",
        password: basePassword,
        passwordHash: hashedPassword,
        dept: "Management",
        designationId: designationsList.find((d) => d.title.includes("Manager"))
          .designation_id,
      });
    }

    // 40 Members
    for (let i = 0; i < 40; i++) {
      const fn = getRandomItem(firstNames);
      const ln = getRandomItem(lastNames);
      const desig = getRandomItem(
        designationsList.filter(
          (d) => !d.title.includes("Manager") && !d.title.includes("Intern"),
        ),
      );
      usersToCreate.push({
        firstName: fn,
        lastName: ln,
        email:
          fn.toLowerCase() +
          "." +
          ln.toLowerCase() +
          "_member" +
          i +
          "@acmecorp.com",
        sysRole: "normal_user",
        orgRole: "MEMBER",
        password: basePassword,
        passwordHash: hashedPassword,
        dept: desig.department,
        designationId: desig.designation_id,
      });
    }

    // 10 Guests (Interns or Freelancers)
    for (let i = 0; i < 10; i++) {
      const fn = getRandomItem(firstNames);
      const ln = getRandomItem(lastNames);
      const desig = getRandomItem(
        designationsList.filter((d) => d.title.includes("Intern")),
      );
      usersToCreate.push({
        firstName: fn,
        lastName: ln,
        email:
          fn.toLowerCase() +
          "." +
          ln.toLowerCase() +
          "_guest" +
          i +
          "@acmecorp.com",
        sysRole: "freelancer", // Guest uses freelancer usually
        orgRole: "GUEST",
        password: basePassword,
        passwordHash: hashedPassword,
        dept: desig.department,
        designationId: desig.designation_id,
      });
    }

    for (const u of usersToCreate) {
      // Insert User
      const username =
        u.firstName.toLowerCase() +
        "_" +
        u.lastName.toLowerCase() +
        "_" +
        Math.floor(Math.random() * 10000);
      const userRes = await pool.query(
        "INSERT INTO users (username, email, name, first_name, last_name, password_hash, is_verified, role, department) VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, $8) RETURNING id",
        [
          username,
          u.email,
          u.firstName + " " + u.lastName,
          u.firstName,
          u.lastName,
          u.passwordHash,
          u.sysRole,
          u.dept,
        ],
      );

      const userId = userRes.rows[0].id;

      // Insert Org Member
      await pool.query(
        "INSERT INTO organization_members (organization_id, user_id, is_active, org_role, designation_id, hourly_cost_rate) VALUES ($1, $2, TRUE, $3, $4, $5)",
        [
          orgId,
          userId,
          u.orgRole,
          u.designationId,
          Math.floor(Math.random() * 100) + 20,
        ],
      );

      // Append to CSV
      const desigTitle = u.designationId
        ? designationsList.find((d) => d.designation_id === u.designationId)
            .title
        : "Founder & CEO";
      csvContent +=
        u.email +
        "," +
        u.password +
        "," +
        u.firstName +
        " " +
        u.lastName +
        "," +
        u.sysRole +
        "," +
        u.orgRole +
        "," +
        u.dept +
        "," +
        desigTitle +
        "\\n";
    }

    console.log(
      "Successfully created " +
        usersToCreate.length +
        " organization profiles.",
    );

    // Write CSV
    fs.writeFileSync(csvPath, csvContent.replace(/\\\\n/g, "\\n"));
    console.log("Credentials CSV saved to: " + csvPath);

    process.exit(0);
  } catch (err) {
    console.error("Error running seed script:", err);
    process.exit(1);
  }
}

seedOrganizations();
