export const STATUSES = ["Yapılacak", "Devam Ediyor", "Beklemede", "Test Ediliyor", "Tamamlandı"] as const;
export const PRIORITIES = ["Kritik", "Acil", "Normal", "Zamana Yayılabilir"] as const;
export const PROJECT_STATUSES = ["Planlandı", "Aktif", "Beklemede", "Tamamlandı"] as const;
export const ASSIGNEES = ["meyeka", "cgr"] as const;
export type TaskStatus = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type Assignee = (typeof ASSIGNEES)[number];

export type Subtask = { id: number; task_id: number; title: string; completed: number; position: number };
export type Task = {
  id: number; project_id: number; project_name: string; project_color: string; title: string;
  description: string; notes: string; assignee: string; start_date: string | null; due_date: string | null;
  status: TaskStatus; priority: Priority; position: number; dependency_id: number | null;
  dependency_title: string | null; is_sample: number; subtasks: Subtask[];
};
export type Project = {
  id: number; name: string; description: string; target_date: string | null; status: ProjectStatus;
  color: string; is_sample: number; total_tasks: number; completed_tasks: number;
};

export function isOverdue(task: Pick<Task, "due_date" | "status">, today = new Date()): boolean {
  if (!task.due_date || task.status === "Tamamlandı") return false;
  const end = new Date(`${task.due_date}T23:59:59`);
  return end.getTime() < today.getTime();
}

export function progress(project: Pick<Project, "total_tasks" | "completed_tasks">) {
  return project.total_tasks ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0;
}
