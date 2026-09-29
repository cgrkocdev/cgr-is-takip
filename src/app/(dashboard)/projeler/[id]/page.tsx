import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { DeleteProjectButton } from "@/components/delete-project";
import { EditProjectButton, EditTaskButton, NewTaskButton } from "@/components/forms";
import { TaskItem } from "@/components/task-item";
import { requireUser } from "@/lib/auth";
import { getProject, getProjects, getTasks } from "@/lib/db";
import { progress } from "@/lib/types";

export default async function ProjectDetail({params}:{params:Promise<{id:string}>}) {
  const {id}=await params; const user=await requireUser(); const project=getProject(user.id,Number(id));
  if(!project) notFound();
  const tasks=getTasks(user.id,project.id), projects=getProjects(user.id);
  return <>
    <div className="page-head"><div><div className="meta"><span className="badge">{project.status}</span>{project.is_sample===1&&<span className="badge sample">Örnek proje</span>}</div><h1 style={{marginTop:8}}>{project.name}</h1><div className="subtle">{project.description}</div></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><NewTaskButton projects={projects} tasks={tasks} defaultProjectId={project.id} label="Hızlı iş ekle"/><EditProjectButton project={project}/><DeleteProjectButton id={project.id} name={project.name}/></div></div>
    <div className="grid stats"><div className="card"><span className="subtle">İlerleme</span><strong style={{fontSize:28,display:"block",marginTop:8}}>{progress(project)}%</strong><div className="progressbar" style={{"--project-color":project.color} as React.CSSProperties}><i style={{width:`${progress(project)}%`}}/></div></div><div className="card"><span className="subtle">Tamamlanan</span><strong style={{fontSize:28,display:"block",marginTop:8}}>{project.completed_tasks}/{project.total_tasks}</strong></div><div className="card"><span className="subtle">Hedef tarih</span><strong style={{fontSize:17,display:"flex",gap:8,alignItems:"center",marginTop:14}}><CalendarDays size={18}/>{project.target_date?new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",year:"numeric"}).format(new Date(project.target_date+"T12:00:00")):"Belirlenmedi"}</strong></div><div className="card"><span className="subtle">Açık iş</span><strong style={{fontSize:28,display:"block",marginTop:8}}>{project.total_tasks-project.completed_tasks}</strong></div></div>
    <div className="card"><div className="section-title"><h2>Proje işleri</h2><span className="subtle">Oklarla elle sıralayabilirsiniz</span></div><div className="list">{tasks.map(t=><div key={t.id} style={{position:"relative"}}><TaskItem task={t} sortable/><div style={{position:"absolute",right:82,top:8}}><EditTaskButton task={t} projects={projects} tasks={tasks}/></div></div>)}{!tasks.length&&<div className="empty"><h3>Bu projede henüz iş yok</h3><p>Yukarıdaki “Hızlı iş ekle” düğmesiyle ilk maddeyi ekleyin.</p></div>}</div></div>
  </>;
}
