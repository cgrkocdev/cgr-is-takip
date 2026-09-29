"use client";
import { X } from "lucide-react";
import { useEffect } from "react";
export function Modal({open,onClose,title,children}:{open:boolean;onClose:()=>void;title:string;children:React.ReactNode}){useEffect(()=>{const e=(x:KeyboardEvent)=>x.key==="Escape"&&onClose();window.addEventListener("keydown",e);return()=>window.removeEventListener("keydown",e)},[onClose]);if(!open)return null;return <div className="dialog-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="dialog" role="dialog" aria-modal="true" aria-label={title}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2>{title}</h2><button className="btn ghost" onClick={onClose} aria-label="Kapat"><X size={20}/></button></div>{children}</section></div>}
