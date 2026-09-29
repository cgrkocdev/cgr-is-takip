"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, createSession, requireUser } from "@/lib/auth";
import { db, hashPassword, verifyPassword } from "@/lib/db";
import { projectSchema, taskSchema } from "@/lib/validation";
import { ASSIGNEES, PRIORITIES, STATUSES } from "@/lib/types";

export type ActionState={error?:string;success?:string};
const val=(f:FormData,k:string)=>String(f.get(k)??"");
function refresh(){ revalidatePath("/","layout"); }
function ownsProject(userId:number,id:number){ return !!db.prepare("SELECT p.id FROM projects p WHERE p.id=? AND (p.user_id=? OR EXISTS(SELECT 1 FROM project_members pm WHERE pm.project_id=p.id AND pm.user_id=?))").get(id,userId,userId); }
function ownsTask(userId:number,id:number){ return !!db.prepare("SELECT t.id FROM tasks t JOIN projects p ON p.id=t.project_id WHERE t.id=? AND (p.user_id=? OR EXISTS(SELECT 1 FROM project_members pm WHERE pm.project_id=p.id AND pm.user_id=?))").get(id,userId,userId); }
function dependencyReady(dependencyId:number|null){if(!dependencyId)return true;const row=db.prepare("SELECT status FROM tasks WHERE id=?").get(dependencyId) as {status:string}|undefined;return row?.status==="Tamamlandı";}

export async function loginAction(_:ActionState,form:FormData):Promise<ActionState>{
  const identifier=val(form,"identifier").trim().toLowerCase(), password=val(form,"password");
  const user=db.prepare("SELECT * FROM users WHERE lower(name)=? OR lower(email)=?").get(identifier,identifier) as {id:number;password_hash:string}|undefined;
  if(!user||!verifyPassword(password,user.password_hash)) return {error:"Kullanıcı adı veya şifre hatalı."};
  await createSession(user.id); redirect("/");
}
export async function registerAction(_:ActionState,form:FormData):Promise<ActionState>{
  const name=val(form,"name").trim(), email=val(form,"email").trim().toLowerCase(), password=val(form,"password");
  if(name.length<2||!email.includes("@")||password.length<8) return {error:"Ad, geçerli e-posta ve en az 8 karakterli şifre girin."};
  try { const id=Number(db.prepare("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)").run(name,email,hashPassword(password)).lastInsertRowid); await createSession(id); } catch { return {error:"Bu e-posta zaten kayıtlı."}; }
  redirect("/");
}
export async function logoutAction(){ await clearSession(); redirect("/giris"); }
export async function createProjectAction(_:ActionState,form:FormData):Promise<ActionState>{
  const user=await requireUser(); const parsed=projectSchema.safeParse(Object.fromEntries(form));
  if(!parsed.success)return {error:parsed.error.issues[0].message}; const d=parsed.data;
  const projectId=Number(db.prepare("INSERT INTO projects(user_id,name,description,target_date,status,color) VALUES(?,?,?,?,?,?)").run(user.id,d.name,d.description,d.target_date||null,d.status,d.color).lastInsertRowid);
  db.prepare("INSERT OR IGNORE INTO project_members(project_id,user_id) SELECT ?,id FROM users WHERE name IN ('meyeka','cgr')").run(projectId);
  refresh(); return {success:"Kategori oluşturuldu."};
}
export async function updateProjectAction(form:FormData){ const user=await requireUser(); const id=Number(form.get("id")); if(!ownsProject(user.id,id)) return;
  const parsed=projectSchema.safeParse(Object.fromEntries(form)); if(!parsed.success)return;
  const d=parsed.data; db.prepare("UPDATE projects SET name=?,description=?,target_date=?,status=?,color=? WHERE id=?").run(d.name,d.description,d.target_date||null,d.status,d.color,id); refresh();
}
export async function deleteProjectAction(form:FormData){ const user=await requireUser(); const id=Number(form.get("id")); if(ownsProject(user.id,id))db.prepare("DELETE FROM projects WHERE id=?").run(id); refresh(); redirect("/"); }
export async function createTaskAction(_:ActionState,form:FormData):Promise<ActionState>{ const user=await requireUser(); const parsed=taskSchema.safeParse(Object.fromEntries(form)); if(!parsed.success)return{error:parsed.error.issues[0].message}; const d=parsed.data;
  if(!ownsProject(user.id,d.project_id))return{error:"Proje bulunamadı."}; const dep=d.dependency_id?Number(d.dependency_id):null; if(dep&&!ownsTask(user.id,dep))return{error:"Bağımlı iş bulunamadı."}; if(!dependencyReady(dep)&&["Devam Ediyor","Test Ediliyor","Tamamlandı"].includes(d.status))return{error:"Bu iş, bağlı olduğu iş tamamlanmadan başlatılamaz."};
  const pos=(db.prepare("SELECT COALESCE(MAX(position),-1)+1 n FROM tasks WHERE project_id=?").get(d.project_id) as {n:number}).n;
  db.prepare("INSERT INTO tasks(project_id,title,description,notes,assignee,start_date,due_date,status,priority,position,dependency_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)").run(d.project_id,d.title,d.description,d.notes,d.assignee,d.start_date||null,d.due_date||null,d.status,d.priority,pos,dep); refresh(); return{success:"İş eklendi."}; }
