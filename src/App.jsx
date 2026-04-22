import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = ""; // Vite proxies /api → http://localhost:5005

// ─── API Helper ───────────────────────────────────────────────────────────────
async function api(path, options = {}) {
  const token = localStorage.getItem("halto_token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  return data?.data ?? data;
}

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

// ─── Toast ────────────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);
const useToast = () => useContext(ToastCtx);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: "11px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500,
            boxShadow: "0 4px 20px rgba(0,0,0,0.18)", minWidth: 260, display: "flex", alignItems: "center", gap: 10,
            animation: "slideInRight .28s cubic-bezier(.34,1.56,.64,1)",
            background: t.type === "success" ? "#4A8C6F" : t.type === "error" ? "#C44F4F" : "#2C2420",
            color: "white"
          }}>
            <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "●"}</span>{t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0);
const initials = (name = "") => name.split(" ").slice(0, 2).map(w => w[0] ?? "").join("").toUpperCase();
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ID_TYPES = ["Aadhaar", "Passport", "Driving License", "Voter ID", "PAN Card", "Other"];

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --cream:#FAF7F2; --warm:#FFFDF9;
    --terra:#C4694F; --terra-l:#D4836A; --terra-d:#A85540; --terra-p:#F5E8E3;
    --coal:#2C2420; --coal-m:#4A3F3A;
    --stone:#8C7D75; --stone-l:#BFB5AF; --stone-p:#EDE8E4;
    --ok:#4A8C6F; --ok-p:#E3F0EA;
    --warn:#C49A3C; --warn-p:#FAF3E0;
    --err:#C44F4F; --err-p:#F5E3E3;
    --sidebar:260px; --r:12px; --r-s:8px;
    --sh:0 2px 12px rgba(44,36,32,.08); --sh-m:0 4px 24px rgba(44,36,32,.13); --sh-l:0 8px 40px rgba(44,36,32,.18);
    --t:.18s cubic-bezier(.4,0,.2,1);
  }
  body{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--coal);line-height:1.6;-webkit-font-smoothing:antialiased}
  @keyframes slideInRight{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}

  /* Auth */
  .auth-wrap{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
  .auth-panel{background:var(--coal);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:60px;position:relative;overflow:hidden}
  .auth-panel::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 30% 70%,rgba(196,105,79,.28) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(196,105,79,.15) 0%,transparent 50%)}
  .auth-logo{font-family:'Playfair Display',serif;font-size:52px;font-weight:700;color:var(--cream);letter-spacing:-1px;position:relative;z-index:1}
  .auth-logo span{color:var(--terra)}
  .auth-form-side{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:60px}
  .auth-form-wrap{width:100%;max-width:420px}

  /* Layout */
  .app{display:flex;min-height:100vh}
  .sidebar{width:var(--sidebar);background:var(--coal);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
  .main{margin-left:var(--sidebar);flex:1;min-height:100vh;display:flex;flex-direction:column}
  .page-hdr{padding:28px 36px 22px;border-bottom:1px solid var(--stone-p);background:var(--warm);display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
  .page-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:600;color:var(--coal)}
  .page-sub{font-size:13px;color:var(--stone);margin-top:2px}
  .page-body{padding:28px 36px;flex:1}

  /* Cards */
  .card{background:var(--warm);border:1px solid var(--stone-p);border-radius:var(--r);box-shadow:var(--sh)}
  .card-hdr{padding:18px 22px 14px;border-bottom:1px solid var(--stone-p);display:flex;align-items:center;justify-content:space-between;gap:12px}
  .card-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:600;color:var(--coal)}
  .card-body{padding:18px 22px}

  /* Stat cards */
  .stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin-bottom:24px}
  .stat-card{background:var(--warm);border:1px solid var(--stone-p);border-radius:var(--r);padding:18px 22px;box-shadow:var(--sh);transition:var(--t);position:relative;overflow:hidden;cursor:default}
  .stat-card::after{content:'';position:absolute;top:0;right:0;width:70px;height:70px;background:var(--terra-p);border-radius:0 0 0 70px;opacity:.6}
  .stat-card:hover{transform:translateY(-2px);box-shadow:var(--sh-m)}
  .stat-label{font-size:11px;font-weight:600;color:var(--stone);text-transform:uppercase;letter-spacing:.8px}
  .stat-value{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:var(--coal);margin-top:5px;line-height:1}
  .stat-sub{font-size:12px;color:var(--stone);margin-top:5px}
  .stat-icon{position:absolute;top:15px;right:15px;font-size:20px;z-index:1;opacity:.65}

  /* Table */
  .tbl-wrap{overflow-x:auto}
  table{width:100%;border-collapse:collapse;font-size:13.5px}
  th{padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--stone);text-transform:uppercase;letter-spacing:.7px;background:var(--stone-p);white-space:nowrap}
  td{padding:12px 14px;border-bottom:1px solid var(--stone-p);color:var(--coal-m);vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tbody tr{transition:var(--t);cursor:default}
  tbody tr:hover{background:var(--terra-p)}

  /* Badges */
  .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:20px;font-size:11.5px;font-weight:600;letter-spacing:.2px;white-space:nowrap}
  .b-due{background:var(--err-p);color:var(--err)}
  .b-partial{background:var(--warn-p);color:var(--warn)}
  .b-paid{background:var(--ok-p);color:var(--ok)}
  .b-active{background:var(--ok-p);color:var(--ok)}
  .b-inactive{background:var(--stone-p);color:var(--stone)}
  .b-discontinued{background:#F0E8F5;color:#7C4A8C}
  .b-nodue{background:var(--stone-p);color:var(--stone)}
  .b-owner{background:var(--terra-p);color:var(--terra-d)}
  .b-cat{background:var(--warm);border:1px solid var(--stone-p);color:var(--coal-m)}

  /* Buttons */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--r-s);font-size:13.5px;font-weight:500;font-family:inherit;cursor:pointer;border:none;transition:var(--t);white-space:nowrap;text-decoration:none}
  .btn-p{background:var(--terra);color:white}
  .btn-p:hover:not(:disabled){background:var(--terra-d);transform:translateY(-1px);box-shadow:0 4px 12px rgba(196,105,79,.35)}
  .btn-s{background:var(--stone-p);color:var(--coal-m)}
  .btn-s:hover:not(:disabled){background:var(--stone-l)}
  .btn-g{background:transparent;color:var(--stone);border:1px solid var(--stone-p)}
  .btn-g:hover:not(:disabled){background:var(--stone-p);color:var(--coal)}
  .btn-err{background:var(--err-p);color:var(--err);border:1px solid rgba(196,79,79,.2)}
  .btn-err:hover:not(:disabled){background:var(--err);color:white}
  .btn-warn{background:var(--warn-p);color:var(--warn);border:1px solid rgba(196,154,60,.2)}
  .btn-warn:hover:not(:disabled){background:var(--warn);color:white}
  .btn-ok{background:var(--ok-p);color:var(--ok);border:1px solid rgba(74,140,111,.2)}
  .btn-ok:hover:not(:disabled){background:var(--ok);color:white}
  .btn-sm{padding:5px 11px;font-size:12.5px}
  .btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important}

  /* Forms */
  .fg{margin-bottom:15px}
  .fl{display:block;font-size:12.5px;font-weight:500;color:var(--coal-m);margin-bottom:5px}
  .fi,.fs,.fta{width:100%;padding:9px 13px;border:1.5px solid var(--stone-p);border-radius:var(--r-s);font-size:13.5px;font-family:inherit;color:var(--coal);background:var(--warm);transition:var(--t);outline:none}
  .fi:focus,.fs:focus,.fta:focus{border-color:var(--terra);box-shadow:0 0 0 3px rgba(196,105,79,.1)}
  .fta{resize:vertical;min-height:72px}
  .frow{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .frow3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
  .ferr{font-size:12px;color:var(--err);margin-top:4px}
  .fsec{font-size:11px;color:var(--stone);margin-top:4px}

  /* Modal */
  .backdrop{position:fixed;inset:0;background:rgba(44,36,32,.5);backdrop-filter:blur(3px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .15s ease}
  .modal{background:var(--warm);border-radius:var(--r);box-shadow:var(--sh-l);width:100%;max-width:520px;max-height:92vh;overflow-y:auto;animation:slideUp .22s cubic-bezier(.34,1.56,.64,1)}
  .modal-lg{max-width:680px}
  .modal-hdr{padding:22px 26px 16px;border-bottom:1px solid var(--stone-p);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--warm);z-index:1}
  .modal-title{font-family:'Playfair Display',serif;font-size:19px;font-weight:600;color:var(--coal)}
  .modal-x{background:none;border:none;font-size:20px;cursor:pointer;color:var(--stone);padding:3px 6px;border-radius:5px;transition:var(--t);line-height:1}
  .modal-x:hover{background:var(--stone-p);color:var(--coal)}
  .modal-body{padding:22px 26px}
  .modal-ftr{padding:14px 26px 22px;display:flex;gap:10px;justify-content:flex-end;border-top:1px solid var(--stone-p)}

  /* Sidebar */
  .sb-logo{padding:24px 22px 18px;border-bottom:1px solid rgba(255,255,255,.06)}
  .sb-logo-text{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--cream);letter-spacing:-.5px}
  .sb-logo-text span{color:var(--terra)}
  .sb-org{font-size:11.5px;color:var(--stone);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sb-nav{flex:1;padding:14px 10px;overflow-y:auto}
  .sb-sec{font-size:10.5px;font-weight:600;color:var(--stone);letter-spacing:1px;text-transform:uppercase;padding:10px 12px 5px}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:7px;color:var(--stone-l);font-size:13.5px;font-weight:400;cursor:pointer;transition:var(--t);border:none;background:none;width:100%;text-align:left;font-family:inherit}
  .nav-item:hover{background:rgba(255,255,255,.07);color:var(--cream)}
  .nav-item.active{background:rgba(196,105,79,.2);color:var(--terra-l)}
  .nav-icon{font-size:15px;width:19px;text-align:center;opacity:.85}
  .sb-footer{padding:14px 10px;border-top:1px solid rgba(255,255,255,.06)}
  .user-pill{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:7px;background:rgba(255,255,255,.05)}
  .avatar{width:30px;height:30px;border-radius:50%;background:var(--terra);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:white;flex-shrink:0}
  .u-name{font-size:13px;color:var(--cream);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .u-role{font-size:10.5px;color:var(--stone)}
  .logout-btn{margin-left:auto;background:none;border:none;color:var(--stone);cursor:pointer;font-size:16px;padding:4px 6px;border-radius:4px;transition:var(--t)}
  .logout-btn:hover{color:var(--terra-l)}

  /* Misc */
  .divider{height:1px;background:var(--stone-p);margin:18px 0}
  .loading{display:flex;align-items:center;justify-content:center;padding:56px}
  .spinner{width:34px;height:34px;border:3px solid var(--stone-p);border-top-color:var(--terra);border-radius:50%;animation:spin .7s linear infinite}
  .empty{text-align:center;padding:56px 24px;color:var(--stone)}
  .empty-icon{font-size:44px;opacity:.35;display:block;margin-bottom:10px}
  .empty-title{font-family:'Playfair Display',serif;font-size:17px;color:var(--coal-m);margin-bottom:5px}
  .toolbar{display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap}
  .search-wrap{position:relative;flex:1;min-width:200px}
  .search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--stone);pointer-events:none}
  .pl{padding-left:34px!important}
  .amount{font-family:'Playfair Display',serif;font-weight:600}
  .muted{color:var(--stone);font-size:12.5px}
  .fw5{font-weight:500}
  .fw6{font-weight:600}
  .flex{display:flex}
  .flex1{flex:1}
  .gap2{gap:8px}
  .gap3{gap:12px}
  .aic{align-items:center}
  .jcb{justify-content:space-between}
  .mt1{margin-top:4px}
  .mt2{margin-top:8px}
  .mt3{margin-top:14px}
  .mb2{margin-bottom:8px}
  .mb3{margin-bottom:14px}
  .w100{width:100%;justify-content:center;padding:11px}

  /* Upcoming dues alert strip */
  .upcoming-strip{background:var(--warn-p);border:1px solid rgba(196,154,60,.25);border-radius:var(--r);padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:12px}
  .upcoming-dot{width:8px;height:8px;border-radius:50%;background:var(--warn);animation:pulse 1.5s ease infinite;flex-shrink:0}

  /* Member detail panel */
  .detail-row{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--stone-p)}
  .detail-row:last-child{border-bottom:none}
  .detail-lbl{font-size:11.5px;font-weight:600;color:var(--stone);text-transform:uppercase;letter-spacing:.6px;width:130px;flex-shrink:0;padding-top:2px}
  .detail-val{font-size:13.5px;color:var(--coal-m)}

  /* Category card */
  .cat-card{background:var(--warm);border:1.5px solid var(--stone-p);border-radius:var(--r);padding:18px 20px;transition:var(--t);position:relative}
  .cat-card:hover{border-color:var(--terra);box-shadow:var(--sh-m)}
  .cat-name{font-family:'Playfair Display',serif;font-size:17px;font-weight:600;color:var(--coal);margin-bottom:6px}
  .cat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}
  .cat-stat{text-align:center;padding:9px;background:var(--stone-p);border-radius:7px}
  .cat-stat-val{font-family:'Playfair Display',serif;font-size:16px;font-weight:600;color:var(--coal)}
  .cat-stat-lbl{font-size:10.5px;color:var(--stone);margin-top:2px}

  /* Due alert card */
  .due-card{background:var(--warm);border:1.5px solid var(--stone-p);border-radius:var(--r);padding:14px 16px;display:flex;align-items:center;gap:14px;transition:var(--t)}
  .due-card:hover{border-color:var(--terra);box-shadow:var(--sh)}
  .due-card.urgent{border-color:rgba(196,79,79,.3);background:var(--err-p)}
  .due-card.partial{border-color:rgba(196,154,60,.3);background:var(--warn-p)}
  .due-card.paid{border-color:rgba(74,140,111,.3);background:var(--ok-p);opacity:.75}

  /* Progress bar */
  .progress-track{height:6px;background:var(--stone-p);border-radius:3px;overflow:hidden;margin-top:5px}
  .progress-fill{height:100%;background:var(--terra);border-radius:3px;transition:width .4s ease}

  /* Tabs */
  .tabs{display:flex;gap:2px;border-bottom:2px solid var(--stone-p);margin-bottom:20px}
  .tab{padding:9px 16px;font-size:13.5px;font-weight:500;color:var(--stone);cursor:pointer;border:none;background:none;font-family:inherit;border-bottom:2px solid transparent;margin-bottom:-2px;transition:var(--t)}
  .tab:hover{color:var(--coal)}
  .tab.active{color:var(--terra);border-bottom-color:var(--terra);font-weight:600}

  /* Info box */
  .info-box{padding:11px 14px;background:var(--terra-p);border:1px solid rgba(196,105,79,.2);border-radius:var(--r-s);font-size:12.5px;color:var(--terra-d)}
  .warn-box{padding:11px 14px;background:var(--warn-p);border:1px solid rgba(196,154,60,.2);border-radius:var(--r-s);font-size:12.5px;color:var(--warn)}

  @media(max-width:768px){
    .auth-wrap{grid-template-columns:1fr}
    .auth-panel{display:none}
    .sidebar{display:none}
    .main{margin-left:0}
    .page-body{padding:16px}
    .page-hdr{padding:16px}
    .frow,.frow3{grid-template-columns:1fr}
  }
