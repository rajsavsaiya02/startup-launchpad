/**
 * seedTalentProfiles.js
 *
 * Populates user account detail columns (bio, location, skills, avatar, socials, phone) and
 * the public_profile JSONB (experience, education, portfolio, availability, rate) for every
 * user that exists in the database whose email matches the organization_accounts.csv.
 *
 * Usage:  node server/src/scripts/seedTalentProfiles.js
 *
 * Safety: This script ONLY updates existing users - it never creates, deletes, or modifies
 *         any other record. It is fully idempotent (safe to run multiple times).
 */

require("dotenv").config({
  path: require("path").join(__dirname, "../../../../server/.env"),
});
// fallback: also try the standard server .env location
require("dotenv").config({
  path: require("path").join(__dirname, "../../../.env"),
});
const { pool } = require("../../../database");
const https = require("https");
const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// 1.  Profile-photo helper
//     thispersondoesnotexist.com returns a random JPEG on every request.
//     We cache each photo locally under server/public/avatars/ so the URLs
//     stay stable after the first run.
// ---------------------------------------------------------------------------
const AVATAR_DIR = path.join(__dirname, "../../../public/avatars");
if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });

function downloadAvatar(filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(AVATAR_DIR, filename);
    if (fs.existsSync(filePath)) {
      // Already downloaded - reuse
      return resolve(`/avatars/${filename}`);
    }

    const file = fs.createWriteStream(filePath);
    const url = "https://thispersondoesnotexist.com/";

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(filePath);
          return reject(
            new Error(`Failed to download avatar: ${response.statusCode}`),
          );
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close(() => resolve(`/avatars/${filename}`));
        });
      })
      .on("error", (err) => {
        file.close();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        reject(err);
      });
  });
}

// ---------------------------------------------------------------------------
// 2.  Realistic dummy-data pools (per department / role)
// ---------------------------------------------------------------------------
const CITIES = [
  "Remote, USA",
  "Remote, India",
  "New York, NY",
  "San Francisco, CA",
  "Austin, TX",
  "London, UK",
  "Berlin, Germany",
  "Toronto, Canada",
  "Bangalore, India",
  "Singapore",
  "Remote, Germany",
  "Chicago, IL",
  "Boston, MA",
  "Seattle, WA",
  "Tokyo, Japan",
  "Sydney, Australia",
];

const PHONE_PREFIXES = [
  "+1-415",
  "+1-212",
  "+1-512",
  "+44-20",
  "+49-30",
  "+91-98",
  "+65-91",
  "+61-2",
  "+1-206",
  "+81-3",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Skills per department
const DEPT_SKILLS = {
  Engineering: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "Python",
    "Go",
    "REST APIs",
    "GraphQL",
    "CI/CD",
    "Git",
  ],
  Design: [
    "Figma",
    "Adobe XD",
    "Sketch",
    "UI/UX Design",
    "Prototyping",
    "Typography",
    "Motion Design",
    "User Research",
    "Wireframing",
    "Accessibility",
    "Illustration",
  ],
  Product: [
    "Product Strategy",
    "Roadmapping",
    "Agile",
    "Scrum",
    "User Stories",
    "A/B Testing",
    "Analytics",
    "JIRA",
    "Stakeholder Management",
    "OKRs",
    "Market Research",
  ],
  Marketing: [
    "SEO",
    "Content Marketing",
    "Google Ads",
    "Social Media",
    "Email Marketing",
    "HubSpot",
    "Analytics",
    "Copywriting",
    "Brand Strategy",
    "PPC",
    "Growth Hacking",
  ],
  Sales: [
    "CRM",
    "Salesforce",
    "Lead Generation",
    "Cold Outreach",
    "Negotiation",
    "Account Management",
    "Pipeline Management",
    "B2B Sales",
    "Closing Deals",
    "Proposal Writing",
  ],
  Finance: [
    "Financial Modeling",
    "Excel",
    "QuickBooks",
    "Budgeting",
    "Forecasting",
    "Accounts Payable",
    "Accounts Receivable",
    "GAAP",
    "Cash Flow Analysis",
    "BI Tools",
  ],
  HR: [
    "Recruitment",
    "Onboarding",
    "HRIS",
    "Employee Relations",
    "Performance Management",
    "Compensation & Benefits",
    "Talent Acquisition",
    "Culture Building",
    "L&D",
  ],
  Operations: [
    "Process Improvement",
    "Lean",
    "Six Sigma",
    "Project Management",
    "Vendor Management",
    "Supply Chain",
    "Data Analysis",
    "Reporting",
    "ERP Systems",
    "Logistics",
  ],
  Management: [
    "Leadership",
    "Strategic Planning",
    "Team Building",
    "Change Management",
    "Executive Communication",
    "OKRs",
    "P&L Management",
    "Mentorship",
    "Decision Making",
  ],
  Executive: [
    "Vision & Strategy",
    "Corporate Governance",
    "Investor Relations",
    "M&A",
    "Board Management",
    "Culture",
    "Fundraising",
    "Global Operations",
    "Leadership",
  ],
};

