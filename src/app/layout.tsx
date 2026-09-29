import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
export const metadata:Metadata={title:"CGR İş Takip",description:"CGR proje ve iş takip uygulaması",icons:{icon:"/cgr-logo.png"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><body>{children}</body></html>}
