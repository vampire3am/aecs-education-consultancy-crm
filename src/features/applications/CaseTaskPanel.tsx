import { AlertTriangle, CheckCircle2, ClipboardList, Clock3, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CaseTaskService, type CaseTask } from "../../services/applicationService";
import { StudentDirectoryRecord, StudentService } from "../../services/studentService";

export function CaseTaskPanel() {
  const [tasks, setTasks] = useState<CaseTask[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [view, setView] = useState<"open" | "history">("open");
  const [students, setStudents] = useState<StudentDirectoryRecord[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [form, setForm] = useState({ studentCode: "", title: "", description: "", dueAt: "", priority: "HIGH" as CaseTask["priority"] });

  async function load() { setLoading(true); try { setTasks(await CaseTaskService.list()); setError(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load case tasks"); } finally { setLoading(false); } }
  useEffect(() => { /* eslint-disable-next-line react-hooks/set-state-in-effect */ void load(); void StudentService.getStudents().then(setStudents).catch(() => setStudents([])); }, []);
  async function submit(event: React.FormEvent) { event.preventDefault(); if(!form.studentCode){setError("Select a registered student before creating the task.");return;} try { await CaseTaskService.create(form); setShowForm(false); setStudentSearch(""); setForm({ studentCode: "", title: "", description: "", dueAt: "", priority: "HIGH" }); setNotice("Case task created and added to the deadline queue."); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create task"); } }
  async function complete(id: string) { try { await CaseTaskService.complete(id); setNotice("Task completed successfully and moved to history."); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to complete task"); } }
  function selectStudent(value:string){setStudentSearch(value);const selected=students.find(student=>`${student.fullName} · ${student.code}`===value||student.code===value);setForm(current=>({...current,studentCode:selected?.code||""}));}

  const openTasks = tasks.filter(task => task.status !== "COMPLETED");
  const overdue = openTasks.filter(task => new Date(task.dueAt) < new Date()).length;
  const historyTasks = tasks.filter(task => task.status === "COMPLETED" || task.status === "CANCELLED");
  const visibleTasks = view === "open" ? openTasks : historyTasks;

  return <section className="case-task-panel">
    <header className="case-task-header">
      <div className="case-task-heading"><span className="case-task-icon"><ClipboardList size={18}/></span><div><h3>Case Tasks & Deadlines</h3><p>Track application actions, ownership, and admission deadlines.</p></div></div>
      <div className="case-task-summary"><span><strong>{openTasks.length}</strong> Open</span><span className={overdue ? "is-overdue" : ""}><strong>{overdue}</strong> Overdue</span><button className="btn-primary" type="button" onClick={() => setShowForm(true)}><Plus size={15}/>New Task</button></div>
    </header>
    <nav className="case-task-tabs"><button type="button" className={view==="open"?"active":""} onClick={()=>setView("open")}>Active queue <span>{openTasks.length}</span></button><button type="button" className={view==="history"?"active":""} onClick={()=>setView("history")}>Task history <span>{historyTasks.length}</span></button></nav>
    {notice && <div className="case-task-notice"><CheckCircle2 size={16}/><span>{notice}</span><button type="button" onClick={()=>setNotice("")}><X size={14}/></button></div>}
    {error && <div className="case-task-alert"><AlertTriangle size={16}/><span>{error}</span></div>}
    {loading ? <div className="case-task-empty"><Clock3 size={19}/><div><strong>Loading deadline queue</strong><span>Retrieving assigned application tasks…</span></div></div> : visibleTasks.length === 0 ? <div className="case-task-empty"><CheckCircle2 size={20}/><div><strong>{view==="open"?"No open case tasks":"No task history yet"}</strong><span>{view==="open"?"Create a task when an application requires follow-up, documentation, or a deadline.":"Completed and cancelled tasks will appear here for audit review."}</span></div></div> : <div className="case-task-list">{visibleTasks.slice(0, 12).map(task => { const isOverdue = task.status!=="COMPLETED"&&new Date(task.dueAt) < new Date(); return <article key={task.id} className={isOverdue ? "overdue" : ""}><div className="case-task-name"><b>{task.title}</b><small>{task.studentName} · {task.studentCode}</small></div><span className={`case-task-priority ${task.priority.toLowerCase()}`}>{view==="history"?task.status:task.priority}</span><div className="case-task-owner"><small>Owner</small><strong>{task.assignee}</strong></div><time><Clock3 size={13}/>{new Date(task.dueAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</time>{view==="open"?<button type="button" onClick={() => complete(task.id)}><CheckCircle2 size={15}/>Complete</button>:<span className="case-task-history-status"><CheckCircle2 size={15}/>Archived</span>}</article>; })}</div>}
    {showForm && <div className="modal-backdrop-clean" onClick={() => setShowForm(false)}><div className="modal-dialog-clean case-task-modal" onClick={event => event.stopPropagation()}><div className="modal-header-clean"><div><small>APPLICATION OPERATIONS</small><h3>Create Case Task</h3><p>Assign a clear action and deadline to a registered student case.</p></div><button className="drawer-close-btn" type="button" onClick={() => setShowForm(false)}><X size={18}/></button></div><form className="modal-form-clean case-task-form" onSubmit={submit}><div className="case-task-form-body"><div className="form-row-2"><div className="form-group"><label>Search student *</label><input list="case-task-students" required value={studentSearch} onChange={event=>selectStudent(event.target.value)} placeholder="Search name or AECS code" autoComplete="off"/><datalist id="case-task-students">{students.map(student=><option key={student.id} value={`${student.fullName} · ${student.code}`}>{student.email}</option>)}</datalist></div><div className="form-group"><label>Student code</label><input readOnly className="application-readonly-field" value={form.studentCode} placeholder="Filled automatically"/></div></div><div className="form-group"><label>Task title *</label><input required minLength={2} value={form.title} onChange={event => setForm({...form,title:event.target.value})} placeholder="Example: Submit missing financial document"/></div><div className="form-row-2"><div className="form-group"><label>Deadline *</label><input type="datetime-local" required value={form.dueAt} onChange={event => setForm({...form,dueAt:event.target.value})}/></div><div className="form-group"><label>Priority</label><select value={form.priority} onChange={event => setForm({...form,priority:event.target.value as CaseTask["priority"]})}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div></div><div className="form-group"><label>Description</label><textarea value={form.description} onChange={event => setForm({...form,description:event.target.value})} placeholder="Add acceptance criteria, required documents, or hand-off notes."/></div></div><div className="modal-footer-clean"><button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="btn-primary" type="submit"><Plus size={14}/>Create Task</button></div></form></div></div>}
  </section>;
}