// Bio templates per role type
function getBio(name, dept, designation) {
  const firstName = name.split(" ")[0];
  const bios = {
    Engineering: [
      `${firstName} is a results-driven software engineer with a passion for building scalable, maintainable systems. With deep expertise in full-stack development, ${firstName} thrives at the intersection of elegant code and impactful products.`,
      `A seasoned ${designation} in the Engineering team, ${firstName} specialises in architecting microservices, optimising database performance, and championing clean-code principles across the team.`,
      `${firstName} brings hands-on experience in cloud infrastructure and modern web technologies. A strong advocate for test-driven development and continuous deployment pipelines.`,
    ],
    Design: [
      `${firstName} is a creative ${designation} with a human-centred design philosophy. From wireframes to polished high-fidelity prototypes, ${firstName} turns complex user needs into intuitive experiences.`,
      `A visual storyteller at heart, ${firstName} combines sharp aesthetic sense with data-driven UX. ${firstName} is passionate about accessibility and inclusive design.`,
    ],
    Product: [
      `${firstName} is a strategic product thinker who balances user empathy with business impact. With a track record of launching 0-to-1 products, ${firstName} brings clarity to ambiguous problem spaces.`,
      `As a ${designation}, ${firstName} excels at aligning cross-functional teams around a coherent product vision, using data and qualitative insights to continuously refine the roadmap.`,
    ],
    Marketing: [
      `${firstName} is a growth-oriented marketer with expertise across digital channels. From performance campaigns to brand storytelling, ${firstName} builds audiences that convert.`,
      `A data-native marketer, ${firstName} leverages analytics and experimentation to drive sustainable growth. Specialises in content strategy and SEO.`,
    ],
    Sales: [
      `${firstName} is a relationship-driven sales professional who consistently exceeds quota. With a consultative approach, ${firstName} turns prospects into long-term partners.`,
      `As a ${designation}, ${firstName} specialises in enterprise B2B sales, managing full-cycle deals from discovery to close.`,
    ],
    Finance: [
      `${firstName} is a detail-oriented finance professional who keeps the numbers sharp and forecasts accurate. Expert in financial modelling and budget management.`,
      `With a background in corporate finance and FP&A, ${firstName} provides the analytical backbone that supports strategic decision-making.`,
    ],
    HR: [
      `${firstName} is a people-first HR professional who creates environments where talent thrives. Expert in talent acquisition, onboarding, and culture-building.`,
      `As a ${designation}, ${firstName} drives employee engagement and retention through thoughtful programmes and a genuine commitment to team wellbeing.`,
    ],
    Operations: [
      `${firstName} is an operations specialist focused on efficiency and scale. Skilled in process engineering, vendor management, and cross-functional coordination.`,
      `A systems thinker, ${firstName} finds leverage points in operational complexity and transforms them into streamlined, repeatable workflows.`,
    ],
    Management: [
      `${firstName} is an experienced manager who leads with clarity and empathy. Known for building high-performing teams and holding a strong bias for execution.`,
      `As a ${designation}, ${firstName} drives cross-departmental alignment and coaches direct reports to their best professional selves.`,
    ],
    Executive: [
      `${firstName} co-founded the company and serves as its CEO, setting the vision and leading the executive team. A serial entrepreneur with a passion for building category-defining products.`,
    ],
  };
  const pool = bios[dept] || bios["Management"];
  return pick(pool);
}

