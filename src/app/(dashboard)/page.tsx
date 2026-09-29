import { WorkspaceBoard } from "@/components/workspace-board";
import { requireUser } from "@/lib/auth";
import { getProjects, getTasks } from "@/lib/db";
export default async function Dashboard(){const user=await requireUser();return <WorkspaceBoard projects={getProjects(user.id)} tasks={getTasks(user.id)}/>}
