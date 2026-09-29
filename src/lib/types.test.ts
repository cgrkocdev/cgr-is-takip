import { describe, expect, it } from "vitest";
import { isOverdue, progress } from "./types";
describe("iş tarihleri",()=>{it("geçmiş teslimi gecikmiş sayar ama durumu değiştirmez",()=>{const task={due_date:"2026-01-01",status:"Beklemede" as const};expect(isOverdue(task,new Date("2026-01-02T12:00:00"))).toBe(true);expect(task.status).toBe("Beklemede")});it("tamamlanan işi gecikmiş saymaz",()=>expect(isOverdue({due_date:"2026-01-01",status:"Tamamlandı"},new Date("2026-01-02"))).toBe(false))});
describe("proje ilerlemesi",()=>{it("tamamlanan iş oranını hesaplar",()=>expect(progress({total_tasks:4,completed_tasks:3})).toBe(75));it("boş projede sıfır döner",()=>expect(progress({total_tasks:0,completed_tasks:0})).toBe(0))});
