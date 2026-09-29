import Database from "better-sqlite3";
const db=new Database(process.env.DATABASE_PATH||"./data/is-takip.db");
db.pragma("foreign_keys=ON");
const result=db.prepare("DELETE FROM projects WHERE is_sample=1").run();
db.prepare("DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE name='Demo Kullanıcı' OR email LIKE 'demo@%')").run();
db.prepare("DELETE FROM users WHERE name='Demo Kullanıcı' OR email LIKE 'demo@%'").run();
db.close();
console.log(`${result.changes} demo proje silindi.`);
