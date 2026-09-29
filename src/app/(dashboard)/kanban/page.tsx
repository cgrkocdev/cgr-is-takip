import { NewTaskButton } from "@/components/forms";
import { InlineStatus } from "@/components/task-item";
import { DueBadge, PriorityBadge } from "@/components/status";
import { requireUser } from "@/lib/auth";
import { getProjects, getTasks } from "@/lib/db";
import { STATUSES } from "@/lib/types";
export default async function Kanban(){const user=await requireUser(),projects=getProjects(user.id),tasks=getTasks(user.id);return <><div className="page-head"><div><h1>Kanban</h1><div className="subtle">İşlerin hangi aşamada olduğunu izleyin ve seçiciden durumlarını değiştirin.</div></div><NewTaskButton projects={projects} tasks={tasks}/></div><div className="kanban">{STATUSES.map(status=>{const items=tasks.filter(t=>t.status===status);return <section className="kanban-col" key={status}><div className="kanban-head"><span>{status}</span><span className="badge">{items.length}</span></div>{items.map(t=><article className="kanban-card" key={t.id}><div className="task-title">{t.title}</div><div className="meta"><span style={{color:t.project_color,fontWeight:700}}>{t.project_name}</span><PriorityBadge priority={t.priority}/><DueBadge task={t}/></div><div style={{marginTop:10}}><InlineStatus task={t}/></div></article>)}</section>})}</div></>}