// Experience per department
function getExperience(dept, designation, yearsAdded = 0) {
  const baseYear = 2020 + Math.floor(Math.random() * 3);
  const companies = {
    Engineering: [
      "Google",
      "Meta",
      "Stripe",
      "Vercel",
      "IBM",
      "Thoughtworks",
      "MongoDB",
      "Cloudflare",
      "Atlassian",
      "GitHub",
    ],
    Design: [
      "IDEO",
      "Facebook Design",
      "Adobe",
      "Figma",
      "Airbnb Design",
      "Pentagram",
      "Frog Design",
      "InVision",
    ],
    Product: [
      "Atlassian",
      "Intercom",
      "ProductBoard",
      "Amplitude",
      "Notion",
      "Linear",
      "Figma",
      "Segment",
    ],
    Marketing: [
      "HubSpot",
      "Mailchimp",
      "Canva",
      "Shopify",
      "Buffer",
      "Semrush",
      "Moz",
      "Sprout Social",
    ],
    Sales: [
      "Salesforce",
      "HubSpot",
      "Zendesk",
      "Outreach",
      "Gong",
      "SalesLoft",
      "Drift",
      "Oracle",
    ],
    Finance: [
      "Deloitte",
      "KPMG",
      "PwC",
      "EY",
      "Goldman Sachs",
      "Morgan Stanley",
      "Blackrock",
      "Stripe",
    ],
    HR: [
      "Workday",
      "ADP",
      "LinkedIn",
      "Indeed",
      "Greenhouse",
      "Lever",
      "Lattice",
      "Culture Amp",
    ],
    Operations: [
      "McKinsey",
      "Bain",
      "BCG",
      "Accenture",
      "Amazon Operations",
      "UPS",
      "FedEx",
      "Flexport",
    ],
    Management: [
      "McKinsey & Company",
      "Boston Consulting Group",
      "Bain & Company",
      "Deloitte",
      "Bridgewater",
    ],
    Executive: [
      "Y Combinator",
      "Andreessen Horowitz",
      "500 Startups",
      "Techstars",
    ],
  };
  const companyPool = companies[dept] || companies["Management"];

  return [
    {
      role: designation,
      company: "Acme Corp",
      dates: `${baseYear} - Present`,
      desc: `Leading ${dept.toLowerCase()} initiatives and driving key outcomes for the team. Responsible for strategy, execution, and mentoring junior colleagues.`,
    },
    {
      role: designation.replace(/Senior |Lead |Principal /, ""),
      company: pick(companyPool),
      dates: `${baseYear - 2} - ${baseYear}`,
      desc: `Built foundational experience in ${dept.toLowerCase()} best practices, delivered high-impact projects, and collaborated closely with cross-functional stakeholders.`,
    },
    {
      role: "Associate / Junior",
      company: pick(companyPool),
      dates: `${baseYear - 4} - ${baseYear - 2}`,
      desc: `Started career in ${dept.toLowerCase()}, honing core skills, contributing to team projects, and rapidly growing into a more senior contributor.`,
    },
  ];
}

// Education data
const UNIVERSITIES = [
  {
    school: "Stanford University",
    degrees: [
      "B.S. Computer Science",
      "M.S. Computer Science",
      "MBA",
      "B.A. Economics",
    ],
  },
  {
    school: "MIT",
    degrees: [
      "B.S. Electrical Engineering",
      "M.S. AI & Machine Learning",
      "B.S. Management",
    ],
  },
  {
    school: "UC Berkeley",
    degrees: ["B.S. Computer Science", "MBA", "B.A. Business Administration"],
  },
  {
    school: "University of Michigan",
    degrees: ["B.S. Industrial Engineering", "MBA", "B.A. Marketing"],
  },
  {
    school: "Carnegie Mellon University",
    degrees: [
      "B.S. Software Engineering",
      "M.S. Human-Computer Interaction",
      "M.S. Information Systems",
    ],
  },
  {
    school: "Harvard University",
    degrees: ["MBA", "B.A. Economics", "B.A. Psychology"],
  },
  {
    school: "IIT Bombay",
    degrees: ["B.Tech Computer Science", "M.Tech Data Science"],
  },
  { school: "INSEAD", degrees: ["MBA", "Executive Education"] },
  {
    school: "London School of Economics",
    degrees: ["B.S. Economics", "M.S. Finance"],
  },
  {
    school: "University of Toronto",
    degrees: ["B.S. Computer Science", "M.B.A."],
  },
];

function getEducation(dept) {
  const uni1 = pick(UNIVERSITIES);
  const uni2 = pick(UNIVERSITIES.filter((u) => u !== uni1));
  const gradYear1 = randInt(2015, 2021);
  const gradYear2 = gradYear1 - 4;
  return [
    {
      degree: pick(uni1.degrees),
      school: uni1.school,
      dates: `${gradYear1 - 2} - ${gradYear1}`,
    },
    {
      degree: pick(uni2.degrees),
      school: uni2.school,
      dates: `${gradYear2} - ${gradYear2 + 4}`,
    },
  ];
}

// Portfolio images (Unsplash, stable URLs)
const PORTFOLIO_IMAGES = [
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&fit=crop",
  "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400&fit=crop",
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&fit=crop",
  "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&fit=crop",
  "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=400&fit=crop",
  "https://images.unsplash.com/photo-1509395062549-057d3fc8ae47?w=400&fit=crop",
  "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&fit=crop",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&fit=crop",
];

function getPortfolio(dept, n = 3) {
  return pickN(PORTFOLIO_IMAGES, n).map((url) => ({ image: url, url }));
}

