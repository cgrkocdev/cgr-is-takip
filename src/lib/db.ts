import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { scryptSync, randomBytes } from "node:crypto";
import type { Project, Subtask, Task } from "./types";

const dbPath = path.resolve(process.env.DATABASE_PATH || "./data/is-takip.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const globalDb = globalThis as unknown as { __isTakipDb?: Database.Database };
export const db = globalDb.__isTakipDb ?? new Database(dbPath);
if (process.env.NODE_ENV !== "production") globalDb.__isTakipDb = db;
db.pragma("busy_timeout = 10000");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', target_date TEXT, status TEXT NOT NULL DEFAULT 'Aktif', color TEXT NOT NULL DEFAULT '#5b5bd6', is_sample INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS project_members (project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, PRIMARY KEY(project_id,user_id));
CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', assignee TEXT NOT NULL DEFAULT '', start_date TEXT, due_date TEXT, status TEXT NOT NULL DEFAULT 'Yapılacak', priority TEXT NOT NULL DEFAULT 'Normal', position INTEGER NOT NULL DEFAULT 0, dependency_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL, is_sample INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS subtasks (id INTEGER PRIMARY KEY, task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, title TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, position INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
`);

export function hashPassword(password: string) { const salt = randomBytes(16).toString("hex"); return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`; }
export function verifyPassword(password: string, stored: string) { const [salt, hash] = stored.split(":"); return !!salt && scryptSync(password, salt, 64).toString("hex") === hash; }

export function getProjects(userId: number): Project[] {
  return db.prepare(`SELECT p.*, COUNT(t.id) total_tasks, SUM(CASE WHEN t.status='Tamamlandı' THEN 1 ELSE 0 END) completed_tasks FROM projects p LEFT JOIN tasks t ON t.project_id=p.id WHERE p.user_id=? OR EXISTS(SELECT 1 FROM project_members pm WHERE pm.project_id=p.id AND pm.user_id=?) GROUP BY p.id ORDER BY p.is_sample DESC, p.created_at DESC`).all(userId,userId) as Project[];
}
export function getProject(userId: number, id: number): Project | undefined {
  return db.prepare(`SELECT p.*, COUNT(t.id) total_tasks, SUM(CASE WHEN t.status='Tamamlandı' THEN 1 ELSE 0 END) completed_tasks FROM projects p LEFT JOIN tasks t ON t.project_id=p.id WHERE p.id=? AND (p.user_id=? OR EXISTS(SELECT 1 FROM project_members pm WHERE pm.project_id=p.id AND pm.user_id=?)) GROUP BY p.id`).get(id,userId,userId) as Project | undefined;
}
export function getTasks(userId: number, projectId?: number): Task[] {
  const rows = db.prepare(`SELECT t.*, p.name project_name, p.color project_color, d.title dependency_title FROM tasks t JOIN projects p ON p.id=t.project_id LEFT JOIN tasks d ON d.id=t.dependency_id WHERE (p.user_id=? OR EXISTS(SELECT 1 FROM project_members pm WHERE pm.project_id=p.id AND pm.user_id=?)) ${projectId ? "AND p.id=?" : ""} ORDER BY t.position, t.id DESC`).all(...(projectId ? [userId,userId,projectId] : [userId,userId])) as Task[];
  const sub = db.prepare("SELECT * FROM subtasks WHERE task_id=? ORDER BY position,id");
  return rows.map((task) => ({ ...task, subtasks: sub.all(task.id) as Subtask[] }));
}

