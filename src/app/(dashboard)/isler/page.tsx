import { NewTaskButton } from "@/components/forms";
import { TaskFilters } from "@/components/task-filters";
import { requireUser } from "@/lib/auth";
import { getProjects, getTasks } from "@/lib/db";
export default async function Tasks(){const user=await requireUser(),projects=getProjects(user.id),tasks=getTasks(user.id);return <><div className="page-head"><div><h1>İş listesi</h1><div className="subtle">{tasks.length} işi arayın, filtreleyin ve güncelleyin.</div></div><NewTaskButton projects={projects} tasks={tasks}/></div><TaskFilters tasks={tasks} projects={projects}/></>}
