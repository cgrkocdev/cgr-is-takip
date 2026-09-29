"use client";
import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/actions";
const initial:ActionState={};
export function AuthForm(){const[state,formAction,pending]=useActionState(loginAction,initial);return <form action={formAction} className="form"><div className="field"><label>Kullanıcı adı</label><input className="input" name="identifier" autoComplete="username" placeholder="meyeka veya cgr" required autoFocus/></div><div className="field"><label>Şifre</label><input className="input" type="password" name="password" autoComplete="current-password" required/></div>{state.error&&<div className="alert">{state.error}</div>}<button className="btn" disabled={pending}>{pending?"Giriş yapılıyor…":"Giriş yap"}</button><p className="subtle" style={{textAlign:"center",margin:0}}>Bu çalışma alanı yalnızca yetkili kullanıcılar içindir.</p></form>}
