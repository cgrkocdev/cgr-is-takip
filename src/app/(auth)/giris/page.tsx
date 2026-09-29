import Image from "next/image";
import { AuthForm } from "@/components/auth-form";
export default function Login(){return <div className="auth-card"><Image src="/cgr-logo.png" width={112} height={112} alt="CGR İş Takip logosu" className="login-logo" priority/><h2>Tekrar hoş geldiniz</h2><p className="subtle" style={{marginBottom:24}}>CGR İş Takip çalışma alanına giriş yapın.</p><AuthForm/></div>}
