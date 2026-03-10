-- Copy and paste the below SQL into Draw.io (Arrange -> Insert -> Advanced -> SQL)
-- This will automatically generate an editable Entity Relationship Diagram for you.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR,
    email VARCHAR UNIQUE,
    password_hash TEXT,
    role VARCHAR,
    created_at TIMESTAMP
);
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE,
    password_hash TEXT,
    role VARCHAR,
    created_at TIMESTAMP
);
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    user_id INTEGER,
    admin_id INTEGER,
    refresh_token_hash TEXT,
    expires_at TIMESTAMP
);
CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR,
    workspace_url VARCHAR UNIQUE,
    subscription_plan_id INTEGER,
    created_at TIMESTAMP
);
CREATE TABLE organization_members (
    organization_member_id SERIAL PRIMARY KEY,
    organization_id INTEGER,
    user_id INTEGER,
    org_role VARCHAR,
    joined_at TIMESTAMP
);
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR,
    status VARCHAR,
    owner_user_id INTEGER,
    owner_org_id INTEGER,
    created_at TIMESTAMP
);
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER,
    user_id INTEGER,
    role VARCHAR
);
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER,
    organization_id INTEGER,
    parent_task_id INTEGER,
    title VARCHAR,
    kanban_status VARCHAR,
    created_by INTEGER
);
CREATE TABLE task_assignees (
    id SERIAL PRIMARY KEY,
    task_id INTEGER,
    user_id INTEGER
);
CREATE TABLE financial_transactions (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER,
    project_id INTEGER,
    amount NUMERIC,
    transaction_type VARCHAR,
    created_by_id INTEGER
);
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    uploader_id INTEGER,
    uploader_type VARCHAR,
    stored_name VARCHAR UNIQUE,
    path TEXT
);
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    platform_name VARCHAR,
    support_email VARCHAR,
    updated_at TIMESTAMP
);
-- Foreign Keys (Draw.io uses these to draw lines)
ALTER TABLE sessions
ADD FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE sessions
ADD FOREIGN KEY (admin_id) REFERENCES admins (id);
ALTER TABLE organization_members
ADD FOREIGN KEY (organization_id) REFERENCES organizations (organization_id);
ALTER TABLE organization_members
ADD FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE projects
ADD FOREIGN KEY (owner_user_id) REFERENCES users (id);
ALTER TABLE projects
ADD FOREIGN KEY (owner_org_id) REFERENCES organizations (organization_id);
ALTER TABLE project_members
ADD FOREIGN KEY (project_id) REFERENCES projects (id);
ALTER TABLE project_members
ADD FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE tasks
ADD FOREIGN KEY (project_id) REFERENCES projects (id);
ALTER TABLE tasks
ADD FOREIGN KEY (organization_id) REFERENCES organizations (organization_id);
ALTER TABLE tasks
ADD FOREIGN KEY (parent_task_id) REFERENCES tasks (id);
ALTER TABLE tasks
ADD FOREIGN KEY (created_by) REFERENCES users (id);
ALTER TABLE task_assignees
ADD FOREIGN KEY (task_id) REFERENCES tasks (id);
ALTER TABLE task_assignees
ADD FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE financial_transactions
ADD FOREIGN KEY (organization_id) REFERENCES organizations (organization_id);
ALTER TABLE financial_transactions
ADD FOREIGN KEY (project_id) REFERENCES projects (id);
ALTER TABLE financial_transactions
ADD FOREIGN KEY (created_by_id) REFERENCES users (id);