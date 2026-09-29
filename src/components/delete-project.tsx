"use client";
import { Trash2 } from "lucide-react";
import { deleteProjectAction } from "@/app/actions";
export function DeleteProjectButton({id,name}:{id:number;name:string}){return <form action={deleteProjectAction} onSubmit={e=>{if(!confirm(`“${name}” projesini, tüm işlerini ve alt işlerini silmek istediğinizden emin misiniz?`))e.preventDefault()}}><input type="hidden" name="id" value={id}/><button className="btn danger"><Trash2 size={16}/> Projeyi sil</button></form>}