`;

// ─── Shared Components ────────────────────────────────────────────────────────
function Spinner() { return <div className="loading"><div className="spinner" /></div>; }

function Modal({ open, onClose, title, children, footer, size = "" }) {
  if (!open) return null;
  return (
    <div className="backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-hdr">
          <span className="modal-title">{title}</span>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-ftr">{footer}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { Due: "b-due", Partial: "b-partial", Paid: "b-paid", NoDue: "b-nodue", Active: "b-active", Inactive: "b-inactive", Discontinued: "b-discontinued" };
  const icons = { Due: "◌", Partial: "◐", Paid: "●", NoDue: "—", Active: "●", Inactive: "○", Discontinued: "✕" };
  return <span className={`badge ${map[status] ?? "b-nodue"}`}>{icons[status] ?? "○"} {status}</span>;
}

function Confirm({ open, title, message, onConfirm, onCancel, danger = false }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}
      footer={<><button className="btn btn-g" onClick={onCancel}>Cancel</button><button className={`btn ${danger ? "btn-err" : "btn-p"}`} onClick={onConfirm}>{danger ? "Confirm" : "OK"}</button></>}>
      <p style={{ fontSize: 14, color: "var(--coal-m)", lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}

// ─── Auth Page ────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", fullName: "", phone: "", organizationName: "", businessType: "1" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (mode === "login") {
        const d = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password }) });
        localStorage.setItem("halto_token", d.token); onLogin(d.user);
      } else {
        const d = await api("/api/auth/register-owner", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone, organizationName: form.organizationName, businessType: parseInt(form.businessType) }) });
        localStorage.setItem("halto_token", d.token); toast("Organisation created! Welcome.", "success"); onLogin(d.user);
      }
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-panel">
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div className="auth-logo">H<span>.</span>alto</div>
          <div style={{ color: "var(--stone-l)", fontSize: 15, marginTop: 10, fontWeight: 300 }}>Hostel & Business Management</div>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
            {["Manage members with full details", "Categories with auto-calculated dues", "10-day ahead payment alerts", "Partial payments & discontinuation tracking"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--stone-l)", fontSize: 13.5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--terra)", flexShrink: 0 }} />{f}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 600, color: "var(--coal)", marginBottom: 6 }}>{mode === "login" ? "Welcome back" : "Get started"}</div>
          <div style={{ color: "var(--stone)", fontSize: 14, marginBottom: 30 }}>{mode === "login" ? "Sign in to your account" : "Create your organisation"}</div>
          <form onSubmit={submit}>
            {mode === "register" && <>
              <div className="fg"><label className="fl">Full Name</label><input className="fi" value={form.fullName} onChange={set("fullName")} placeholder="Rajesh Kumar" required /></div>
              <div className="frow">
                <div className="fg"><label className="fl">Organisation Name</label><input className="fi" value={form.organizationName} onChange={set("organizationName")} placeholder="Green Valley Hostel" required /></div>
                <div className="fg"><label className="fl">Business Type</label>
                  <select className="fs" value={form.businessType} onChange={set("businessType")}>
                    <option value="1">Hostel</option><option value="2">Tuition</option><option value="3">Gym</option><option value="4">Other</option>
                  </select>
                </div>
              </div>
              <div className="fg"><label className="fl">Phone (optional)</label><input className="fi" value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" /></div>
            </>}
            <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required /></div>
            <div className="fg"><label className="fl">Password</label><input className="fi" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required /></div>
            {error && <div className="ferr mb2">⚠ {error}</div>}
            <button className="btn btn-p w100" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}</button>
          </form>
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13.5, color: "var(--stone)" }}>
            {mode === "login" ? <>New? <button style={{ background: "none", border: "none", color: "var(--terra)", fontWeight: 600, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit" }} onClick={() => setMode("register")}>Create account</button></> : <>Have account? <button style={{ background: "none", border: "none", color: "var(--terra)", fontWeight: 600, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit" }} onClick={() => setMode("login")}>Sign in</button></>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const toast = useToast();
  const now = new Date();

  const load = useCallback(async () => {
    setLoading(true);
    const [s, m, u] = await Promise.all([
      api("/api/dashboard/summary").catch(() => null),
      api(`/api/dashboard/monthly?year=${now.getFullYear()}`).catch(() => []),
      api("/api/dashboard/upcoming-dues?daysAhead=10").catch(() => []),
    ]);
    setSummary(s); setMonthly(Array.isArray(m) ? m : []); setUpcoming(Array.isArray(u) ? u : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const urgentCount = upcoming.filter(u => !u.status || u.status === "Due").length;

  if (loading) return <Spinner />;

  return (
    <>
      <div className="page-hdr">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">{MONTHS[now.getMonth()]} {now.getFullYear()} overview</p>
        </div>
      </div>
      <div className="page-body">
        {urgentCount > 0 && (
          <div className="upcoming-strip">
            <div className="upcoming-dot" />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, color: "var(--warn)" }}>{urgentCount} members</span>
              <span style={{ color: "var(--coal-m)", fontSize: 13.5 }}> have dues coming up this period. See below to collect.</span>
            </div>
          </div>
        )}

        <div className="stat-grid">
          {[
            { label: "Total Due", value: fmt(summary?.totalDueAmount), sub: "this period", icon: "◌" },
            { label: "Collected", value: fmt(summary?.totalPaidAmount), sub: `${summary?.totalDueAmount > 0 ? ((summary.totalPaidAmount / summary.totalDueAmount) * 100).toFixed(0) : 0}% rate`, icon: "●" },
            { label: "Outstanding", value: fmt(summary?.totalUnpaidAmount), sub: `${(summary?.unpaidCount ?? 0) + (summary?.partialCount ?? 0)} dues`, icon: "◐" },
            { label: "Active Members", value: summary?.memberCount ?? "—", sub: "in organisation", icon: "◉" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex gap3" style={{ flexWrap: "wrap" }}>
          {/* Monthly chart */}
          <div className="card flex1" style={{ minWidth: 300 }}>
            <div className="card-hdr"><span className="card-title">Monthly Collection {now.getFullYear()}</span></div>
            <div className="card-body">
              {monthly.filter(m => m.totalDue > 0).length === 0
                ? <div style={{ textAlign: "center", padding: 20, color: "var(--stone)", fontSize: 13 }}>No data yet</div>
                : monthly.filter(m => m.totalDue > 0).map(m => (
                  <div key={m.month} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 11.5, color: "var(--stone)", width: 30, textAlign: "right", flexShrink: 0 }}>{MONTHS[m.month - 1]}</span>
                    <div style={{ flex: 1, height: 26, background: "var(--stone-p)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                      <div style={{ position: "absolute", inset: 0, background: "var(--terra-p)", borderRadius: 4 }} />
                      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${(m.totalPaid / Math.max(m.totalDue, 1)) * 100}%`, background: "var(--terra)", borderRadius: 4, transition: "width .6s ease" }} />
                    </div>
                    <span style={{ fontSize: 11.5, color: "var(--coal-m)", width: 64, flexShrink: 0, textAlign: "right", fontWeight: 500 }}>{fmt(m.totalPaid)}</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Upcoming dues */}
          <div className="card" style={{ flex: "0 0 380px", minWidth: 300 }}>
            <div className="card-hdr">
              <span className="card-title">Upcoming Dues</span>
              <span className="badge b-warn" style={{ fontSize: 11 }}>{MONTHS[upcoming[0]?.dueMonth - 1] ?? MONTHS[now.getMonth()]} {upcoming[0]?.dueYear ?? now.getFullYear()}</span>
            </div>
            <div style={{ maxHeight: 380, overflowY: "auto" }}>
              {upcoming.length === 0
                ? <div className="empty" style={{ padding: 32 }}><span className="empty-icon">📋</span><p>No upcoming dues</p></div>
                : upcoming.map(u => (
                  <div key={u.memberId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: "1px solid var(--stone-p)" }}>
                    <div className="avatar" style={{ background: u.status === "Paid" ? "var(--ok)" : u.status === "Partial" ? "var(--warn)" : "var(--terra)" }}>
                      {initials(u.memberName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.memberName}</div>
                      <div style={{ fontSize: 12, color: "var(--stone)" }}>
                        {u.categoryName && <span style={{ marginRight: 6 }}>{u.categoryName}</span>}
                        <span className="amount" style={{ fontSize: 13 }}>{fmt(u.balance > 0 ? u.balance : u.amount)}</span>
                      </div>
                      {u.status === "Partial" && (
                        <div className="progress-track" style={{ width: "100%" }}>
                          <div className="progress-fill" style={{ width: `${(u.totalPaid / u.amount) * 100}%`, background: "var(--warn)" }} />
                        </div>
                      )}
                    </div>
                    <div>
                      {u.status === "Paid"
                        ? <span className="badge b-paid">✓ Paid</span>
                        : u.dueId
                          ? <button className="btn btn-p btn-sm" onClick={() => setPayModal(u)}>Pay</button>
                          : <span className="badge b-nodue" style={{ fontSize: 11 }}>Not gen.</span>
                      }
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {payModal && (
        <QuickPayModal
          due={payModal}
          onClose={() => setPayModal(null)}
          onSaved={() => { setPayModal(null); load(); toast("Payment recorded!", "success"); }}
        />
      )}
    </>
  );
}

// Quick pay from dashboard upcoming
function QuickPayModal({ due, onClose, onSaved }) {
  const [amount, setAmount] = useState(due.balance > 0 ? String(due.balance) : String(due.amount));
  const [method, setMethod] = useState("2");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError(""); setLoading(true);
    try {
      await api(`/api/dues/${due.dueId}/payments`, { method: "POST", body: JSON.stringify({ amountPaid: parseFloat(amount), method: parseInt(method), notes: notes || null }) });
      onSaved();
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <Modal open title={`Record Payment — ${due.memberName}`} onClose={onClose}
      footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={submit} disabled={loading}>Save Payment</button></>}>
      <div className="frow3 mb3">
        {[["Total Due", fmt(due.amount)], ["Paid", fmt(due.totalPaid)], ["Balance", fmt(due.balance)]].map(([l, v]) => (
          <div key={l} style={{ textAlign: "center", padding: "11px 8px", background: "var(--stone-p)", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "var(--stone)", textTransform: "uppercase", letterSpacing: ".5px" }}>{l}</div>
            <div className="amount" style={{ fontSize: 16 }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="frow">
        <div className="fg"><label className="fl">Amount (₹) *</label><input className="fi" type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
        <div className="fg"><label className="fl">Method</label>
          <select className="fs" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="2">Cash</option><option value="4">UPI</option><option value="3">Bank Transfer</option><option value="5">Card</option><option value="1">Manual</option>
          </select>
        </div>
      </div>
      <div className="fg"><label className="fl">Notes</label><input className="fi" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional…" /></div>
      {error && <div className="ferr">⚠ {error}</div>}
    </Modal>
  );
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
function Categories({ user }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();
  const isOwner = user?.role === "OrganizationOwner";

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await api("/api/categories"); setCats(Array.isArray(d) ? d : []); }
    catch { setCats([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteCat(cat) {
    try {
      await api(`/api/categories/${cat.id}`, { method: "DELETE" });
      toast("Category deleted", "success"); load();
    } catch (e) { toast(e.message, "error"); }
    setConfirm(null);
  }

  return (
    <>
      <div className="page-hdr">
        <div><h1 className="page-title">Categories</h1><p className="page-sub">Room types, plans, and pricing tiers</p></div>
        {isOwner && <button className="btn btn-p" onClick={() => setShowAdd(true)}>＋ New Category</button>}
      </div>
      <div className="page-body">
        {loading ? <Spinner /> : cats.length === 0
          ? <div className="empty"><span className="empty-icon">🏷</span><div className="empty-title">No categories yet</div><p style={{ fontSize: 13 }}>Create categories like "4 Share with Food" to assign members</p></div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {cats.map(c => (
              <div key={c.id} className="cat-card">
                <div className="flex aic jcb mb2">
                  <div className="cat-name">{c.name}</div>
                  <span className={`badge ${c.isActive ? "b-active" : "b-inactive"}`}>{c.isActive ? "Active" : "Inactive"}</span>
                </div>
                {c.description && <div className="muted mb2">{c.description}</div>}
                <div className="cat-grid">
                  {[["Monthly Rent", fmt(c.monthlyRent)], ["Admission Fee", fmt(c.admissionFee)], ["Deposit", fmt(c.depositAmount)]].map(([l, v]) => (
                    <div key={l} className="cat-stat"><div className="cat-stat-val">{v}</div><div className="cat-stat-lbl">{l}</div></div>
                  ))}
                </div>
                <div className="flex aic jcb mt3">
                  <span className="muted">{c.memberCount} member{c.memberCount !== 1 ? "s" : ""}</span>
                  {isOwner && (
                    <div className="flex gap2">
                      <button className="btn btn-g btn-sm" onClick={() => setEditCat(c)}>Edit</button>
                      <button className="btn btn-err btn-sm" onClick={() => setConfirm(c)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        }
      </div>

      <CategoryModal open={showAdd} cat={null} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); toast("Category created", "success"); }} />
      <CategoryModal open={!!editCat} cat={editCat} onClose={() => setEditCat(null)} onSaved={() => { setEditCat(null); load(); toast("Category updated", "success"); }} />
      <Confirm open={!!confirm} title="Delete Category" danger
        message={`Delete "${confirm?.name}"? This can't be undone. Categories with active members cannot be deleted.`}
        onConfirm={() => deleteCat(confirm)} onCancel={() => setConfirm(null)} />
    </>
  );
}

function CategoryModal({ open, cat, onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", description: "", monthlyRent: "", admissionFee: "", depositAmount: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) setForm(cat ? { name: cat.name, description: cat.description ?? "", monthlyRent: String(cat.monthlyRent), admissionFee: String(cat.admissionFee), depositAmount: String(cat.depositAmount) } : { name: "", description: "", monthlyRent: "", admissionFee: "", depositAmount: "" });
    setError("");
  }, [open, cat]);

  async function submit() {
    setError(""); setLoading(true);
    try {
      const body = { name: form.name, description: form.description || null, monthlyRent: parseFloat(form.monthlyRent) || 0, admissionFee: parseFloat(form.admissionFee) || 0, depositAmount: parseFloat(form.depositAmount) || 0 };
      if (cat) await api(`/api/categories/${cat.id}`, { method: "PATCH", body: JSON.stringify(body) });
      else await api("/api/categories", { method: "POST", body: JSON.stringify(body) });
      onSaved();
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={cat ? `Edit — ${cat.name}` : "New Category"}
      footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={submit} disabled={loading}>{cat ? "Save Changes" : "Create"}</button></>}>
      <div className="fg"><label className="fl">Category Name *</label><input className="fi" value={form.name} onChange={set("name")} placeholder="e.g. 4 Share with Food" /></div>
      <div className="fg"><label className="fl">Description</label><input className="fi" value={form.description} onChange={set("description")} placeholder="Brief description" /></div>
      <div className="divider" />
      <div className="frow3">
        <div className="fg"><label className="fl">Monthly Rent (₹)</label><input className="fi" type="number" value={form.monthlyRent} onChange={set("monthlyRent")} placeholder="6000" /></div>
        <div className="fg"><label className="fl">Admission Fee (₹)</label><input className="fi" type="number" value={form.admissionFee} onChange={set("admissionFee")} placeholder="2000" /><div className="fsec">Non-refundable</div></div>
        <div className="fg"><label className="fl">Deposit (₹)</label><input className="fi" type="number" value={form.depositAmount} onChange={set("depositAmount")} placeholder="5000" /><div className="fsec">Refundable</div></div>
      </div>
      <div className="info-box mt2">Monthly rent will be used to auto-calculate dues when generating for this category.</div>
      {error && <div className="ferr mt2">⚠ {error}</div>}
    </Modal>
  );
}

// ─── MEMBERS ─────────────────────────────────────────────────────────────────
function Members({ user }) {
  const [members, setMembers] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMember, setViewMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [discontinueMember, setDiscontinueMember] = useState(null);
  const toast = useToast();
  const isOwner = user?.role === "OrganizationOwner";

  useEffect(() => { api("/api/categories").then(d => setCats(Array.isArray(d) ? d : [])).catch(() => {}); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: search ?? "", page, pageSize: 20 });
      const d = await api(`/api/members?${params}`);
      let items = d?.items ?? d ?? [];
      if (filterStatus === "active") items = items.filter(m => m.isActive && !m.discontinuedAt);
      else if (filterStatus === "inactive") items = items.filter(m => !m.isActive && !m.discontinuedAt);
      else if (filterStatus === "discontinued") items = items.filter(m => m.discontinuedAt);
      setMembers(items); setTotal(d?.totalCount ?? items.length);
    } catch { setMembers([]); } finally { setLoading(false); }
  }, [search, page, filterStatus]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="page-hdr">
        <div><h1 className="page-title">Members</h1><p className="page-sub">{total} total</p></div>
        <button className="btn btn-p" onClick={() => setShowAdd(true)}>＋ Add Member</button>
      </div>
      <div className="page-body">
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon" style={{ fontSize: 14 }}>⌕</span>
            <input className="fi pl" placeholder="Search name, phone, email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="fs" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Members</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
        <div className="card">
          {loading ? <Spinner /> : members.length === 0
            ? <div className="empty"><span className="empty-icon">👥</span><div className="empty-title">No members found</div></div>
            : <div className="tbl-wrap"><table>
              <thead><tr><th>Member</th><th>Category</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div className="flex aic gap2">
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 11, flexShrink: 0, background: m.discontinuedAt ? "#7C4A8C" : m.isActive ? "var(--terra)" : "var(--stone)" }}>{initials(m.fullName)}</div>
                        <div>
                          <div className="fw5" style={{ color: "var(--coal)" }}>{m.fullName}</div>
                          <div className="muted">{m.email || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td>{m.categoryName ? <span className="badge b-cat">{m.categoryName}</span> : <span className="muted">—</span>}</td>
                    <td className="muted">{m.phone || "—"}</td>
                    <td className="muted">{new Date(m.joinedAt).toLocaleDateString("en-IN")}</td>
                    <td><StatusBadge status={m.discontinuedAt ? "Discontinued" : m.isActive ? "Active" : "Inactive"} /></td>
                    <td>
                      <div className="flex gap2">
                        <button className="btn btn-g btn-sm" onClick={() => setViewMember(m)}>View</button>
                        <button className="btn btn-s btn-sm" onClick={() => setEditMember(m)}>Edit</button>
                        {isOwner && m.isActive && !m.discontinuedAt && <button className="btn btn-err btn-sm" onClick={() => setDiscontinueMember(m)}>Discontinue</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          }
        </div>
      </div>

      <MemberFormModal open={showAdd} member={null} cats={cats} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); toast("Member added!", "success"); }} />
      <MemberFormModal open={!!editMember} member={editMember} cats={cats} onClose={() => setEditMember(null)} onSaved={() => { setEditMember(null); load(); toast("Member updated", "success"); }} />
      {viewMember && <MemberDetailModal member={viewMember} cats={cats} isOwner={isOwner} onClose={() => setViewMember(null)} onEdited={() => { setViewMember(null); load(); }} />}
      {discontinueMember && <DiscontinueModal member={discontinueMember} onClose={() => setDiscontinueMember(null)} onSaved={() => { setDiscontinueMember(null); load(); toast(`${discontinueMember.fullName} discontinued`, "success"); }} />}
    </>
  );
}

function MemberFormModal({ open, member, cats, onClose, onSaved }) {
  const blank = { fullName: "", email: "", phone: "", designation: "", idDocumentType: "", joinedAt: new Date().toISOString().slice(0, 10), categoryId: "", room: "", bed: "" };
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) {
      if (member) {
        let extra = {};
        try { extra = JSON.parse(member.extraFieldsJson || "{}"); } catch {}
        setForm({ fullName: member.fullName, email: member.email ?? "", phone: member.phone ?? "", designation: member.designation ?? "", idDocumentType: member.idDocumentType ?? "", joinedAt: member.joinedAt?.slice(0, 10) ?? blank.joinedAt, categoryId: member.categoryId ?? "", room: extra.room ?? "", bed: extra.bed ?? "" });
      } else { setForm(blank); }
      setError("");
    }
  }, [open, member]);

  // Auto-fill rent from category
  const selectedCat = cats.find(c => c.id === form.categoryId);

  async function submit() {
    if (!form.fullName.trim()) { setError("Full name is required."); return; }
    setError(""); setLoading(true);
    try {
      const extra = {};
      if (form.room) extra.room = form.room;
      if (form.bed) extra.bed = form.bed;
      const body = { fullName: form.fullName.trim(), email: form.email || null, phone: form.phone || null, designation: form.designation || null, idDocumentType: form.idDocumentType || null, joinedAt: form.joinedAt ? new Date(form.joinedAt).toISOString() : null, categoryId: form.categoryId || null, extraFields: Object.keys(extra).length ? extra : undefined };
      if (member) await api(`/api/members/${member.id}`, { method: "PATCH", body: JSON.stringify(body) });
      else await api("/api/members", { method: "POST", body: JSON.stringify(body) });
      onSaved();
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={member ? `Edit — ${member.fullName}` : "Add New Member"} size="modal-lg"
      footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={submit} disabled={loading}>{member ? "Save Changes" : "Add Member"}</button></>}>

      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--stone)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>Personal Details</div>
      <div className="frow">
        <div className="fg"><label className="fl">Full Name *</label><input className="fi" value={form.fullName} onChange={set("fullName")} placeholder="Suresh Reddy" /></div>
        <div className="fg"><label className="fl">Designation / Role</label><input className="fi" value={form.designation} onChange={set("designation")} placeholder="Student, Working Professional…" /></div>
      </div>
      <div className="frow">
        <div className="fg"><label className="fl">Phone</label><input className="fi" value={form.phone} onChange={set("phone")} placeholder="9876543210" /></div>
        <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={form.email} onChange={set("email")} placeholder="suresh@example.com" /></div>
      </div>
      <div className="frow">
        <div className="fg"><label className="fl">ID Document Type</label>
          <select className="fs" value={form.idDocumentType} onChange={set("idDocumentType")}>
            <option value="">— Select —</option>
            {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="fg"><label className="fl">Join Date</label><input className="fi" type="date" value={form.joinedAt} onChange={set("joinedAt")} /></div>
      </div>

      <div className="divider" />
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--stone)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>Category & Accommodation</div>
      <div className="fg">
        <label className="fl">Category</label>
        <select className="fs" value={form.categoryId} onChange={set("categoryId")}>
          <option value="">— No category —</option>
          {cats.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name} — {fmt(c.monthlyRent)}/mo</option>)}
        </select>
      </div>
      {selectedCat && (
        <div className="info-box mb3" style={{ fontSize: 12.5 }}>
          <b>{selectedCat.name}</b>: Rent {fmt(selectedCat.monthlyRent)}/mo · Admission {fmt(selectedCat.admissionFee)} · Deposit {fmt(selectedCat.depositAmount)}
        </div>
      )}
      <div className="frow">
        <div className="fg"><label className="fl">Room No.</label><input className="fi" value={form.room} onChange={set("room")} placeholder="101" /></div>
        <div className="fg"><label className="fl">Bed / Slot</label><input className="fi" value={form.bed} onChange={set("bed")} placeholder="A" /></div>
      </div>
      {error && <div className="ferr">⚠ {error}</div>}
    </Modal>
  );
}

