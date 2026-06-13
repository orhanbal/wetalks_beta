import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Plus, X, Check, ChevronLeft, ChevronRight,
  Circle, Clock, AlertCircle, Pencil, Trash2, BookOpen,
  Link2, Flag, FileText, ChevronDown, FilePlus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useSEO } from '../hooks/useSEO';
import type { Article } from '../data/articles';
import type { Series } from '../data/series';

// ─── Types ──────────────────────────────────────────────────────

type TaskStatus = 'todo' | 'in_progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';
type PlanStatus = 'draft' | 'ready' | 'published';

interface AgendaTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  article_id: string | null;
  series_id: string | null;
  tags: string[];
  created_at: string;
}

interface ContentPlan {
  id: string;
  title: string;
  body: string;
  article_id: string | null;
  series_id: string | null;
  planned_date: string | null;
  status: PlanStatus;
  created_at: string;
}

type ModalMode = 'task' | 'plan';

// ─── Helpers ────────────────────────────────────────────────────

function slugify(title: string) {
  return title.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}
function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function todayStr() {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

const priorityColor: Record<TaskPriority, string> = {
  low: '#22c55e', medium: '#f59e0b', high: '#ef4444',
};
const priorityLabel: Record<TaskPriority, string> = {
  low: 'Düşük', medium: 'Orta', high: 'Yüksek',
};
const statusLabel: Record<TaskStatus, string> = {
  todo: 'Yapılacak', in_progress: 'Devam Ediyor', done: 'Tamamlandı',
};
const planStatusLabel: Record<PlanStatus, string> = {
  draft: 'Taslak', ready: 'Hazır', published: 'Yayında',
};
const planStatusColor: Record<PlanStatus, string> = {
  draft: '#94a3b8', ready: '#3b82f6', published: '#22c55e',
};

// ─── Unscheduled Items Sidebar ───────────────────────────────────

interface UnscheduledProps {
  tasks: AgendaTask[];
  plans: ContentPlan[];
  articles: Article[];
  seriesList: Series[];
  onEditTask: (t: AgendaTask) => void;
  onDeleteTask: (id: string) => void;
  onToggleDone: (t: AgendaTask) => void;
  onEditPlan: (p: ContentPlan) => void;
  onDeletePlan: (id: string) => void;
  onCreateDraft: (p: ContentPlan) => void;
}

function UnscheduledSidebar({ tasks, plans, articles, seriesList, onEditTask, onDeleteTask, onToggleDone, onEditPlan, onDeletePlan, onCreateDraft }: UnscheduledProps) {
  const [tasksOpen, setTasksOpen] = useState(true);
  const [plansOpen, setPlansOpen] = useState(true);

  const unscheduledTasks = tasks.filter(t => !t.due_date);
  const unscheduledPlans = plans.filter(p => !p.planned_date);

  if (unscheduledTasks.length === 0 && unscheduledPlans.length === 0) return null;

  return (
    <div className="ag-unscheduled">
      <div className="ag-unscheduled-title">Tarihlenmemiş</div>

      {unscheduledTasks.length > 0 && (
        <div className="ag-unscheduled-section">
          <button className="ag-unscheduled-sec-header" onClick={() => setTasksOpen(o => !o)}>
            <span>Görevler ({unscheduledTasks.length})</span>
            <ChevronDown size={13} style={{ transform: tasksOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {tasksOpen && unscheduledTasks.map(t => (
            <div key={t.id} className={`ag-mini-item ${t.status === 'done' ? 'ag-mini-item--done' : ''}`}>
              <button className="ag-mini-check" onClick={() => onToggleDone(t)}>
                {t.status === 'done' ? <Check size={10} /> : <Circle size={10} />}
              </button>
              <span className="ag-mini-dot" style={{ background: priorityColor[t.priority] }} />
              <span className="ag-mini-title">{t.title}</span>
              <div className="ag-mini-actions">
                <button className="ag-icon-btn-xs" onClick={() => onEditTask(t)}><Pencil size={10} /></button>
                <button className="ag-icon-btn-xs ag-icon-btn-xs--danger" onClick={() => onDeleteTask(t.id)}><Trash2 size={10} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {unscheduledPlans.length > 0 && (
        <div className="ag-unscheduled-section">
          <button className="ag-unscheduled-sec-header" onClick={() => setPlansOpen(o => !o)}>
            <span>İçerik Planları ({unscheduledPlans.length})</span>
            <ChevronDown size={13} style={{ transform: plansOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          {plansOpen && unscheduledPlans.map(p => (
            <div key={p.id} className="ag-mini-item">
              <span className="ag-mini-dot ag-mini-dot--square" style={{ background: planStatusColor[p.status] }} />
              <span className="ag-mini-title">{p.title}</span>
              <span className="ag-mini-badge" style={{ color: planStatusColor[p.status] }}>{planStatusLabel[p.status]}</span>
              <div className="ag-mini-actions">
                <button className="ag-icon-btn-xs ag-icon-btn-xs--create" title="Taslak makale oluştur" onClick={() => onCreateDraft(p)}><FilePlus size={10} /></button>
                <button className="ag-icon-btn-xs" onClick={() => onEditPlan(p)}><Pencil size={10} /></button>
                <button className="ag-icon-btn-xs ag-icon-btn-xs--danger" onClick={() => onDeletePlan(p.id)}><Trash2 size={10} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Day Detail Panel ────────────────────────────────────────────

interface DayDetailProps {
  dateStr: string;
  tasks: AgendaTask[];
  plans: ContentPlan[];
  articles: Article[];
  seriesList: Series[];
  onClose: () => void;
  onAddTask: (date: string) => void;
  onAddPlan: (date: string) => void;
  onEditTask: (t: AgendaTask) => void;
  onDeleteTask: (id: string) => void;
  onToggleDone: (t: AgendaTask) => void;
  onEditPlan: (p: ContentPlan) => void;
  onDeletePlan: (id: string) => void;
  onCreateDraft: (p: ContentPlan) => void;
}

function DayDetail({ dateStr, tasks, plans, articles, seriesList, onClose, onAddTask, onAddPlan, onEditTask, onDeleteTask, onToggleDone, onEditPlan, onDeletePlan, onCreateDraft }: DayDetailProps) {
  const [d, m, y] = [
    parseInt(dateStr.split('-')[2]),
    parseInt(dateStr.split('-')[1]) - 1,
    parseInt(dateStr.split('-')[0]),
  ];
  const label = `${d} ${MONTHS[m]} ${y}`;
  const isToday = dateStr === todayStr();

  return (
    <div className="ag-day-panel">
      <div className="ag-day-panel-header">
        <div className="ag-day-panel-date">
          <span className={`ag-day-panel-num ${isToday ? 'ag-day-panel-num--today' : ''}`}>{d}</span>
          <div>
            <div className="ag-day-panel-month">{MONTHS[m]} {y}</div>
            {isToday && <div className="ag-day-panel-today-label">Bugün</div>}
          </div>
        </div>
        <div className="ag-day-panel-actions">
          <button className="ag-day-panel-btn" onClick={() => onAddTask(dateStr)}>
            <Plus size={12} /> Görev
          </button>
          <button className="ag-day-panel-btn ag-day-panel-btn--plan" onClick={() => onAddPlan(dateStr)}>
            <Plus size={12} /> Plan
          </button>
          <button className="ag-day-panel-close" onClick={onClose}><X size={14} /></button>
        </div>
      </div>

      <div className="ag-day-panel-body">
        {tasks.length === 0 && plans.length === 0 && (
          <div className="ag-day-panel-empty">
            <p>Bu gün için kayıt yok.</p>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="ag-day-panel-section">
            <div className="ag-day-panel-sec-label"><Circle size={11} /> Görevler</div>
            {tasks.map(t => (
              <div key={t.id} className={`ag-day-task ${t.status === 'done' ? 'ag-day-task--done' : ''}`}>
                <button className="ag-day-check" onClick={() => onToggleDone(t)}>
                  {t.status === 'done' ? <Check size={12} /> : <Circle size={12} />}
                </button>
                <div className="ag-day-task-body">
                  <div className="ag-day-task-top">
                    <span className="ag-day-task-title">{t.title}</span>
                    <span className="ag-day-task-pri" style={{ color: priorityColor[t.priority] }}>
                      <Flag size={10} /> {priorityLabel[t.priority]}
                    </span>
                  </div>
                  {t.description && <p className="ag-day-task-desc">{t.description}</p>}
                  <div className="ag-day-task-meta">
                    <span className="ag-day-task-status">{statusLabel[t.status]}</span>
                    {t.article_id && <span className="ag-day-task-link"><BookOpen size={10} /> {articles.find(a => a.id === t.article_id)?.title ?? t.article_id}</span>}
                    {t.series_id && <span className="ag-day-task-link"><Link2 size={10} /> {seriesList.find(s => s.id === t.series_id)?.title ?? t.series_id}</span>}
                    {t.tags.map(tag => <span key={tag} className="ag-day-task-tag">{tag}</span>)}
                  </div>
                </div>
                <div className="ag-mini-actions">
                  <button className="ag-icon-btn-xs" onClick={() => onEditTask(t)}><Pencil size={10} /></button>
                  <button className="ag-icon-btn-xs ag-icon-btn-xs--danger" onClick={() => onDeleteTask(t.id)}><Trash2 size={10} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {plans.length > 0 && (
          <div className="ag-day-panel-section">
            <div className="ag-day-panel-sec-label"><FileText size={11} /> İçerik Planları</div>
            {plans.map(p => (
              <div key={p.id} className="ag-day-plan">
                <div className="ag-day-plan-header">
                  <span className="ag-mini-dot ag-mini-dot--square" style={{ background: planStatusColor[p.status] }} />
                  <span className="ag-day-plan-title">{p.title}</span>
                  <span className="ag-day-task-pri" style={{ color: planStatusColor[p.status] }}>{planStatusLabel[p.status]}</span>
                  <div className="ag-mini-actions">
                    <button className="ag-icon-btn-xs ag-icon-btn-xs--create" title="Taslak makale oluştur" onClick={() => onCreateDraft(p)}><FilePlus size={10} /></button>
                    <button className="ag-icon-btn-xs" onClick={() => onEditPlan(p)}><Pencil size={10} /></button>
                    <button className="ag-icon-btn-xs ag-icon-btn-xs--danger" onClick={() => onDeletePlan(p.id)}><Trash2 size={10} /></button>
                  </div>
                </div>
                {p.article_id && <div className="ag-day-task-meta" style={{ marginTop: 4 }}><span className="ag-day-task-link"><BookOpen size={10} /> {articles.find(a => a.id === p.article_id)?.title ?? p.article_id}</span></div>}
                {p.series_id && <div className="ag-day-task-meta" style={{ marginTop: 4 }}><span className="ag-day-task-link"><Link2 size={10} /> {seriesList.find(s => s.id === p.series_id)?.title ?? p.series_id}</span></div>}
                {p.body && <pre className="ag-day-plan-body">{p.body}</pre>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Task Form ───────────────────────────────────────────────────

interface TaskFormProps {
  initial?: Partial<AgendaTask>;
  articles: Article[];
  seriesList: Series[];
  onSave: (data: Omit<AgendaTask, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

function TaskForm({ initial, articles, seriesList, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'todo');
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '');
  const [articleId, setArticleId] = useState(initial?.article_id ?? '');
  const [seriesId, setSeriesId] = useState(initial?.series_id ?? '');
  const [tagInput, setTagInput] = useState((initial?.tags ?? []).join(', '));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description, status, priority, due_date: dueDate || null, article_id: articleId || null, series_id: seriesId || null, tags: tagInput.split(',').map(t => t.trim()).filter(Boolean) });
  };

  return (
    <form onSubmit={handleSubmit} className="agenda-form">
      <div className="agenda-form-field">
        <label className="agenda-form-label">Başlık *</label>
        <input className="agenda-form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Görev başlığı..." autoFocus />
      </div>
      <div className="agenda-form-field">
        <label className="agenda-form-label">Açıklama</label>
        <textarea className="agenda-form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detay veya notlar..." rows={3} />
      </div>
      <div className="agenda-form-row">
        <div className="agenda-form-field">
          <label className="agenda-form-label">Durum</label>
          <select className="agenda-form-select" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
            <option value="todo">Yapılacak</option>
            <option value="in_progress">Devam Ediyor</option>
            <option value="done">Tamamlandı</option>
          </select>
        </div>
        <div className="agenda-form-field">
          <label className="agenda-form-label">Öncelik</label>
          <select className="agenda-form-select" value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>
        <div className="agenda-form-field">
          <label className="agenda-form-label">Bitiş Tarihi</label>
          <input type="date" className="agenda-form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>
      <div className="agenda-form-row">
        <div className="agenda-form-field">
          <label className="agenda-form-label">Makaleye Bağla</label>
          <select className="agenda-form-select" value={articleId} onChange={e => setArticleId(e.target.value)}>
            <option value="">— Yok —</option>
            {articles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
        <div className="agenda-form-field">
          <label className="agenda-form-label">Diziye Bağla</label>
          <select className="agenda-form-select" value={seriesId} onChange={e => setSeriesId(e.target.value)}>
            <option value="">— Yok —</option>
            {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
      </div>
      <div className="agenda-form-field">
        <label className="agenda-form-label">Etiketler (virgülle ayır)</label>
        <input className="agenda-form-input" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="araştırma, taslak, revizyon..." />
      </div>
      <div className="agenda-form-actions">
        <button type="button" className="agenda-btn-secondary" onClick={onCancel}>İptal</button>
        <button type="submit" className="agenda-btn-primary">Kaydet</button>
      </div>
    </form>
  );
}

// ─── Plan Form ───────────────────────────────────────────────────

interface PlanFormProps {
  initial?: Partial<ContentPlan>;
  articles: Article[];
  seriesList: Series[];
  onSave: (data: Omit<ContentPlan, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

function PlanForm({ initial, articles, seriesList, onSave, onCancel }: PlanFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [articleId, setArticleId] = useState(initial?.article_id ?? '');
  const [seriesId, setSeriesId] = useState(initial?.series_id ?? '');
  const [plannedDate, setPlannedDate] = useState(initial?.planned_date ?? '');
  const [status, setStatus] = useState<PlanStatus>(initial?.status ?? 'draft');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), body, article_id: articleId || null, series_id: seriesId || null, planned_date: plannedDate || null, status });
  };

  return (
    <form onSubmit={handleSubmit} className="agenda-form">
      <div className="agenda-form-field">
        <label className="agenda-form-label">Başlık *</label>
        <input className="agenda-form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="İçerik planı başlığı..." autoFocus />
      </div>
      <div className="agenda-form-field">
        <label className="agenda-form-label">İçerik / Notlar</label>
        <textarea className="agenda-form-textarea agenda-form-textarea--tall" value={body} onChange={e => setBody(e.target.value)} placeholder="Başlıklar, notlar, yapısal plan..." rows={8} />
      </div>
      <div className="agenda-form-row">
        <div className="agenda-form-field">
          <label className="agenda-form-label">Durum</label>
          <select className="agenda-form-select" value={status} onChange={e => setStatus(e.target.value as PlanStatus)}>
            <option value="draft">Taslak</option>
            <option value="ready">Hazır</option>
            <option value="published">Yayında</option>
          </select>
        </div>
        <div className="agenda-form-field">
          <label className="agenda-form-label">Planlanan Tarih</label>
          <input type="date" className="agenda-form-input" value={plannedDate} onChange={e => setPlannedDate(e.target.value)} />
        </div>
      </div>
      <div className="agenda-form-row">
        <div className="agenda-form-field">
          <label className="agenda-form-label">Makaleye Bağla</label>
          <select className="agenda-form-select" value={articleId} onChange={e => setArticleId(e.target.value)}>
            <option value="">— Yok —</option>
            {articles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
        <div className="agenda-form-field">
          <label className="agenda-form-label">Diziye Bağla</label>
          <select className="agenda-form-select" value={seriesId} onChange={e => setSeriesId(e.target.value)}>
            <option value="">— Yok —</option>
            {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
      </div>
      <div className="agenda-form-actions">
        <button type="button" className="agenda-btn-secondary" onClick={onCancel}>İptal</button>
        <button type="submit" className="agenda-btn-primary">Kaydet</button>
      </div>
    </form>
  );
}

// ─── Modal Wrapper ───────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="ag-modal-overlay" onClick={onClose}>
      <div className="ag-modal" onClick={e => e.stopPropagation()}>
        <div className="ag-modal-header">
          <span className="ag-modal-title">{title}</span>
          <button className="ag-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="ag-modal-body">{children}</div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────

interface AgendaPageProps {
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

export default function AgendaPage({ navigate, articles, seriesList }: AgendaPageProps) {
  useSEO({ title: 'Ajanda', canonical: 'https://wetalks.tr/#admin/ajanda' });
  const { user } = useAuth();

  const [tasks, setTasks] = useState<AgendaTask[]>([]);
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Modal state
  const [modal, setModal] = useState<{ mode: ModalMode; initialDate?: string; editTask?: AgendaTask; editPlan?: ContentPlan } | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from('agenda_tasks').select('*').eq('user_id', user.id).order('due_date', { ascending: true, nullsFirst: false }),
      supabase.from('agenda_content_plans').select('*').eq('user_id', user.id).order('planned_date', { ascending: true, nullsFirst: false }),
    ]);
    if (t) setTasks(t as AgendaTask[]);
    if (p) setPlans(p as ContentPlan[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Task CRUD ─────

  const saveTask = async (data: Omit<AgendaTask, 'id' | 'created_at'>) => {
    if (!user) return;
    if (modal?.editTask) {
      await supabase.from('agenda_tasks').update({ ...data, updated_at: new Date().toISOString() }).eq('id', modal.editTask.id);
    } else {
      await supabase.from('agenda_tasks').insert({ ...data, user_id: user.id });
    }
    setModal(null);
    fetchAll();
  };

  const deleteTask = async (id: string) => {
    await supabase.from('agenda_tasks').delete().eq('id', id);
    fetchAll();
  };

  const toggleTaskDone = async (task: AgendaTask) => {
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    await supabase.from('agenda_tasks').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', task.id);
    fetchAll();
  };

  // ── Plan CRUD ─────

  const savePlan = async (data: Omit<ContentPlan, 'id' | 'created_at'>) => {
    if (!user) return;
    if (modal?.editPlan) {
      await supabase.from('agenda_content_plans').update({ ...data, updated_at: new Date().toISOString() }).eq('id', modal.editPlan.id);
    } else {
      await supabase.from('agenda_content_plans').insert({ ...data, user_id: user.id });
    }
    setModal(null);
    fetchAll();
  };

  const deletePlan = async (id: string) => {
    await supabase.from('agenda_content_plans').delete().eq('id', id);
    fetchAll();
  };

  const createDraftFromPlan = async (plan: ContentPlan) => {
    const slug = slugify(plan.title) || `taslak-${Date.now()}`;
    const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
    await supabase.from('articles').insert({
      id: uniqueSlug,
      title: plan.title,
      supertitle: null,
      subtitle: null,
      category: 'Kişisel Notlar',
      series_id: plan.series_id || null,
      series_title: null,
      date: plan.planned_date ?? new Date().toISOString().split('T')[0],
      excerpt: plan.title,
      reading_time: 5,
      content: plan.body || '',
      published: false,
      featured: false,
      og_image: null,
    });
    navigate(`admin/articles/edit/${uniqueSlug}`);
  };

  // ── Calendar data ─────

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayIso = todayStr();

  const tasksByDate: Record<string, AgendaTask[]> = {};
  const plansByDate: Record<string, ContentPlan[]> = {};
  tasks.forEach(t => { if (t.due_date) (tasksByDate[t.due_date] ??= []).push(t); });
  plans.forEach(p => { if (p.planned_date) (plansByDate[p.planned_date] ??= []).push(p); });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < todayIso && t.status !== 'done');

  // ── Not logged in ─────

  if (!user) {
    return (
      <main>
        <div className="agenda-auth-wall">
          <div className="agenda-auth-icon"><Calendar size={40} strokeWidth={1.5} /></div>
          <h2 className="agenda-auth-title">Ajanda</h2>
          <p className="agenda-auth-desc">Kişisel çalışma alanına erişmek için giriş yapman gerekiyor.</p>
          <button className="agenda-btn-primary" onClick={() => navigate('login')}>Giriş Yap</button>
        </div>
      </main>
    );
  }

  const selectedDayTasks = selectedDay ? (tasksByDate[selectedDay] ?? []) : [];
  const selectedDayPlans = selectedDay ? (plansByDate[selectedDay] ?? []) : [];

  return (
    <div className="ag-root">
      {/* Top bar */}
      <div className="ag-topbar">
        <div className="ag-topbar-left">
          <h1 className="ag-topbar-title">Ajanda</h1>
          <div className="ag-month-nav">
            <button className="ag-nav-btn" onClick={prevMonth}><ChevronLeft size={15} /></button>
            <span className="ag-month-label">{MONTHS[month]} {year}</span>
            <button className="ag-nav-btn" onClick={nextMonth}><ChevronRight size={15} /></button>
            <button className="ag-today-btn" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(todayIso); }}>Bugün</button>
          </div>
        </div>
        <div className="ag-topbar-right">
          {overdueTasks.length > 0 && (
            <span className="ag-overdue-badge"><AlertCircle size={13} /> {overdueTasks.length} gecikmiş</span>
          )}
          <button className="agenda-btn-primary agenda-btn-sm" onClick={() => setModal({ mode: 'task' })}>
            <Plus size={13} /> Görev
          </button>
          <button className="agenda-btn-plan agenda-btn-sm" onClick={() => setModal({ mode: 'plan' })}>
            <Plus size={13} /> Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="agenda-loading">Yükleniyor...</div>
      ) : (
        <div className="ag-layout">
          {/* Calendar grid */}
          <div className="ag-calendar-wrap">
            {/* Day headers */}
            <div className="ag-cal-head">
              {DAYS.map(d => <div key={d} className="ag-cal-head-cell">{d}</div>)}
            </div>

            {/* Cells */}
            <div className="ag-cal-grid">
              {cells.map((day, i) => {
                if (!day) return <div key={i} className="ag-cal-cell ag-cal-cell--empty" />;
                const dateStr = toDateStr(year, month, day);
                const dayTasks = tasksByDate[dateStr] ?? [];
                const dayPlans = plansByDate[dateStr] ?? [];
                const isToday = dateStr === todayIso;
                const isSelected = dateStr === selectedDay;
                const hasOverdue = dayTasks.some(t => t.status !== 'done' && t.due_date && t.due_date < todayIso);

                return (
                  <div
                    key={i}
                    className={`ag-cal-cell ${isToday ? 'ag-cal-cell--today' : ''} ${isSelected ? 'ag-cal-cell--selected' : ''} ${hasOverdue ? 'ag-cal-cell--overdue' : ''}`}
                    onClick={() => setSelectedDay(prev => prev === dateStr ? null : dateStr)}
                  >
                    <div className="ag-cal-cell-top">
                      <span className="ag-cal-day-num">{day}</span>
                      <div className="ag-cal-cell-btns">
                        <button className="ag-cal-add-btn" title="Görev ekle" onClick={e => { e.stopPropagation(); setModal({ mode: 'task', initialDate: dateStr }); }}>
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Task chips */}
                    {dayTasks.slice(0, 3).map(t => (
                      <div
                        key={t.id}
                        className={`ag-chip ag-chip--task ${t.status === 'done' ? 'ag-chip--done' : ''}`}
                        style={{ borderLeftColor: priorityColor[t.priority] }}
                        onClick={e => { e.stopPropagation(); setModal({ mode: 'task', editTask: t }); }}
                      >
                        {t.status === 'done' && <Check size={9} style={{ flexShrink: 0 }} />}
                        <span className="ag-chip-text">{t.title}</span>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="ag-chip-more">+{dayTasks.length - 3} görev</div>
                    )}

                    {/* Plan chips */}
                    {dayPlans.slice(0, 2).map(p => (
                      <div
                        key={p.id}
                        className="ag-chip ag-chip--plan"
                        style={{ borderLeftColor: planStatusColor[p.status] }}
                        onClick={e => { e.stopPropagation(); setModal({ mode: 'plan', editPlan: p }); }}
                      >
                        <FileText size={9} style={{ flexShrink: 0 }} />
                        <span className="ag-chip-text">{p.title}</span>
                      </div>
                    ))}
                    {dayPlans.length > 2 && (
                      <div className="ag-chip-more">+{dayPlans.length - 2} plan</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="ag-legend">
              <span className="ag-legend-item"><span className="ag-legend-dot" style={{ background: '#ef4444' }} />Yüksek öncelik</span>
              <span className="ag-legend-item"><span className="ag-legend-dot" style={{ background: '#f59e0b' }} />Orta öncelik</span>
              <span className="ag-legend-item"><span className="ag-legend-dot" style={{ background: '#22c55e' }} />Düşük öncelik</span>
              <span className="ag-legend-item"><span className="ag-legend-dot ag-legend-dot--square" style={{ background: '#3b82f6' }} />İçerik planı</span>
            </div>
          </div>

          {/* Right side: day detail or unscheduled */}
          <div className="ag-side">
            {selectedDay ? (
              <DayDetail
                dateStr={selectedDay}
                tasks={selectedDayTasks}
                plans={selectedDayPlans}
                articles={articles}
                seriesList={seriesList}
                onClose={() => setSelectedDay(null)}
                onAddTask={date => setModal({ mode: 'task', initialDate: date })}
                onAddPlan={date => setModal({ mode: 'plan', initialDate: date })}
                onEditTask={t => setModal({ mode: 'task', editTask: t })}
                onDeleteTask={deleteTask}
                onToggleDone={toggleTaskDone}
                onEditPlan={p => setModal({ mode: 'plan', editPlan: p })}
                onDeletePlan={deletePlan}
                onCreateDraft={createDraftFromPlan}
              />
            ) : (
              <UnscheduledSidebar
                tasks={tasks}
                plans={plans}
                articles={articles}
                seriesList={seriesList}
                onEditTask={t => setModal({ mode: 'task', editTask: t })}
                onDeleteTask={deleteTask}
                onToggleDone={toggleTaskDone}
                onEditPlan={p => setModal({ mode: 'plan', editPlan: p })}
                onDeletePlan={deletePlan}
                onCreateDraft={createDraftFromPlan}
              />
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal
          title={modal.mode === 'task' ? (modal.editTask ? 'Görevi Düzenle' : 'Yeni Görev') : (modal.editPlan ? 'Planı Düzenle' : 'Yeni İçerik Planı')}
          onClose={() => setModal(null)}
        >
          {modal.mode === 'task' ? (
            <TaskForm
              initial={modal.editTask ?? (modal.initialDate ? { due_date: modal.initialDate } : undefined)}
              articles={articles}
              seriesList={seriesList}
              onSave={saveTask}
              onCancel={() => setModal(null)}
            />
          ) : (
            <PlanForm
              initial={modal.editPlan ?? (modal.initialDate ? { planned_date: modal.initialDate } : undefined)}
              articles={articles}
              seriesList={seriesList}
              onSave={savePlan}
              onCancel={() => setModal(null)}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
