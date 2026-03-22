/**
 * ============================================================
 *  seedNexusAI.js — NexusAI Technologies Complete Seed Script
 * ============================================================
 *  Creates a realistic TechStartup org: "NexusAI Technologies"
 *
 *  Usage:
 *    node server/src/scripts/db/seeders/seedNexusAI.js
 *
 *  ⚠ WARNING: This script DELETES any existing org named
 *    "NexusAI Technologies" before re-creating it.
 * ============================================================
 */

"use strict";

require("dotenv").config();
const { pool } = require("../../../database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// ─── Helpers ─────────────────────────────────────────────────
const log  = (msg) => console.log(`  ✅  ${msg}`);
const step = (msg) => console.log(`\n📦  ${msg}`);
const warn = (msg) => console.log(`  ⚠️   ${msg}`);

const DEFAULT_PASSWORD = "NexusAI@2024!";

// ─── Organization Public Profile Data ───────────────────────
const ORG_PUBLIC_PROFILE = {
  tagline: "Building the Intelligence Layer for Modern Enterprises.",
  detailed_description: `NexusAI Technologies is a cutting-edge AI/ML SaaS startup founded in 2021, headquartered in Bengaluru, India. We build enterprise-grade artificial intelligence infrastructure that empowers organizations to extract real-time insights, automate complex workflows, and make smarter decisions at scale.

Our flagship product, the NexusAI Platform, is a unified data intelligence layer that integrates seamlessly with existing enterprise systems. Powered by proprietary large language models and advanced machine learning pipelines, it transforms raw data into actionable intelligence — in real time.

We serve over 200 enterprise clients across 18 countries, including Fortune 500 companies in financial services, healthcare, and manufacturing. Our client success stories include a 40% reduction in manual data processing time, 3x faster decision cycles, and up to $12M annual cost savings per enterprise deployment.

At NexusAI, we believe AI should be accessible, explainable, and trustworthy. Our engineering culture is grounded in research rigor, rapid iteration, and a deep commitment to building technology that genuinely moves the needle for our customers.

We are proudly backed by leading VCs including Sequoia Capital India, Lightspeed India, and Tiger Global, and are currently on a growth trajectory targeting $50M ARR by 2026.`,
  isPublic: true,
  industry: "AI / Machine Learning",
  stage: "Series B",
  team_size: "51–100",
  founded_year: "2021",
  website_url: "https://nexusai.tech",
  contact_email: "hello@nexusai.tech",
  contact_phone: "+91 80 4567 8901",
  hq_location: "Bengaluru, India",
  hq_address: "14th Floor, Prestige Cyber Tower, Outer Ring Road, Bengaluru 560103, Karnataka, India",
  socialLinks: [
    { id: "sl1", platform: "LinkedIn",     url: "https://linkedin.com/company/nexusai-technologies" },
    { id: "sl2", platform: "Twitter / X",  url: "https://twitter.com/nexusai_tech" },
    { id: "sl3", platform: "GitHub",       url: "https://github.com/nexusai-technologies" },
    { id: "sl4", platform: "Product Hunt", url: "https://producthunt.com/products/nexusai-platform" },
  ],
  milestones: [
    { id: "m1", year: "2021", title: "Company Founded & Incorporated", description: "NexusAI Technologies was incorporated in Bengaluru with a founding team of 6. Initial $500K angel funding secured from Bengaluru-based angel syndicate." },
    { id: "m2", year: "2021", title: "First Proof-of-Concept Deployed", description: "Shipped first AI pipeline to a pilot client in the BFSI sector, achieving 92% accuracy on document classification tasks." },
    { id: "m3", year: "2022", title: "Seed Round — $3.2M Raised", description: "Closed $3.2M Seed round led by Lightspeed India Partners. Used funding to build the core ML infrastructure team and expand sales." },
    { id: "m4", year: "2022", title: "NexusAI Platform v1.0 Launched", description: "Publicly launched the NexusAI Platform at a major industry conference. First 10 enterprise clients onboarded within 60 days." },
    { id: "m5", year: "2023", title: "Series A — $12M Raised", description: "Sequoia Capital India led a $12M Series A round. Headcount grew from 18 to 55 within 12 months." },
    { id: "m6", year: "2023", title: "ISO 27001 Certified", description: "Achieved ISO 27001 information security certification — a key requirement for Fortune 500 enterprise sales." },
    { id: "m7", year: "2024", title: "Series B — $28M Raised", description: "Tiger Global led a $28M Series B. Expanded to 18 countries and 200+ enterprise clients. ARR crossed $15M milestone." },
    { id: "m8", year: "2024", title: "NexusAI Platform v3.0 Released", description: "Launched v3.0 with real-time multimodal AI, automated compliance reporting, and enterprise SSO — our most ambitious release." },
  ],
  projects: [
    { id: "p1", name: "NexusAI Platform", link: "https://nexusai.tech/platform", description: "The core enterprise AI/ML infrastructure product. Provides a unified intelligence layer for data ingestion, model serving, and automated insight generation. Used by 200+ enterprises globally." },
    { id: "p2", name: "NexusLens Enterprise Analytics", link: "https://nexusai.tech/products/nexuslens", description: "AI-powered analytics dashboard offering real-time business intelligence, predictive forecasting, and anomaly detection out of the box." },
    { id: "p3", name: "NexusFlow Workflow Automation", link: "https://nexusai.tech/products/nexusflow", description: "No-code/low-code AI workflow automation builder that allows enterprise teams to automate complex decision pipelines without writing a line of ML code." },
    { id: "p4", name: "NexusGuard Compliance AI", link: "https://nexusai.tech/products/nexusguard", description: "Automated regulatory compliance monitoring and reporting for GDPR, SOC 2, and ISO 27001. Reduces compliance overhead by up to 60%." },
    { id: "p5", name: "NexusMobile SDK", link: "https://nexusai.tech/developers/sdk", description: "Native iOS and Android SDK allowing developers to embed NexusAI intelligence directly into mobile applications with 3-line integration." },
  ],
  achievements: [
    { id: "a1", title: "NASSCOM AI Excellence Award 2024", year: "2024", description: "Recognized as Best AI Startup of the Year at the NASSCOM AI Leadership Summit." },
    { id: "a2", title: "Gartner Cool Vendor — AI/ML 2023", year: "2023", description: "Named a Gartner Cool Vendor in the AI/ML Infrastructure category." },
    { id: "a3", title: "Forbes Asia 30 Under 30 — CEO Vikram Nair", year: "2023", description: "Founder & CEO recognized in Forbes Asia's 30 Under 30 list in the Technology category." },
    { id: "a4", title: "G2 Leader — AI Platform 2024 (Q2)", year: "2024", description: "Rated #1 AI Platform for Enterprise by G2 users for two consecutive quarters." },
    { id: "a5", title: "Product Hunt #1 Product of the Day", year: "2022", description: "NexusAI Platform debuted as Product Hunt's #1 Product of the Day, achieving 2,400+ upvotes." },
  ],
  gallery: [
    { id: "g1", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", caption: "NexusAI Headquarters — Prestige Cyber Tower, Bengaluru" },
    { id: "g2", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", caption: "Team all-hands meeting — Series B celebration" },
    { id: "g3", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80", caption: "Platform Engineering team sprint planning" },
    { id: "g4", url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80", caption: "NexusAI booth at NASSCOM Future of Work Summit" },
  ],
};

// ─── Member Data ─────────────────────────────────────────────
const MEMBERS = [
  // FOUNDER (1)
  {
    firstName: "Vikram",    lastName: "Nair",        email: "vikram.nair@nexusai.tech",
    sysRole: "founder",     orgRole: "FOUNDER",
    dept: "Executive",      designationTitle: "Founder & CEO",
    bio: "Serial entrepreneur and AI researcher. Forbes Asia 30U30. Previously at Google AI and Microsoft Research. IIT Bombay alumnus.",
    location: "Bengaluru, India", phone: "+91 98765 00001",
    linkedin: "https://linkedin.com/in/vikram-nair-nexusai",
    github:   "https://github.com/vikramnair",
    jobTitle: "Founder & CEO",
  },

  // CO-FOUNDERS (2)
  {
    firstName: "Priya",     lastName: "Sharma",      email: "priya.sharma@nexusai.tech",
    sysRole: "founder",     orgRole: "CO-FOUNDER",
    dept: "Engineering",    designationTitle: "Co-Founder & CTO",
    bio: "Ex-AWS AI/ML Principal Engineer. Built distributed systems serving 10B+ requests/day. IISc Bengaluru researcher in NLP.",
    location: "Bengaluru, India", phone: "+91 98765 00002",
    linkedin: "https://linkedin.com/in/priya-sharma-cto",
    jobTitle: "Co-Founder & CTO",
  },
  {
    firstName: "Arjun",     lastName: "Mehta",       email: "arjun.mehta@nexusai.tech",
    sysRole: "founder",     orgRole: "CO-FOUNDER",
    dept: "Product",        designationTitle: "Co-Founder & CPO",
    bio: "Previously Head of Product at Freshworks and Razorpay. Shipped products used by 50M+ users. BITS Pilani Computer Science.",
    location: "Bengaluru, India", phone: "+91 98765 00003",
    linkedin: "https://linkedin.com/in/arjun-mehta-product",
    jobTitle: "Co-Founder & CPO",
  },

  // ADMINS (5)
  {
    firstName: "Sneha",     lastName: "Iyer",        email: "sneha.iyer@nexusai.tech",
    sysRole: "normal_user", orgRole: "ADMIN",
    dept: "Engineering",    designationTitle: "VP Engineering",
    bio: "15 years building scalable backends. Previously at Oracle, SAP.",
    location: "Bengaluru, India", jobTitle: "VP of Engineering",
  },
  {
    firstName: "Rahul",     lastName: "Gupta",       email: "rahul.gupta@nexusai.tech",
    sysRole: "normal_user", orgRole: "ADMIN",
    dept: "Marketing",      designationTitle: "Chief Marketing Officer",
    bio: "B2B SaaS marketing leader. 12 years in tech marketing. Ex-HubSpot India.",
    location: "Mumbai, India", jobTitle: "CMO",
  },
  {
    firstName: "Kavya",     lastName: "Reddy",       email: "kavya.reddy@nexusai.tech",
    sysRole: "normal_user", orgRole: "ADMIN",
    dept: "HR",              designationTitle: "Chief People Officer",
    bio: "HR transformation expert. Built HR programs for hypergrowth startups scaling from 10 to 500+ employees.",
    location: "Bengaluru, India", jobTitle: "Chief People Officer",
  },
  {
    firstName: "Subhash",   lastName: "Narayan",     email: "subhash.narayan@nexusai.tech",
    sysRole: "normal_user", orgRole: "ADMIN",
    dept: "Finance",         designationTitle: "Chief Financial Officer",
    bio: "CA, CFA. Built finance function for 3 unicorns. Previously EY and Sequoia portfolio companies.",
    location: "Bengaluru, India", jobTitle: "CFO",
  },
  {
    firstName: "Deepa",     lastName: "Krishnan",    email: "deepa.krishnan@nexusai.tech",
    sysRole: "normal_user", orgRole: "ADMIN",
    dept: "Operations",      designationTitle: "Chief Operating Officer",
    bio: "Ex-McKinsey and Flipkart. Operational efficiency expert with P&L ownership experience.",
    location: "Bengaluru, India", jobTitle: "COO",
  },

  // MEMBERS — Engineering (12)
  {
    firstName: "Aditya",   lastName: "Patel",    email: "aditya.patel@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Engineering", designationTitle: "Principal Engineer",
  },
  {
    firstName: "Rohan",    lastName: "Das",      email: "rohan.das@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Engineering", designationTitle: "Senior Software Engineer",
  },
  {
    firstName: "Ananya",   lastName: "Singh",    email: "ananya.singh@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Engineering", designationTitle: "Senior Software Engineer",
  },
  {
    firstName: "Karan",    lastName: "Verma",    email: "karan.verma@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Engineering", designationTitle: "Software Engineer",
  },
  {
    firstName: "Nisha",    lastName: "Joshi",    email: "nisha.joshi@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Engineering", designationTitle: "Software Engineer",
  },
  {
    firstName: "Ayaan",    lastName: "Khan",     email: "ayaan.khan@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Engineering", designationTitle: "Software Engineer",
  },
  {
    firstName: "Divya",    lastName: "Pillai",   email: "divya.pillai@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Engineering", designationTitle: "Backend Engineer",
  },
  {
    firstName: "Siddharth", lastName: "Rao",    email: "siddharth.rao@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Engineering", designationTitle: "Backend Engineer",
  },
  {
    firstName: "Tanvi",    lastName: "Agarwal",  email: "tanvi.agarwal@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Engineering", designationTitle: "Frontend Engineer",
  },
  {
    firstName: "Mohit",    lastName: "Bhatia",   email: "mohit.bhatia@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Engineering", designationTitle: "Frontend Engineer",
  },
  {
    firstName: "Preethi",  lastName: "Nair",     email: "preethi.nair@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Engineering", designationTitle: "DevOps Engineer",
  },
  {
    firstName: "Sameer",   lastName: "Kulkarni", email: "sameer.kulkarni@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Engineering", designationTitle: "QA Engineer",
  },

  // MEMBERS — Data Science (8)
  {
    firstName: "Dr. Leela", lastName: "Menon",   email: "leela.menon@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Data Science", designationTitle: "Head of Data Science",
  },
  {
    firstName: "Farhan",    lastName: "Shaikh",  email: "farhan.shaikh@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Data Science", designationTitle: "Senior Data Scientist",
  },
  {
    firstName: "Lakshmi",   lastName: "Prasad",  email: "lakshmi.prasad@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Data Science", designationTitle: "Senior Data Scientist",
  },
  {
    firstName: "Kunal",     lastName: "Desai",   email: "kunal.desai@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Data Science", designationTitle: "ML Engineer",
  },
  {
    firstName: "Richa",     lastName: "Saxena",  email: "richa.saxena@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Data Science", designationTitle: "ML Engineer",
  },
  {
    firstName: "Abhinav",   lastName: "Tiwari",  email: "abhinav.tiwari@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Data Science", designationTitle: "Data Scientist",
  },
  {
    firstName: "Shruti",    lastName: "Bakshi",  email: "shruti.bakshi@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Data Science", designationTitle: "Data Scientist",
  },
  {
    firstName: "Yash",      lastName: "Chandra", email: "yash.chandra@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Data Science", designationTitle: "Research Engineer",
  },

  // MEMBERS — Product (5)
  {
    firstName: "Meera",     lastName: "Kapoor",  email: "meera.kapoor@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Product", designationTitle: "Senior Product Manager",
  },
  {
    firstName: "Varun",     lastName: "Malhotra", email: "varun.malhotra@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Product", designationTitle: "Product Manager",
  },
  {
    firstName: "Nandita",   lastName: "Bose",    email: "nandita.bose@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Product", designationTitle: "Product Manager",
  },
  {
    firstName: "Gaurav",    lastName: "Mishra",  email: "gaurav.mishra@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Product", designationTitle: "Associate Product Manager",
  },
  {
    firstName: "Ritu",      lastName: "Pandey",  email: "ritu.pandey@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Product", designationTitle: "Product Analyst",
  },

  // MEMBERS — Design (4)
  {
    firstName: "Isha",      lastName: "Bhatt",   email: "isha.bhatt@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Design", designationTitle: "Head of Design",
  },
  {
    firstName: "Nikhil",    lastName: "Roy",     email: "nikhil.roy@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Design", designationTitle: "Senior UX Designer",
  },
  {
    firstName: "Akanksha",  lastName: "Dube",    email: "akanksha.dube@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Design", designationTitle: "UI Designer",
  },
  {
    firstName: "Parth",     lastName: "Shah",    email: "parth.shah@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Design", designationTitle: "UX Researcher",
  },

  // MEMBERS — Marketing (4)
  {
    firstName: "Swati",     lastName: "Mathur",  email: "swati.mathur@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Marketing", designationTitle: "Marketing Manager",
  },
  {
    firstName: "Harsh",     lastName: "Rathore", email: "harsh.rathore@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Marketing", designationTitle: "Content Lead",
  },
  {
    firstName: "Pallavi",   lastName: "Jain",    email: "pallavi.jain@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Marketing", designationTitle: "Growth Marketer",
  },
  {
    firstName: "Mihir",     lastName: "Trivedi", email: "mihir.trivedi@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Marketing", designationTitle: "Content Writer",
  },

  // MEMBERS — Sales (4)
  {
    firstName: "Amita",     lastName: "Dubey",   email: "amita.dubey@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Sales", designationTitle: "VP Sales",
  },
  {
    firstName: "Rajat",     lastName: "Kapila",  email: "rajat.kapila@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Sales", designationTitle: "Account Executive",
  },
  {
    firstName: "Simran",    lastName: "Singh",   email: "simran.singh@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Sales", designationTitle: "Account Executive",
  },
  {
    firstName: "Ishaan",    lastName: "Arora",   email: "ishaan.arora@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Sales", designationTitle: "Sales Development Rep",
  },

  // MEMBERS — HR (2)
  {
    firstName: "Pooja",     lastName: "Menon",   email: "pooja.menon@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "HR", designationTitle: "HR Manager",
  },
  {
    firstName: "Ankur",     lastName: "Bahl",    email: "ankur.bahl@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "HR", designationTitle: "HR Executive",
  },

  // MEMBERS — Finance (2)
  {
    firstName: "Chitra",    lastName: "Venkat",  email: "chitra.venkat@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Finance", designationTitle: "Finance Manager",
  },
  {
    firstName: "Manas",     lastName: "Ghosh",   email: "manas.ghosh@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Finance", designationTitle: "Financial Analyst",
  },

  // MEMBERS — Operations (2)
  {
    firstName: "Sonal",     lastName: "Thakur",  email: "sonal.thakur@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Operations", designationTitle: "Operations Manager",
  },
  {
    firstName: "Vikas",     lastName: "Khurana", email: "vikas.khurana@nexusai.tech",
    sysRole: "normal_user", orgRole: "MEMBER", dept: "Operations", designationTitle: "Business Analyst",
  },

  // GUESTS — Interns / Contractors (8)
  {
    firstName: "Dev",       lastName: "Arun",    email: "dev.arun.intern@nexusai.tech",
    sysRole: "freelancer",  orgRole: "GUEST", dept: "Engineering", designationTitle: "Engineering Intern",
  },
  {
    firstName: "Tanya",     lastName: "Misra",   email: "tanya.misra.intern@nexusai.tech",
    sysRole: "student",     orgRole: "GUEST", dept: "Data Science", designationTitle: "Data Science Intern",
  },
  {
    firstName: "Sujal",     lastName: "Pande",   email: "sujal.pande.intern@nexusai.tech",
    sysRole: "student",     orgRole: "GUEST", dept: "Product", designationTitle: "Product Intern",
  },
  {
    firstName: "Aarav",     lastName: "Choudhury", email: "aarav.choudhury.intern@nexusai.tech",
    sysRole: "student",     orgRole: "GUEST", dept: "Design", designationTitle: "Design Intern",
  },
  {
    firstName: "Gargi",     lastName: "Bhave",   email: "gargi.bhave.intern@nexusai.tech",
    sysRole: "student",     orgRole: "GUEST", dept: "Marketing", designationTitle: "Marketing Intern",
  },
  {
    firstName: "Ivan",      lastName: "Pereira",  email: "ivan.pereira.contractor@nexusai.tech",
    sysRole: "freelancer",  orgRole: "GUEST", dept: "Engineering", designationTitle: "Contract DevOps Engineer",
  },
  {
    firstName: "Aliya",     lastName: "Sheikh",   email: "aliya.sheikh.contractor@nexusai.tech",
    sysRole: "freelancer",  orgRole: "GUEST", dept: "Data Science", designationTitle: "Contract ML Engineer",
  },
  {
    firstName: "Kuljinder", lastName: "Singh",    email: "kuljinder.singh.intern@nexusai.tech",
    sysRole: "student",     orgRole: "GUEST", dept: "Sales", designationTitle: "Business Development Intern",
  },
];

// ─── Teams ───────────────────────────────────────────────────
const TEAMS = [
  { name: "Platform Engineering",  category: "Engineering",   description: "Core NexusAI Platform infrastructure, APIs, and scalability." },
  { name: "Mobile Development",    category: "Engineering",   description: "iOS, Android, and cross-platform SDK development." },
  { name: "Data & ML",             category: "Data Science",  description: "Model training, experimentation, and production ML pipelines." },
  { name: "Product Design",        category: "Design",        description: "UX research, UI design, and design systems." },
  { name: "Growth Marketing",      category: "Marketing",     description: "Demand generation, content strategy, and brand growth." },
  { name: "Enterprise Sales",      category: "Sales",         description: "Enterprise client acquisition and account management." },
  { name: "People & Culture",      category: "HR",            description: "Talent acquisition, employee experience, and culture programs." },
  { name: "Strategic Operations",  category: "Operations",    description: "Business operations, cross-functional alignment, and OKR management." },
];

// ─── Projects ────────────────────────────────────────────────
const PROJECTS = [
  {
    title:       "NexusAI Platform v3.0",
    description: "Major platform release with multimodal AI support, automated compliance reporting, enterprise SSO, and a redesigned admin console. Target: 30% performance improvement across all AI inference endpoints.",
    status:      "active",
    priority:    "high",
    category:    "Product Development",
    progress:    72,
    budget:      1500000,
    tasks: [
      { title: "Design multimodal data ingestion API",           status: "completed", priority: "high",   description: "Define API schema supporting text, image, audio, and structured data inputs. Document OpenAPI spec." },
      { title: "Implement GPU autoscaling infrastructure",       status: "completed", priority: "high",   description: "Build Kubernetes-native GPU autoscaling using KEDA and custom metrics from Prometheus." },
      { title: "Build enterprise SSO integration (SAML 2.0)",   status: "completed", priority: "high",   description: "Implement SAML 2.0 and OIDC SSO connectors for Azure AD, Okta, and Google Workspace." },
      { title: "Automated compliance report generation",         status: "in_progress", priority: "high", description: "Build workflow to auto-generate SOC 2, ISO 27001, and GDPR compliance reports from audit logs." },
      { title: "Redesign admin console UI/UX",                   status: "in_progress", priority: "medium", description: "Full redesign of admin console with new component library, improved navigation, and RBAC controls." },
      { title: "Performance profiling and optimization",         status: "in_progress", priority: "high",   description: "Profile inference latency bottlenecks. Target p99 < 200ms for all standard models." },
      { title: "Write migration guide for v2 → v3 upgrades",    status: "todo",       priority: "medium",  description: "Comprehensive migration documentation for existing enterprise clients upgrading from v2.x." },
      { title: "End-to-end regression test suite",               status: "todo",       priority: "medium",  description: "Build automated regression test suite covering all 840 endpoints with CI/CD integration." },
    ],
  },
  {
    title:       "Enterprise Client Portal",
    description: "Self-service portal allowing enterprise clients to manage API keys, monitor usage, view billing, configure integrations, and access support documentation — reducing sales engineering overhead by 40%.",
    status:      "active",
    priority:    "high",
    category:    "Product Development",
    progress:    55,
    budget:      600000,
    tasks: [
      { title: "API key management dashboard",                   status: "completed",   priority: "high",   description: "Build self-service API key generation, rotation, and scope management UI." },
      { title: "Usage analytics and billing visualization",      status: "completed",   priority: "high",   description: "Integrate Stripe billing with usage metrics dashboard. Show per-project spend breakdowns." },
      { title: "Integration configuration wizard",               status: "in_progress", priority: "high",   description: "No-code wizard for configuring CRM, ERP, and data warehouse integrations." },
      { title: "Client onboarding workflow automation",          status: "in_progress", priority: "medium", description: "Automate new client onboarding with guided setup, sample data imports, and quickstart templates." },
      { title: "Support ticket system integration (Zendesk)",    status: "todo",        priority: "medium", description: "Embed Zendesk widget and custom ticket workflow to improve client support SLAs." },
      { title: "Client health score dashboard for CSMs",        status: "todo",        priority: "low",    description: "Internal dashboard for Customer Success Managers showing client engagement and churn risk signals." },
    ],
  },
  {
    title:       "AI Model Training Infrastructure",
    description: "Build a world-class internal ML platform for training, evaluating, and deploying large language models and custom domain models. Reduce model deployment time from 4 weeks to 3 days.",
    status:      "active",
    priority:    "high",
    category:    "Infrastructure",
    progress:    40,
    budget:      900000,
    tasks: [
      { title: "Set up distributed training cluster (A100 GPUs)", status: "completed",   priority: "high",   description: "Provision 64× A100 GPU cluster on AWS P4dn instances with EFA networking for distributed training." },
      { title: "Implement experiment tracking with MLflow",         status: "completed",   priority: "medium", description: "Deploy MLflow tracking server with PostgreSQL backend. Integrate with all training pipelines." },
      { title: "Build automated model evaluation pipeline",         status: "in_progress", priority: "high",   description: "Automated evaluation harness running MMLU, HellaSwag, and custom enterprise benchmarks per model." },
      { title: "Feature store implementation",                      status: "in_progress", priority: "high",   description: "Build online/offline feature store using Feast. Standardize feature pipelines across all ML products." },
      { title: "Model versioning and registry system",              status: "in_progress", priority: "medium", description: "Implement model registry with semantic versioning, canary deployment, and automated rollback." },
      { title: "Data labeling pipeline with quality controls",      status: "todo",        priority: "medium", description: "Build internal data labeling platform with inter-annotator agreement scoring and quality dashboards." },
      { title: "Cost optimization: spot instance training",         status: "todo",        priority: "low",    description: "Implement fault-tolerant training using AWS Spot Instances to reduce GPU costs by 60%." },
    ],
  },
  {
    title:       "NexusMobile SDK Launch",
    description: "Develop and launch production-ready iOS and Android SDKs enabling third-party mobile app developers to integrate NexusAI capabilities with minimal code. Target: 1000 SDK downloads in first 30 days.",
    status:      "active",
    priority:    "medium",
    category:    "Product Development",
    progress:    65,
    budget:      350000,
    tasks: [
      { title: "iOS Swift SDK — core inference module",           status: "completed",   priority: "high",   description: "Build NexusAI iOS SDK with offline-capable inference, model caching, and background execution." },
      { title: "Android Kotlin SDK — core inference module",     status: "completed",   priority: "high",   description: "Build Android counterpart SDK with equivalent features, JVM-optimized model runtime." },
      { title: "SDK documentation and quick-start guides",       status: "completed",   priority: "medium", description: "Write comprehensive developer docs with code examples, API reference, and onboarding tutorials." },
      { title: "Interactive developer sandbox / playground",     status: "in_progress", priority: "medium", description: "Web-based playground allowing developers to test SDK features and get auto-generated code snippets." },
      { title: "Publish to CocoaPods and Maven Central",         status: "todo",        priority: "high",   description: "Set up automated publishing pipeline for iOS (CocoaPods, SPM) and Android (Maven Central) releases." },
    ],
  },
  {
    title:       "Q2 2024 Brand & Growth Campaign",
    description: "Multi-channel enterprise marketing campaign targeting Series A/B startups and mid-market companies in APAC and EMEA. Goal: 50 qualified enterprise leads and 20% increase in organic traffic.",
    status:      "active",
    priority:    "medium",
    category:    "Marketing",
    progress:    80,
    budget:      250000,
    tasks: [
      { title: "NASSCOM Summit sponsorship & booth design",      status: "completed",   priority: "high",   description: "Design and execute NexusAI's flagship presence at NASSCOM AI Leadership Summit 2024." },
      { title: "Thought leadership content series (12 articles)", status: "completed",  priority: "medium", description: "12-part series on enterprise AI adoption, authored by internal experts. SEO-optimized for target keywords." },
      { title: "Case study production — 3 enterprise clients",   status: "completed",   priority: "high",   description: "Write and design detailed case studies for Bajaj Finance, Apollo Hospitals, and Mahindra Manufacturing." },
      { title: "LinkedIn ABM campaign for APAC enterprise",      status: "in_progress", priority: "medium", description: "Account-based marketing campaign targeting 200 APAC enterprise accounts via LinkedIn Ads + Sales Nav." },
      { title: "Webinar series: AI for Enterprise (4 episodes)", status: "in_progress", priority: "medium", description: "4-part webinar series. Episode 1 recorded (2,400 registrants). Episodes 2–4 in production." },
    ],
  },
  {
    title:       "SOC 2 Type II Compliance Audit",
    description: "Complete SOC 2 Type II audit required by 3 major enterprise contracts. Covers all security, availability, and confidentiality trust service criteria across NexusAI's production environment.",
    status:      "active",
    priority:    "high",
    category:    "Compliance",
    progress:    88,
    budget:      150000,
    tasks: [
      { title: "Scope definition and readiness assessment",       status: "completed",   priority: "high",   description: "Define SOC 2 audit scope covering 12 in-scope systems. Engage Deloitte as auditor." },
      { title: "Evidence collection for security controls",       status: "completed",   priority: "high",   description: "Collect and organize evidence for 180 security controls across Identity, Access, Encryption, and Monitoring." },
      { title: "Penetration testing (internal + external)",       status: "completed",   priority: "high",   description: "Full-scope pentesting by SafeNet Security. All 14 critical findings remediated." },
      { title: "Auditor review and gap remediation",              status: "in_progress", priority: "high",   description: "Working through 23 medium-priority gaps identified by Deloitte. Expected completion: 2 weeks." },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
//  MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════
async function seedNexusAI() {
  const client = await pool.connect();

  try {
    console.log("=".repeat(60));
    console.log("  🚀  NexusAI Technologies Seed Script  🚀");
    console.log("=".repeat(60));

    await client.query("BEGIN");

    // ── 0. Clean Up Existing NexusAI Org ──────────────────
    step("Removing existing NexusAI org (if any)…");
    const existingOrg = await client.query(
      "SELECT organization_id FROM organizations WHERE workspace_url = 'nexusai'",
    );
    if (existingOrg.rows.length > 0) {
      const oldOrgId = existingOrg.rows[0].organization_id;
      await client.query(
        "DELETE FROM organizations WHERE organization_id = $1",
        [oldOrgId],
      );
      log("Removed existing NexusAI organization and all related data (CASCADE).");
    } else {
      log("No existing NexusAI org found, proceeding fresh.");
    }

    // ── 1. Hash Password ───────────────────────────────────
    step("Hashing default password…");
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    log("Password hashed.");

    // ── 2. Create Organization ─────────────────────────────
    step("Creating NexusAI Technologies organization…");
    const joinCode    = crypto.randomBytes(32).toString("hex");
    const securityHash = await bcrypt.hash("NexusSec@Admin2024!", 10);

    const orgRes = await client.query(
      `INSERT INTO organizations
         (name, workspace_url, status, timezone, join_code, security_code_hash, logo_url, brief_description, public_profile, created_at)
       VALUES ($1, $2, 'active', 'Asia/Kolkata', $3, $4, $5, $6, $7, $8)
       RETURNING organization_id`,
      [
        "NexusAI Technologies",
        "nexusai",
        joinCode,
        securityHash,
        "https://placehold.co/400x400/4f46e5/ffffff?text=NAI",
        "Enterprise-grade AI/ML infrastructure for modern businesses. Transform raw data into real-time intelligence.",
        JSON.stringify(ORG_PUBLIC_PROFILE),
        new Date("2021-03-15T09:00:00Z"),
      ],
    );
    const orgId = orgRes.rows[0].organization_id;
    log(`Organization created — ID: ${orgId}`);

    // ── 3. Create Departments ──────────────────────────────
    step("Creating departments…");
    const deptNames = [
      "Executive", "Engineering", "Data Science", "Product",
      "Design",    "Marketing",   "Sales",         "HR",
      "Finance",   "Operations",
    ];
    const deptMap = {};

    for (const deptName of deptNames) {
      const res = await client.query(
        `INSERT INTO organization_departments (organization_id, name)
         VALUES ($1, $2)
         ON CONFLICT (organization_id, name) DO UPDATE SET name = EXCLUDED.name
         RETURNING department_id`,
        [orgId, deptName],
      );
      deptMap[deptName] = res.rows[0].department_id;
    }
    log(`Created ${deptNames.length} departments.`);

    // ── 4. Create Designations ─────────────────────────────
    step("Creating designations…");
    const designationDefs = [
      // Executive
      { title: "Founder & CEO",              dept: "Executive",   level: 1 },
      { title: "Co-Founder & CTO",           dept: "Executive",   level: 1 },
      { title: "Co-Founder & CPO",           dept: "Executive",   level: 1 },
      // Engineering
      { title: "VP Engineering",             dept: "Engineering", level: 2 },
      { title: "Principal Engineer",         dept: "Engineering", level: 3 },
      { title: "Senior Software Engineer",   dept: "Engineering", level: 4 },
      { title: "Software Engineer",          dept: "Engineering", level: 5 },
      { title: "Backend Engineer",           dept: "Engineering", level: 5 },
      { title: "Frontend Engineer",          dept: "Engineering", level: 5 },
      { title: "DevOps Engineer",            dept: "Engineering", level: 5 },
      { title: "QA Engineer",               dept: "Engineering", level: 5 },
      { title: "Engineering Intern",         dept: "Engineering", level: 7 },
      { title: "Contract DevOps Engineer",   dept: "Engineering", level: 6 },
      // Data Science
      { title: "Head of Data Science",       dept: "Data Science", level: 2 },
      { title: "Senior Data Scientist",      dept: "Data Science", level: 3 },
      { title: "Data Scientist",             dept: "Data Science", level: 4 },
      { title: "ML Engineer",               dept: "Data Science", level: 4 },
      { title: "Research Engineer",          dept: "Data Science", level: 4 },
      { title: "Data Science Intern",        dept: "Data Science", level: 7 },
      { title: "Contract ML Engineer",       dept: "Data Science", level: 6 },
      // Product
      { title: "Chief People Officer",       dept: "HR",          level: 1 },
      { title: "VP Product",                 dept: "Product",     level: 2 },
      { title: "Senior Product Manager",     dept: "Product",     level: 3 },
      { title: "Product Manager",            dept: "Product",     level: 4 },
      { title: "Associate Product Manager",  dept: "Product",     level: 5 },
      { title: "Product Analyst",           dept: "Product",     level: 5 },
      { title: "Product Intern",             dept: "Product",     level: 7 },
      // Design
      { title: "Head of Design",             dept: "Design",      level: 2 },
      { title: "Senior UX Designer",         dept: "Design",      level: 3 },
      { title: "UI Designer",               dept: "Design",      level: 4 },
      { title: "UX Researcher",              dept: "Design",      level: 4 },
      { title: "Design Intern",              dept: "Design",      level: 7 },
      // Marketing
      { title: "Chief Marketing Officer",    dept: "Marketing",   level: 1 },
      { title: "Marketing Manager",          dept: "Marketing",   level: 3 },
      { title: "Content Lead",               dept: "Marketing",   level: 4 },
      { title: "Growth Marketer",            dept: "Marketing",   level: 4 },
      { title: "Content Writer",             dept: "Marketing",   level: 5 },
      { title: "Marketing Intern",           dept: "Marketing",   level: 7 },
      // Sales
      { title: "VP Sales",                   dept: "Sales",       level: 2 },
      { title: "Account Executive",          dept: "Sales",       level: 3 },
      { title: "Sales Development Rep",      dept: "Sales",       level: 4 },
      { title: "Business Development Intern",dept: "Sales",       level: 7 },
      // HR
      { title: "HR Manager",                 dept: "HR",          level: 3 },
      { title: "HR Executive",               dept: "HR",          level: 4 },
      // Finance
      { title: "Chief Financial Officer",    dept: "Finance",     level: 1 },
      { title: "Finance Manager",            dept: "Finance",     level: 3 },
      { title: "Financial Analyst",          dept: "Finance",     level: 4 },
      // Operations
      { title: "Chief Operating Officer",    dept: "Operations",  level: 1 },
      { title: "Operations Manager",         dept: "Operations",  level: 3 },
      { title: "Business Analyst",           dept: "Operations",  level: 4 },
    ];

    const designationMap = {};
    for (const d of designationDefs) {
      const deptId = deptMap[d.dept];
      const res = await client.query(
        `INSERT INTO organization_designations (organization_id, title, department_id, hierarchy_level)
         VALUES ($1, $2, $3, $4) RETURNING designation_id`,
        [orgId, d.title, deptId, d.level],
      );
      designationMap[d.title] = res.rows[0].designation_id;
    }
    log(`Created ${designationDefs.length} designations.`);

    // ── 5. Create Users & Members ──────────────────────────
    step(`Creating ${MEMBERS.length} users and org members…`);
    const memberIdMap = {};   // email → organization_member_id
    const userIdMap   = {};   // email → user_id

    for (const m of MEMBERS) {
      // Upsert user (skip if exists)
      let userId;
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [m.email],
      );
      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        warn(`User ${m.email} already exists — reusing ID ${userId}.`);
      } else {
        const uname = m.email.split("@")[0].replace(/[^a-z0-9_]/gi, "_").toLowerCase();
        const res = await client.query(
          `INSERT INTO users
             (username, email, name, first_name, last_name, password_hash, is_verified, role,
              department, job_title, bio, location, phone_number, social_linkedin, social_github)
           VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8, $9, $10, $11, $12, $13, $14)
           RETURNING id`,
          [
            uname,
            m.email,
            `${m.firstName} ${m.lastName}`,
            m.firstName,
            m.lastName,
            passwordHash,
            m.sysRole,
            m.dept,
            m.jobTitle   || m.designationTitle,
            m.bio        || null,
            m.location   || "Bengaluru, India",
            m.phone      || null,
            m.linkedin   || null,
            m.github     || null,
          ],
        );
        userId = res.rows[0].id;
      }
      userIdMap[m.email] = userId;

      // Create org member
      const desigId  = designationMap[m.designationTitle] || null;
      const hourRate = m.orgRole === "FOUNDER" || m.orgRole === "CO-FOUNDER"
        ? 250
        : m.orgRole === "ADMIN"
          ? 150
          : m.orgRole === "GUEST"
            ? 30
            : Math.floor(40 + Math.random() * 100);

      const joinedAt = new Date(
        2021 + Math.floor(Math.random() * 3),
        Math.floor(Math.random() * 12),
        Math.floor(1 + Math.random() * 28),
      );

      const memberRes = await client.query(
        `INSERT INTO organization_members
           (organization_id, user_id, is_active, org_role, designation_id, hourly_cost_rate, joined_at)
         VALUES ($1, $2, true, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE
           SET organization_id = EXCLUDED.organization_id,
               org_role        = EXCLUDED.org_role,
               designation_id  = EXCLUDED.designation_id,
               hourly_cost_rate = EXCLUDED.hourly_cost_rate,
               is_active        = true
         RETURNING organization_member_id`,
        [orgId, userId, m.orgRole, desigId, hourRate, joinedAt],
      );
      memberIdMap[m.email] = memberRes.rows[0].organization_member_id;
    }
    log(`Created/linked ${MEMBERS.length} members.`);

    // ── 6. Create Teams ────────────────────────────────────
    step("Creating teams…");
    const teamIds = {};

    for (const t of TEAMS) {
      const res = await client.query(
        `INSERT INTO organization_teams (organization_id, name, category, description)
         VALUES ($1, $2, $3, $4) RETURNING team_id`,
        [orgId, t.name, t.category, t.description],
      );
      teamIds[t.name] = res.rows[0].team_id;
    }
    log(`Created ${TEAMS.length} teams.`);

    // Assign team leads
    const teamLeadMap = {
      "Platform Engineering":  memberIdMap["priya.sharma@nexusai.tech"],
      "Mobile Development":    memberIdMap["aditya.patel@nexusai.tech"],
      "Data & ML":             memberIdMap["leela.menon@nexusai.tech"],
      "Product Design":        memberIdMap["isha.bhatt@nexusai.tech"],
      "Growth Marketing":      memberIdMap["swati.mathur@nexusai.tech"],
      "Enterprise Sales":      memberIdMap["amita.dubey@nexusai.tech"],
      "People & Culture":      memberIdMap["pooja.menon@nexusai.tech"],
      "Strategic Operations":  memberIdMap["sonal.thakur@nexusai.tech"],
    };

    for (const [teamName, leadMemberId] of Object.entries(teamLeadMap)) {
      if (leadMemberId && teamIds[teamName]) {
        await client.query(
          "UPDATE organization_teams SET team_lead_member_id = $1 WHERE team_id = $2",
          [leadMemberId, teamIds[teamName]],
        );
      }
    }
    log("Team leads assigned.");

    // ── 7. Create Projects + Tasks ─────────────────────────
    step("Creating projects and tasks…");
    const founderUserId = userIdMap["vikram.nair@nexusai.tech"];

    for (const proj of PROJECTS) {
      const startDate = new Date("2024-01-10");
      const dueDate   = new Date("2024-12-31");

      const projRes = await client.query(
        `INSERT INTO projects
           (title, description, status, priority, category, start_date, due_date,
            progress, budget, owner_org_id, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         RETURNING id`,
        [
          proj.title,
          proj.description,
          proj.status,
          proj.priority,
          proj.category,
          startDate,
          dueDate,
          proj.progress,
          proj.budget,
          orgId,
          founderUserId,
        ],
      );
      const projectId = projRes.rows[0].id;

      // Add founder as project owner
      await client.query(
        `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'owner')`,
        [projectId, founderUserId],
      );

      // Create tasks
      const userEmails = Object.keys(userIdMap);
      for (const task of proj.tasks) {
        const assigneeEmail = userEmails[Math.floor(Math.random() * userEmails.length)];
        const assigneeUserId = userIdMap[assigneeEmail];
        // Map task status → kanban_status values
        const kanbanStatus = task.status === 'completed' ? 'done'
          : task.status === 'in_progress' ? 'in_progress'
          : 'todo';

        await client.query(
          `INSERT INTO tasks
             (project_id, title, description, kanban_status, priority, created_by, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            projectId,
            task.title,
            task.description,
            kanbanStatus,
            task.priority,
            founderUserId,
          ],
        );

        // Assign via task_assignees table
        if (assigneeUserId) {
          try {
            const taskRes2 = await client.query(
              'SELECT id FROM tasks WHERE title = $1 AND project_id = $2 ORDER BY id DESC LIMIT 1',
              [task.title, projectId]
            );
            const taskId = taskRes2.rows[0]?.id;
            if (taskId) {
              await client.query(
                'INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [taskId, assigneeUserId]
              );
            }
          } catch {/* silently skip assignee errors */}
        }
      }

      log(`Project: "${proj.title}" — ${proj.tasks.length} tasks created.`);
    }

    // ── 8. Commit ──────────────────────────────────────────
    await client.query("COMMIT");

    console.log("\n" + "=".repeat(60));
    console.log("  🎉  NexusAI Technologies seeded successfully!");
    console.log("=".repeat(60));
    console.log(`  Organization URL : /o/nexusai`);
    console.log(`  Total Members    : ${MEMBERS.length}`);
    console.log(`  Projects Created : ${PROJECTS.length}`);
    console.log(`  Total Tasks      : ${PROJECTS.reduce((sum, p) => sum + p.tasks.length, 0)}`);
    console.log(`  Teams Created    : ${TEAMS.length}`);
    console.log(`  Default Password : ${DEFAULT_PASSWORD}`);
    console.log("=".repeat(60));
    console.log("\n  👤  Key Accounts:");
    console.log(`     Founder (CEO)      : vikram.nair@nexusai.tech`);
    console.log(`     Co-Founder (CTO)   : priya.sharma@nexusai.tech`);
    console.log(`     Co-Founder (CPO)   : arjun.mehta@nexusai.tech`);
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\n❌  Seed script FAILED — transaction rolled back.");
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
  }
}

// ─── Check tasks table columns ───────────────────────────────
async function checkTasksTable() {
  try {
    const res = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'tasks' ORDER BY ordinal_position
    `);
    return res.rows.map((r) => r.column_name);
  } catch {
    return [];
  }
}

// ─── Run ─────────────────────────────────────────────────────
checkTasksTable().then((cols) => {
  if (!cols.length) {
    console.error("❌  Could not read 'tasks' table columns. Is the DB initialized?");
    process.exit(1);
  }
  seedNexusAI();
});
