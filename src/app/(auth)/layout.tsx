import Image from "next/image";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function AuthLayout({children}:{children:React.ReactNode}){if(await currentUser())redirect("/");return <div className="auth-page"><section className="auth-hero"><div className="brand"><Image src="/cgr-logo.png" width={68} height={68} alt="CGR logosu" className="brand-logo" priority/> CGR İş Takip</div><h1>Projeler net.<br/>Öncelikler görünür.<br/>İlerleme kontrolünüzde.</h1><p style={{color:"#aebbd0",maxWidth:510,lineHeight:1.7}}>Proje kategorilerini ve tüm maddeleri tek bir çalışma alanında yönetin.</p></section><main className="auth-panel">{children}</main></div>}
