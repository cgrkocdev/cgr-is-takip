import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { db } from "./db";

const COOKIE = "is_takip_oturum";
export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex"); const expires = new Date(Date.now()+30*86400000);
  db.prepare("INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)").run(token,userId,expires.toISOString());
  (await cookies()).set(COOKIE,token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",expires});
}
export async function currentUser() {
  const token=(await cookies()).get(COOKIE)?.value; if(!token) return null;
  return db.prepare("SELECT u.id,u.name,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at > ?").get(token,new Date().toISOString()) as {id:number;name:string;email:string}|undefined ?? null;
}
export async function requireUser() { const user=await currentUser(); if(!user) redirect("/giris"); return user; }
export async function clearSession(){ const store=await cookies(); const token=store.get(COOKIE)?.value; if(token) db.prepare("DELETE FROM sessions WHERE token=?").run(token); store.delete(COOKIE); }
