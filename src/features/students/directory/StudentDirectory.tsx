import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Eye, Filter, MoreHorizontal, Search, Trash2, UserPlus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteStudent, listStudents } from "../student.service";
import { statusLabel, type Student } from "../student.types";
import { useAuth } from "../../auth/AuthProvider";

const countries = ["UK", "Australia", "Canada", "USA", "Japan", "Korea"];
const statuses = Object.entries(statusLabel);
const tests = ["IELTS", "PTE", "Duolingo", "None"];
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function kathmanduBoundary(date: string, end = false) {
  if (!date) return undefined;
  const value = new Date(`${date}T00:00:00+05:45`);
  if (end) value.setDate(value.getDate() + 1);
  return value.toISOString();
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kathmandu", weekday: "short", year: "numeric", month: "numeric", day: "numeric" }).format(new Date(value));
}

export function StudentDirectory() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Student[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("");
  const [testType, setTestType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      listStudents({ search, country, status, testType, from: kathmanduBoundary(fromDate), to: kathmanduBoundary(toDate, true), weekdays: selectedDays, page, pageSize })
        .then(result => { setRows(result.data); setCount(result.count); })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, country, status, testType, fromDate, toDate, selectedDays, page, pageSize]);

  const resetPage = () => setPage(1);
  const toggleDay = (day: string) => { setSelectedDays(current => current.includes(day) ? current.filter(item => item !== day) : [...current, day]); resetPage(); };
  const clearDateFilters = () => { setFromDate(""); setToDate(""); setSelectedDays([]); resetPage(); };

  async function remove(student: Student) {
    if (!confirm(`Delete ${student.full_name}? This cannot be undone.`)) return;
    await deleteStudent(student.id);
    setRows(rows.filter(item => item.id !== student.id));
    setCount(count - 1);
  }

  const hasDateFilter = Boolean(fromDate || toDate || selectedDays.length);
  return <>
    <section className="page-heading"><div><p className="eyebrow">Student directory</p><h2>Students</h2><p>{count.toLocaleString()} matching students</p></div><Link className="primary-button link-button" to="/students/new"><UserPlus size={17} />Add student</Link></section>
    <article className="panel directory">
      <div className="directory-tools"><div className="search large"><Search size={17} /><input value={search} onChange={event => { setSearch(event.target.value); resetPage(); }} placeholder="Search name, student ID, WhatsApp or email" /></div><div className="filters"><Filter size={16} /><select value={country} onChange={event => { setCountry(event.target.value); resetPage(); }}><option value="">All countries</option>{countries.map(item => <option key={item}>{item}</option>)}</select><select value={status} onChange={event => { setStatus(event.target.value); resetPage(); }}><option value="">All statuses</option>{statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><select value={testType} onChange={event => { setTestType(event.target.value); resetPage(); }}><option value="">All tests</option>{tests.map(item => <option key={item}>{item}</option>)}</select></div></div>
      <div className="date-filter-bar"><div className="date-filter-title"><CalendarDays size={17} /><div><strong>Date & day</strong><span>Registration date</span></div></div><label>From<input type="date" value={fromDate} max={toDate || undefined} onChange={event => { setFromDate(event.target.value); resetPage(); }} /></label><label>To<input type="date" value={toDate} min={fromDate || undefined} onChange={event => { setToDate(event.target.value); resetPage(); }} /></label><div className="weekday-filter" aria-label="Registration weekdays">{weekdays.map(day => <button type="button" className={selectedDays.includes(day) ? "active" : ""} aria-pressed={selectedDays.includes(day)} onClick={() => toggleDay(day)} key={day}>{day.slice(0, 3)}</button>)}</div>{hasDateFilter && <button className="clear-date-filter" type="button" onClick={clearDateFilters}><X size={14} />Clear</button>}</div>
      <div className="table-scroll"><table><thead><tr><th>Student ID</th><th>Name</th><th>WhatsApp</th><th>Country</th><th>Course</th><th>Status</th><th>Counsellor</th><th>Created</th><th /></tr></thead><tbody>{loading ? Array.from({ length: 5 }).map((_, index) => <tr key={index} className="skeleton-row"><td colSpan={9}><i /></td></tr>) : rows.map(student => <tr key={student.id}><td><Link to={`/students/${student.id}`}>{student.student_code}</Link></td><td><strong>{student.full_name}</strong><small>{student.email}</small></td><td>{student.whatsapp}</td><td>{student.study_preferences?.preferred_country || "—"}</td><td>{student.study_preferences?.preferred_course || "—"}</td><td><span className={`status-badge ${student.status.toLowerCase()}`}>{statusLabel[student.status]}</span></td><td>{student.staff_profiles?.full_name || "Unassigned"}</td><td>{displayDate(student.created_at)}</td><td><div className="row-actions"><Link aria-label="View profile" to={`/students/${student.id}`}><Eye size={16} /></Link>{["ADMIN", "DIRECTOR"].includes(profile?.role || "") && <button onClick={() => remove(student)} aria-label="Delete"><Trash2 size={15} /></button>}</div></td></tr>)}</tbody></table>{!loading && !rows.length && <div className="empty-table"><MoreHorizontal /><h3>No matching students</h3><p>Try changing your date, weekday or directory filters.</p></div>}</div>
      <footer className="pagination"><span>Showing {count ? ((page - 1) * pageSize) + 1 : 0}–{Math.min(page * pageSize, count)} of {count}</span><div><select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); resetPage(); }}><option>10</option><option>20</option><option>50</option></select><button disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button><span>Page {page}</span><button disabled={page * pageSize >= count} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button></div></footer>
    </article>
  </>;
}