function MemberDetailModal({ member, cats, isOwner, onClose, onEdited }) {
  const [createLogin, setCreateLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: member.email || "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const toast = useToast();

  let extra = {};
  try { extra = JSON.parse(member.extraFieldsJson || member.extraFields && JSON.stringify(member.extraFields) || "{}"); } catch {}

  async function submitLogin() {
    setLoginError(""); setLoginLoading(true);
    try {
      await api(`/api/members/${member.id}/create-login`, { method: "POST", body: JSON.stringify(loginForm) });
      toast("Login created", "success"); setCreateLogin(false); onEdited();
    } catch (e) { setLoginError(e.message); } finally { setLoginLoading(false); }
  }

  const rows = [
    ["Phone", member.phone],
    ["Email", member.email],
    ["Designation", member.designation],
    ["ID Document", member.idDocumentType],
    ["Category", member.categoryName ? `${member.categoryName} — ${fmt(member.monthlyRent)}/mo` : null],
    ["Room / Bed", extra.room ? `${extra.room}${extra.bed ? " / " + extra.bed : ""}` : null],
    ["Joined", new Date(member.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
    member.discontinuedAt && ["Discontinued", new Date(member.discontinuedAt).toLocaleDateString("en-IN") + (member.discontinuedReason ? ` — ${member.discontinuedReason}` : "")],
  ].filter(Boolean);

  return (
    <Modal open onClose={onClose} title="Member Profile" size="modal-lg"
      footer={<button className="btn btn-g" onClick={onClose}>Close</button>}>
      <div className="flex aic gap3 mb3" style={{ paddingBottom: 16, borderBottom: "1px solid var(--stone-p)" }}>
        <div className="avatar" style={{ width: 52, height: 52, fontSize: 18, flexShrink: 0, background: member.discontinuedAt ? "#7C4A8C" : member.isActive ? "var(--terra)" : "var(--stone)" }}>
          {initials(member.fullName)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600 }}>{member.fullName}</div>
          <div className="flex aic gap2 mt1">
            <StatusBadge status={member.discontinuedAt ? "Discontinued" : member.isActive ? "Active" : "Inactive"} />
            {member.categoryName && <span className="badge b-cat">{member.categoryName}</span>}
            {member.hasLogin && <span className="badge b-active">Portal Access</span>}
          </div>
        </div>
      </div>

      {rows.map(([label, val]) => val && (
        <div key={label} className="detail-row">
          <span className="detail-lbl">{label}</span>
          <span className="detail-val">{val}</span>
        </div>
      ))}

      {isOwner && !member.hasLogin && !member.discontinuedAt && (
        <div className="mt3">
          <div className="divider" />
          {!createLogin
            ? <button className="btn btn-g btn-sm" onClick={() => setCreateLogin(true)}>🔑 Create Portal Login</button>
            : <>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--coal-m)", marginBottom: 12 }}>Create Login Credentials</div>
              <div className="frow">
                <div className="fg"><label className="fl">Login Email</label><input className="fi" type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="fg"><label className="fl">Password</label><input className="fi" type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 chars" /></div>
              </div>
              {loginError && <div className="ferr mb2">⚠ {loginError}</div>}
              <div className="flex gap2">
                <button className="btn btn-p btn-sm" onClick={submitLogin} disabled={loginLoading}>Create</button>
                <button className="btn btn-g btn-sm" onClick={() => setCreateLogin(false)}>Cancel</button>
              </div>
            </>
          }
        </div>
      )}
    </Modal>
  );
}

function DiscontinueModal({ member, onClose, onSaved }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError(""); setLoading(true);
    try {
      await api(`/api/members/${member.id}/discontinue`, { method: "POST", body: JSON.stringify({ reason: reason || null }) });
      onSaved();
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <Modal open onClose={onClose} title={`Discontinue — ${member.fullName}`}
      footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-err" onClick={submit} disabled={loading}>Discontinue Member</button></>}>
      <div className="warn-box mb3">
        ⚠ This will mark the member as discontinued. They will no longer appear in active members or have dues generated. This action can only be reversed by an admin.
      </div>
      <div className="fg"><label className="fl">Reason (optional)</label><textarea className="fta" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Moved out, Course completed, Non-payment…" /></div>
      {error && <div className="ferr">⚠ {error}</div>}
    </Modal>
  );
}

// ─── DUES ─────────────────────────────────────────────────────────────────────
function Dues() {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [status, setStatus] = useState("");
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ year, month });
      if (status) p.set("status", status);
      const d = await api(`/api/dues?${p}`);
      setDues(Array.isArray(d) ? d : []);
    } catch { setDues([]); } finally { setLoading(false); }
  }, [year, month, status]);

  useEffect(() => { load(); }, [load]);

  const totals = dues.reduce((a, d) => ({ due: a.due + d.amount, paid: a.paid + (d.totalPaid ?? 0) }), { due: 0, paid: 0 });

  return (
    <>
      <div className="page-hdr">
        <div><h1 className="page-title">Dues & Payments</h1><p className="page-sub">{MONTHS[month - 1]} {year} — {dues.length} records</p></div>
        <button className="btn btn-p" onClick={() => setShowGenerate(true)}>⚡ Generate Month</button>
      </div>
      <div className="page-body">
        {dues.length > 0 && (
          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", maxWidth: 500, marginBottom: 20 }}>
            {[["Total Due", fmt(totals.due)], ["Collected", fmt(totals.paid)], ["Pending", fmt(totals.due - totals.paid)]].map(([l, v]) => (
              <div key={l} className="stat-card" style={{ padding: "14px 18px" }}>
                <div className="stat-label">{l}</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{v}</div>
              </div>
            ))}
          </div>
        )}

        <div className="toolbar">
          <select className="fs" style={{ width: 110 }} value={year} onChange={e => setYear(+e.target.value)}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
          <select className="fs" style={{ width: 105 }} value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="fs" style={{ width: 130 }} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="Due">Due</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        <div className="card">
          {loading ? <Spinner /> : dues.length === 0
            ? <div className="empty"><span className="empty-icon">🧾</span><div className="empty-title">No dues found</div><p style={{ fontSize: 13 }}>Generate dues for this month or adjust filters</p></div>
            : <div className="tbl-wrap"><table>
              <thead><tr><th>Member</th><th>Category</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Progress</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {dues.map(d => {
                  const pct = d.amount > 0 ? (d.totalPaid / d.amount) * 100 : 0;
                  return (
                    <tr key={d.id}>
                      <td><div className="fw5" style={{ color: "var(--coal)" }}>{d.memberName}</div></td>
                      <td>{d.categoryName ? <span className="badge b-cat" style={{ fontSize: 11 }}>{d.categoryName}</span> : <span className="muted">—</span>}</td>
                      <td className="amount">{fmt(d.amount)}</td>
                      <td className="amount" style={{ color: "var(--ok)" }}>{fmt(d.totalPaid)}</td>
                      <td className="amount" style={{ color: d.balance > 0 ? "var(--err)" : "var(--stone)" }}>{fmt(d.balance)}</td>
                      <td style={{ width: 100 }}>
                        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? "var(--ok)" : pct > 0 ? "var(--warn)" : "var(--terra)" }} /></div>
                        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{pct.toFixed(0)}%</div>
                      </td>
                      <td><StatusBadge status={d.status} /></td>
                      <td>{d.status !== "Paid" && <button className="btn btn-p btn-sm" onClick={() => setPayModal(d)}>Record Payment</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          }
        </div>
      </div>

      <GenerateDuesModal open={showGenerate} onClose={() => setShowGenerate(false)} onSaved={() => { setShowGenerate(false); load(); toast("Dues generated", "success"); }} />
      {payModal && <AddPaymentModal due={payModal} onClose={() => setPayModal(null)} onSaved={() => { setPayModal(null); load(); toast("Payment recorded!", "success"); }} />}
    </>
  );
}

function GenerateDuesModal({ open, onClose, onSaved }) {
  const now = new Date();
  const [form, setForm] = useState({ year: now.getFullYear(), month: now.getMonth() + 1, amountOverride: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit() {
    setError(""); setLoading(true);
    try {
      const body = { year: +form.year, month: +form.month };
      if (form.amountOverride) body.amountOverride = parseFloat(form.amountOverride);
      const r = await api("/api/dues/generate-month", { method: "POST", body: JSON.stringify(body) });
      setResult(r);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  function done() { setResult(null); onSaved(); }

  return (
    <Modal open={open} onClose={() => { setResult(null); onClose(); }} title="Generate Monthly Dues"
      footer={!result ? <><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={submit} disabled={loading}>Generate</button></> : <button className="btn btn-p" onClick={done}>Done</button>}>
      {result ? (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 46, marginBottom: 10 }}>✓</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, marginBottom: 8 }}>Dues Generated</div>
          <div className="muted"><strong style={{ color: "var(--ok)" }}>{result.generated ?? result.Generated}</strong> created · <strong>{result.skipped ?? result.Skipped}</strong> skipped</div>
        </div>
      ) : (
        <>
          <div className="frow">
            <div className="fg"><label className="fl">Month</label>
              <select className="fs" value={form.month} onChange={set("month")}>{MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}</select>
            </div>
            <div className="fg"><label className="fl">Year</label><input className="fi" type="number" value={form.year} onChange={set("year")} /></div>
          </div>
          <div className="fg"><label className="fl">Amount Override (₹) — optional</label><input className="fi" type="number" value={form.amountOverride} onChange={set("amountOverride")} placeholder="Leave blank to use each member's category rent" /></div>
          <div className="info-box">Members without a category or configured rent will be skipped.</div>
          {error && <div className="ferr mt2">⚠ {error}</div>}
        </>
      )}
    </Modal>
  );
}

function AddPaymentModal({ due, onClose, onSaved }) {
  const [amount, setAmount] = useState(String(due.balance > 0 ? due.balance : due.amount));
  const [method, setMethod] = useState("2");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pct = due.amount > 0 ? (due.totalPaid / due.amount) * 100 : 0;
  const newPct = due.amount > 0 ? Math.min(((due.totalPaid + parseFloat(amount || 0)) / due.amount) * 100, 100) : 0;

  async function submit() {
    if (!amount || parseFloat(amount) <= 0) { setError("Enter a valid amount."); return; }
    setError(""); setLoading(true);
    try {
      await api(`/api/dues/${due.id}/payments`, { method: "POST", body: JSON.stringify({ amountPaid: parseFloat(amount), method: parseInt(method), notes: notes || null }) });
      onSaved();
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <Modal open onClose={onClose} title={`Record Payment`}
      footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={submit} disabled={loading}>Save Payment</button></>}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 600, marginBottom: 14 }}>{due.memberName}</div>
      <div className="frow3 mb3">
        {[["Total Due", fmt(due.amount)], ["Already Paid", fmt(due.totalPaid)], ["Balance", fmt(due.balance)]].map(([l, v]) => (
          <div key={l} style={{ textAlign: "center", padding: "10px 6px", background: "var(--stone-p)", borderRadius: 8 }}>
            <div style={{ fontSize: 10.5, color: "var(--stone)", textTransform: "uppercase", letterSpacing: ".5px" }}>{l}</div>
            <div className="amount" style={{ fontSize: 15 }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="mb3">
        <div style={{ fontSize: 12, color: "var(--stone)", marginBottom: 4 }}>Payment progress after this entry</div>
        <div className="progress-track" style={{ height: 10 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: "var(--terra)", opacity: .4 }} />
        </div>
        <div className="progress-track" style={{ height: 10, marginTop: 4 }}>
          <div className="progress-fill" style={{ width: `${newPct}%`, background: newPct >= 100 ? "var(--ok)" : newPct > 0 ? "var(--warn)" : "var(--terra)" }} />
        </div>
        <div className="muted mt1">{newPct.toFixed(0)}% after this payment</div>
      </div>

      <div className="frow">
        <div className="fg">
          <label className="fl">Amount (₹) *</label>
          <input className="fi" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
          <div className="fsec">Partial payments allowed</div>
        </div>
        <div className="fg"><label className="fl">Payment Method</label>
          <select className="fs" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="2">Cash</option><option value="4">UPI</option><option value="3">Bank Transfer</option><option value="5">Card</option><option value="1">Manual</option><option value="6">Other</option>
          </select>
        </div>
      </div>
      <div className="fg"><label className="fl">Notes</label><input className="fi" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Transaction ID, receipt no., etc." /></div>
      {due.payments?.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--stone)", marginBottom: 8 }}>PAYMENT HISTORY</div>
          {due.payments.map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--stone-p)", fontSize: 13 }}>
              <span>{new Date(p.paidOn).toLocaleDateString("en-IN")} · {p.method}</span>
              <span className="amount" style={{ color: "var(--ok)" }}>{fmt(p.amountPaid)}</span>
            </div>
          ))}
        </div>
      )}
      {error && <div className="ferr mt2">⚠ {error}</div>}
    </Modal>
  );
}

