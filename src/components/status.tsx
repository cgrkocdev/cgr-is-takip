import type { Priority, TaskStatus } from "@/lib/types";
import { isOverdue, type Task } from "@/lib/types";
export function StatusBadge({status}:{status:TaskStatus}){const c=status==="Tamamlandı"?"done":status==="Devam Ediyor"?"progress":status==="Beklemede"?"wait":status==="Test Ediliyor"?"test":"";return <span className={`badge ${c}`}>{status}</span>}
export function PriorityBadge({priority}:{priority:Priority}){return <span className={`badge ${priority==="Kritik"?"critical":priority==="Acil"?"urgent":""}`}>{priority}</span>}
export function DueBadge({task}:{task:Task}){if(!task.due_date)return null;return <span className={`badge ${isOverdue(task)?"overdue":""}`}>{isOverdue(task)?"Gecikti · ":""}{new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"short"}).format(new Date(task.due_date+"T12:00:00"))}</span>}