export async function updateTaskAction(form:FormData){ const user=await requireUser(),id=Number(form.get("id")); if(!ownsTask(user.id,id))return; const parsed=taskSchema.safeParse(Object.fromEntries(form)); if(!parsed.success)return; const d=parsed.data; if(!ownsProject(user.id,d.project_id))return;
  const dep=d.dependency_id?Number(d.dependency_id):null; if(dep===id||(!dependencyReady(dep)&&["Devam Ediyor","Test Ediliyor","Tamamlandı"].includes(d.status)))return; db.prepare("UPDATE tasks SET project_id=?,title=?,description=?,notes=?,assignee=?,start_date=?,due_date=?,status=?,priority=?,dependency_id=? WHERE id=?").run(d.project_id,d.title,d.description,d.notes,d.assignee,d.start_date||null,d.due_date||null,d.status,d.priority,dep,id); refresh(); }
export async function updateTaskFieldAction(form:FormData){
  const user=await requireUser(),id=Number(form.get("id")),field=val(form,"field"),value=val(form,"value");
  if(!ownsTask(user.id,id))return {success:false,error:"Bu maddeye erişiminiz yok."};
  if(field==="status"&&STATUSES.includes(value as never)){
    const row=db.prepare("SELECT dependency_id FROM tasks WHERE id=?").get(id) as {dependency_id:number|null};
    if(!dependencyReady(row.dependency_id)&&["Devam Ediyor","Test Ediliyor","Tamamlandı"].includes(value))return {success:false,error:"Bağlı madde tamamlanmadan bu aşamaya taşınamaz."};
    db.prepare("UPDATE tasks SET status=? WHERE id=?").run(value,id);
  }
  if(field==="priority"&&PRIORITIES.includes(value as never))db.prepare("UPDATE tasks SET priority=? WHERE id=?").run(value,id);
  if(field==="assignee"&&ASSIGNEES.includes(value as never))db.prepare("UPDATE tasks SET assignee=? WHERE id=?").run(value,id);
  if(field==="due_date"&&(/^\d{4}-\d{2}-\d{2}$/.test(value)||value===""))db.prepare("UPDATE tasks SET due_date=? WHERE id=?").run(value||null,id);
  refresh();return {success:true};
}
export async function moveTaskAction(form:FormData){ const user=await requireUser(),id=Number(form.get("id")),direction=val(form,"direction"); const task=db.prepare("SELECT t.* FROM tasks t JOIN projects p ON p.id=t.project_id WHERE t.id=? AND p.user_id=?").get(id,user.id) as {project_id:number;position:number}|undefined; if(!task)return; const op=direction==="up"?"<":">",sort=direction==="up"?"DESC":"ASC"; const other=db.prepare(`SELECT id,position FROM tasks WHERE project_id=? AND position ${op} ? ORDER BY position ${sort} LIMIT 1`).get(task.project_id,task.position) as {id:number;position:number}|undefined; if(other){const tx=db.transaction(()=>{db.prepare("UPDATE tasks SET position=? WHERE id=?").run(other.position,id);db.prepare("UPDATE tasks SET position=? WHERE id=?").run(task.position,other.id)});tx();}refresh(); }
export async function deleteTaskAction(form:FormData){ const user=await requireUser(),id=Number(form.get("id")); if(ownsTask(user.id,id))db.prepare("DELETE FROM tasks WHERE id=?").run(id); refresh(); }
export async function addSubtaskAction(form:FormData){ const user=await requireUser(),taskId=Number(form.get("task_id")),title=val(form,"title").trim(); if(title&&ownsTask(user.id,taskId)){const p=(db.prepare("SELECT COALESCE(MAX(position),-1)+1 n FROM subtasks WHERE task_id=?").get(taskId) as {n:number}).n;db.prepare("INSERT INTO subtasks(task_id,title,position)VALUES(?,?,?)").run(taskId,title,p);}refresh(); }
export async function toggleSubtaskAction(form:FormData){ const user=await requireUser(),id=Number(form.get("id")); const row=db.prepare("SELECT s.id FROM subtasks s JOIN tasks t ON t.id=s.task_id JOIN projects p ON p.id=t.project_id WHERE s.id=? AND p.user_id=?").get(id,user.id); if(row)db.prepare("UPDATE subtasks SET completed=1-completed WHERE id=?").run(id);refresh(); }
export async function deleteSubtaskAction(form:FormData){const user=await requireUser(),id=Number(form.get("id"));const row=db.prepare("SELECT s.id FROM subtasks s JOIN tasks t ON t.id=s.task_id JOIN projects p ON p.id=t.project_id WHERE s.id=? AND p.user_id=?").get(id,user.id);if(row)db.prepare("DELETE FROM subtasks WHERE id=?").run(id);refresh();}