// Availability & rate per seniority
function getAvailabilityAndRate(designation, orgRole) {
  if (orgRole === "GUEST") {
    // Freelancers/interns
    return {
      availability: pick([
        "Full-time",
        "20-30 hrs/week",
        "Part-time, flexible",
        "15-20 hrs/week",
      ]),
      rate: `$${randInt(25, 80)}/hr`,
    };
  }
  if (designation.startsWith("Senior") || designation.startsWith("Lead")) {
    return {
      availability: pick([
        "Full-time",
        "Not currently available",
        "Open to senior roles",
      ]),
      rate: `$${randInt(90, 180)}/hr`,
    };
  }
  return {
    availability: pick([
      "Full-time",
      "Open to opportunities",
      "30-40 hrs/week",
    ]),
    rate: `$${randInt(50, 120)}/hr`,
  };
}

// Social links
function getSocials(email, name) {
  const handle = email
    .split("@")[0]
    .replace(/[_.\d]+/g, "_")
    .toLowerCase();
  return {
    social_linkedin: `https://linkedin.com/in/${handle}`,
    social_github: `https://github.com/${handle}`,
    social_website: null,
  };
}

// Phone number
function getPhone() {
  const prefix = pick(PHONE_PREFIXES);
  return `${prefix}-${randInt(100, 999)}-${randInt(1000, 9999)}`;
}

// ---------------------------------------------------------------------------
// 3.  Main seeder
// ---------------------------------------------------------------------------
async function seedTalentProfiles() {
  const csvPath = path.join(
    __dirname,
    "../../../docs/organization_accounts.csv",
  );

  if (!fs.existsSync(csvPath)) {
    console.error("❌ CSV not found at:", csvPath);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8").replace(/\\n/g, "\n");
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const headers = lines[0].split(",");
  const records = lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h.trim()] = (values[i] || "").trim()));
    return obj;
  });

  console.log(`📄  Loaded ${records.length} records from CSV.`);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let updated = 0;
    let skipped = 0;
    let avatarIdx = 0;

    for (const rec of records) {
      const { Email, Name, Department, Designation, OrgRole } = rec;

      // Check if user exists
      const userRes = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [Email],
      );
      if (userRes.rows.length === 0) {
        console.warn(`⚠️   User not found in DB: ${Email} — skipping.`);
        skipped++;
        continue;
      }

      const userId = userRes.rows[0].id;
      const dept = Department || "Management";
      const desig = Designation || "Specialist";

      // --- Avatar (download with delay to avoid rate-limiting) ---
      avatarIdx++;
      const avatarFilename = `user_${userId}_${avatarIdx}.jpg`;
      let avatarUrl;
      try {
        avatarUrl = await downloadAvatar(avatarFilename);
        // Small delay between downloads to be respectful to the service
        await new Promise((r) => setTimeout(r, 600));
      } catch (e) {
        console.warn(
          `⚠️   Could not download avatar for ${Email}: ${e.message}`,
        );
        avatarUrl = null;
      }

      // --- Build profile data ---
      const skillsPool = DEPT_SKILLS[dept] || DEPT_SKILLS["Management"];
      const skills = pickN(skillsPool, randInt(4, 7));
      const bio = getBio(Name, dept, desig);
      const location = pick(CITIES);
      const phone = getPhone();
      const { social_linkedin, social_github, social_website } = getSocials(
        Email,
        Name,
      );

      // --- public_profile JSONB ---
      const experience = getExperience(dept, desig);
      const education = getEducation(dept);
      const portfolio =
        dept === "Design" || dept === "Marketing" || OrgRole === "GUEST"
          ? getPortfolio(dept, 6)
          : getPortfolio(dept, 3);
      const { availability, rate } = getAvailabilityAndRate(desig, OrgRole);

      const publicProfile = {
        experience,
        education,
        portfolio,
        availability,
        rate,
      };

      // --- Update user row ---
      await client.query(
        `UPDATE users SET
          bio             = $1,
          location        = $2,
          skills          = $3,
          avatar          = COALESCE($4, avatar),
          phone_number    = $5,
          social_linkedin = $6,
          social_github   = $7,
          social_website  = $8,
          public_profile  = $9
        WHERE id = $10`,
        [
          bio,
          location,
          skills,
          avatarUrl,
          phone,
          social_linkedin,
          social_github,
          social_website,
          JSON.stringify(publicProfile),
          userId,
        ],
      );

      updated++;
      console.log(`✅  [${updated}/${records.length}] Updated: ${Email}`);
    }

    await client.query("COMMIT");
    console.log(`\n🎉  Done! Updated ${updated} users, skipped ${skipped}.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌  Error during seeding, rolling back:", err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedTalentProfiles();