// ─── PAYMENTS HISTORY ─────────────────────────────────────────────────────────
function PaymentsHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const METHODS = { 1: "Manual", 2: "Cash", 3: "Bank Transfer", 4: "UPI", 5: "Card", 6: "Other" };

  useEffect(() => {
    api("/api/payments").then(d => setPayments(Array.isArray(d) ? d : [])).catch(() => setPayments([])).finally(() => setLoading(false));
  }, []);

  const total = payments.reduce((s, p) => s + p.amountPaid, 0);

  return (
    <>
      <div className="page-hdr">
        <div><h1 className="page-title">Payment History</h1><p className="page-sub">{payments.length} transactions · {fmt(total)} total</p></div>
      </div>
      <div className="page-body">
        <div className="card">
          {loading ? <Spinner /> : payments.length === 0
            ? <div className="empty"><span className="empty-icon">💳</span><div className="empty-title">No payments yet</div></div>
            : <div className="tbl-wrap"><table>
              <thead><tr><th>Member</th><th>Due Period</th><th>Amount</th><th>Method</th><th>Date</th><th>Notes</th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="fw5" style={{ color: "var(--coal)" }}>{p.memberName}</td>
                    <td className="muted">{MONTHS[(p.dueMonth ?? 1) - 1]} {p.dueYear}</td>
                    <td className="amount" style={{ color: "var(--ok)" }}>{fmt(p.amountPaid)}</td>
                    <td><span className="badge b-ok">{METHODS[p.method] ?? "Manual"}</span></td>
                    <td className="muted">{new Date(p.paidOn).toLocaleDateString("en-IN")}</td>
                    <td className="muted">{p.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          }
        </div>
      </div>
    </>
  );
}

// ─── STAFF ────────────────────────────────────────────────────────────────────
function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await api("/api/owner/staff"); setStaff(Array.isArray(d) ? d : []); }
    catch { setStaff([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(s) {
    try {
      await api(`/api/owner/staff/${s.id}/status`, { method: "PATCH", body: JSON.stringify({ isActive: !s.isActive }) });
      toast(`${s.fullName} ${!s.isActive ? "activated" : "deactivated"}`, "success"); load();
    } catch (e) { toast(e.message, "error"); }
  }

  return (
    <>
      <div className="page-hdr">
        <div><h1 className="page-title">Staff</h1><p className="page-sub">Manage your team members</p></div>
        <button className="btn btn-p" onClick={() => setShowAdd(true)}>＋ Add Staff</button>
      </div>
      <div className="page-body">
        <div className="card">
          {loading ? <Spinner /> : staff.length === 0
            ? <div className="empty"><span className="empty-icon">🧑‍💼</span><div className="empty-title">No staff yet</div></div>
            : <div className="tbl-wrap"><table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex aic gap2">
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 11, background: "var(--coal-m)" }}>{initials(s.fullName)}</div>
                        <span className="fw5">{s.fullName}</span>
                      </div>
                    </td>
                    <td className="muted">{s.email}</td>
                    <td className="muted">{s.phone || "—"}</td>
                    <td><StatusBadge status={s.isActive ? "Active" : "Inactive"} /></td>
                    <td className="muted">{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                    <td><button className={`btn btn-sm ${s.isActive ? "btn-err" : "btn-ok"}`} onClick={() => toggleStatus(s)}>{s.isActive ? "Deactivate" : "Activate"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          }
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Staff Member"
        footer={null}>
        <AddStaffForm onSaved={() => { setShowAdd(false); load(); toast("Staff added", "success"); }} onCancel={() => setShowAdd(false)} />
      </Modal>
    </>
  );
}

function AddStaffForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  async function submit() {
    setError(""); setLoading(true);
    try { await api("/api/owner/staff", { method: "POST", body: JSON.stringify({ ...form, phone: form.phone || null }) }); onSaved(); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  return (
    <>
      <div className="fg"><label className="fl">Full Name *</label><input className="fi" value={form.fullName} onChange={set("fullName")} /></div>
      <div className="frow">
        <div className="fg"><label className="fl">Email *</label><input className="fi" type="email" value={form.email} onChange={set("email")} /></div>
        <div className="fg"><label className="fl">Phone</label><input className="fi" value={form.phone} onChange={set("phone")} /></div>
      </div>
      <div className="fg"><label className="fl">Password *</label><input className="fi" type="password" value={form.password} onChange={set("password")} placeholder="Min 6 characters" /></div>
      {error && <div className="ferr mb2">⚠ {error}</div>}
      <div className="flex gap2" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-g" onClick={onCancel}>Cancel</button>
        <button className="btn btn-p" onClick={submit} disabled={loading}>Add Staff</button>
      </div>
    </>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

// ─── SUPER ADMIN ─────────────────────────────────────────────────────────────
function SuperAdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const [s, o] = await Promise.all([
      api("/api/super/summary").catch(() => null),
      api("/api/super/organizations").catch(() => []),
    ]);
    setSummary(s); setOrgs(Array.isArray(o) ? o : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(org) {
    try {
      await api(`/api/super/organizations/${org.id}/status`, { method: "PATCH", body: JSON.stringify({ isActive: !org.isActive }) });
      toast(`${org.name} ${!org.isActive ? "activated" : "deactivated"}`, "success");
      load();
    } catch (e) { toast(e.message, "error"); }
    setConfirm(null);
  }

  if (loading) return <Spinner />;

  return (
    <>
      <div className="page-hdr">
        <div><h1 className="page-title">Super Admin</h1><p className="page-sub">All organisations overview</p></div>
        <button className="btn btn-p" onClick={() => setShowAdd(true)}>＋ New Organisation</button>
      </div>
      <div className="page-body">
        <div className="stat-grid" style={{ marginBottom: 28 }}>
          {[
            { label: "Total Organisations", value: summary?.totalOrganizations ?? 0, sub: `${summary?.activeOrganizations ?? 0} active`, icon: "⬡" },
            { label: "Total Members", value: summary?.totalMembers ?? 0, sub: "across all orgs", icon: "◉" },
            { label: "Total Revenue", value: fmt(summary?.totalRevenue), sub: "all time collected", icon: "●" },
            { label: "Outstanding", value: fmt(summary?.totalOutstanding), sub: "pending collection", icon: "◐" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {summary?.topOrganizations?.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-hdr"><span className="card-title">Revenue by Organisation</span></div>
            <div className="card-body">
              {summary.topOrganizations.map(o => {
                const maxRev = Math.max(...summary.topOrganizations.map(x => x.revenue), 1);
                return (
                  <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--stone)", width: 140, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.name}</span>
                    <div style={{ flex: 1, height: 26, background: "var(--stone-p)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${(o.revenue / maxRev) * 100}%`, background: "var(--terra)", borderRadius: 4, transition: "width .6s ease" }} />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--coal-m)", width: 80, textAlign: "right", fontWeight: 500, flexShrink: 0 }}>{fmt(o.revenue)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-hdr"><span className="card-title">All Organisations</span></div>
          {orgs.length === 0
            ? <div className="empty"><span className="empty-icon">⬡</span><div className="empty-title">No organisations yet</div></div>
            : <div className="tbl-wrap"><table>
              <thead><tr><th>Organisation</th><th>Type</th><th>Owner</th><th>Members</th><th>Revenue</th><th>Outstanding</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {orgs.map(o => (
                  <tr key={o.id}>
                    <td><div className="fw5" style={{ color: "var(--coal)" }}>{o.name}</div><div className="muted">{new Date(o.createdAt).toLocaleDateString("en-IN")}</div></td>
                    <td><span className="badge b-cat">{o.businessType}</span></td>
                    <td><div style={{ fontSize: 13 }}>{o.ownerName || "—"}</div><div className="muted">{o.ownerEmail || ""}</div></td>
                    <td style={{ textAlign: "center" }}>{o.memberCount}</td>
                    <td className="amount" style={{ color: "var(--ok)" }}>{fmt(o.totalRevenue)}</td>
                    <td className="amount" style={{ color: o.totalOutstanding > 0 ? "var(--err)" : "var(--stone)" }}>{fmt(o.totalOutstanding)}</td>
                    <td><StatusBadge status={o.isActive ? "Active" : "Inactive"} /></td>
                    <td><button className={`btn btn-sm ${o.isActive ? "btn-err" : "btn-ok"}`} onClick={() => setConfirm(o)}>{o.isActive ? "Deactivate" : "Activate"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          }
        </div>
      </div>
      <AddOrgModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); toast("Organisation created!", "success"); }} />
      <Confirm open={!!confirm} title={confirm?.isActive ? "Deactivate Organisation" : "Activate Organisation"} danger={confirm?.isActive}
        message={confirm?.isActive ? `Deactivate "${confirm?.name}"? Their staff and owner will lose access.` : `Activate "${confirm?.name}"? They will regain full access.`}
        onConfirm={() => toggleStatus(confirm)} onCancel={() => setConfirm(null)} />
    </>
  );
}

function AddOrgModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ organizationName: "", businessType: "1", ownerFullName: "", ownerEmail: "", ownerPassword: "", ownerPhone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (open) { setForm({ organizationName: "", businessType: "1", ownerFullName: "", ownerEmail: "", ownerPassword: "", ownerPhone: "" }); setError(""); }
  }, [open]);

  async function submit() {
    setError(""); setLoading(true);
    try {
      await api("/api/super/organizations", { method: "POST", body: JSON.stringify({ ...form, businessType: parseInt(form.businessType) }) });
      onSaved();
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Organisation" size="modal-lg"
      footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={submit} disabled={loading}>Create</button></>}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--stone)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>Organisation</div>
      <div className="frow">
        <div className="fg"><label className="fl">Organisation Name *</label><input className="fi" value={form.organizationName} onChange={set("organizationName")} placeholder="Green Valley Hostel" /></div>
        <div className="fg"><label className="fl">Business Type</label>
          <select className="fs" value={form.businessType} onChange={set("businessType")}>
            <option value="1">Hostel</option><option value="2">Tuition</option><option value="3">Gym</option><option value="4">Other</option>
          </select>
        </div>
      </div>
      <div className="divider" />
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--stone)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>Owner Account</div>
      <div className="frow">
        <div className="fg"><label className="fl">Full Name *</label><input className="fi" value={form.ownerFullName} onChange={set("ownerFullName")} placeholder="Rajesh Kumar" /></div>
        <div className="fg"><label className="fl">Phone</label><input className="fi" value={form.ownerPhone} onChange={set("ownerPhone")} placeholder="9876543210" /></div>
      </div>
      <div className="frow">
        <div className="fg"><label className="fl">Email *</label><input className="fi" type="email" value={form.ownerEmail} onChange={set("ownerEmail")} placeholder="owner@example.com" /></div>
        <div className="fg"><label className="fl">Password *</label><input className="fi" type="password" value={form.ownerPassword} onChange={set("ownerPassword")} placeholder="Min 6 characters" /></div>
      </div>
      {error && <div className="ferr">⚠ {error}</div>}
    </Modal>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: "⊞", label: "Dashboard", roles: ["OrganizationOwner", "OrganizationStaff"] },
  { id: "categories", icon: "🏷", label: "Categories", roles: ["OrganizationOwner", "OrganizationStaff"] },
  { id: "members", icon: "◉", label: "Members", roles: ["OrganizationOwner", "OrganizationStaff"] },
  { id: "dues", icon: "◌", label: "Dues", roles: ["OrganizationOwner", "OrganizationStaff"] },
  { id: "payments", icon: "●", label: "Payments", roles: ["OrganizationOwner", "OrganizationStaff"] },
  { id: "staff", icon: "⬡", label: "Staff", roles: ["OrganizationOwner"] },
  { id: "superadmin", icon: "★", label: "Organisations", roles: ["SuperAdmin"] },
];

function AppShell({ user, onLogout }) {
  const isSuperAdmin = user?.role === "SuperAdmin";
  const [page, setPage] = useState(isSuperAdmin ? "superadmin" : "dashboard");
  const nav = NAV.filter(n => n.roles.includes(user?.role));

  function renderPage() {
    switch (page) {
      case "dashboard":  return <Dashboard />;
      case "categories": return <Categories user={user} />;
      case "members":    return <Members user={user} />;
      case "dues":       return <Dues />;
      case "payments":   return <PaymentsHistory />;
      case "staff":      return <Staff />;
      case "superadmin": return <SuperAdminDashboard />;
      default:           return isSuperAdmin ? <SuperAdminDashboard /> : <Dashboard />;
    }
  }

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-text">H<span>.</span>alto</div>
          <div className="sb-org">{isSuperAdmin ? "Super Admin" : (user?.organizationName || "Organisation")}</div>
        </div>
        <div className="sb-nav">
          <div className="sb-sec">Navigation</div>
          {nav.map(n => (
            <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
        <div className="sb-footer">
          <div className="user-pill">
            <div className="avatar" style={{ background: isSuperAdmin ? "var(--warn)" : "var(--terra)" }}>{initials(user?.fullName)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="u-name">{user?.fullName}</div>
              <div className="u-role">{isSuperAdmin ? "Super Admin" : user?.role === "OrganizationOwner" ? "Owner" : "Staff"}</div>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Sign out">⏻</button>
          </div>
        </div>
      </nav>
      <main className="main">{renderPage()}</main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("halto_token");
    if (!token) return null;
    try {
      const p = JSON.parse(atob(token.split(".")[1]));
      const role = p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? p.role ?? "";
      return {
        fullName: p["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ?? p.name ?? "User",
        role,
        organizationName: p.org_name ?? p.OrganizationName ?? "",
      };
    } catch { return null; }
  });

  return (
    <ToastProvider>
      <style>{CSS}</style>
      {user
        ? <AppShell user={user} onLogout={() => { localStorage.removeItem("halto_token"); setUser(null); }} />
        : <AuthPage onLogin={u => setUser(u)} />}
    </ToastProvider>
  );
}
