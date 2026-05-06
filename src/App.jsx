import { useState, useEffect, useCallback, createContext, useContext } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function api(path, options = {}) {
  const token = localStorage.getItem("halto_token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  return data?.data ?? data;
}

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
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
      <div style={{ position: "fixed", bottom: 24, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, maxWidth: "calc(100vw - 32px)" }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 500,
            boxShadow: "0 4px 20px rgba(0,0,0,0.22)", minWidth: 240, display: "flex", alignItems: "center", gap: 10,
            animation: "slideInRight .28s cubic-bezier(.34,1.56,.64,1)",
            background: t.type === "success" ? "#0F6E56" : t.type === "error" ? "#C44F4F" : "#1a2e2a",
            color: "white"
          }}>
            <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "●"}</span>{t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

const fmt = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0);
const initials = (name = "") => name.split(" ").slice(0, 2).map(w => w[0] ?? "").join("").toUpperCase();
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const ID_TYPES = ["Aadhaar", "Passport", "Driving License", "Voter ID", "PAN Card", "Other"];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --teal:#1D9E75; --teal-d:#0F6E56; --teal-dd:#085041; --teal-l:#5DCAA5;
    --teal-p:#E1F5EE; --teal-pp:#9FE1CB;
    --navy:#0a1f1a; --navy-m:#122b23; --navy-s:#1a3d32;
    --ink:#1a2e2a; --ink-m:#2d4a40; --ink-l:#4a6b5e;
    --mist:#f0f9f5; --mist-d:#d8f0e5; --mist-dd:#b0dcc8;
    --warm:#ffffff; --surface:#f7fdf9;
    --ok:#0F6E56; --ok-p:#E1F5EE;
    --warn:#B8860B; --warn-p:#FFF8DC;
    --err:#C0392B; --err-p:#FDECEA;
    --sidebar:260px;
    --r:12px; --r-s:8px; --r-xs:6px;
    --sh:0 1px 8px rgba(15,110,86,.08); --sh-m:0 4px 20px rgba(15,110,86,.13); --sh-l:0 8px 32px rgba(15,110,86,.18);
    --t:.18s cubic-bezier(.4,0,.2,1);
    --header-h:64px;
  }
  body{font-family:'Sora',sans-serif;background:var(--surface);color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased}
  @keyframes slideInRight{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}

  /* ── Auth ── */
  .auth-wrap{min-height:100vh;display:grid;grid-template-columns:1fr 1fr}
  .auth-panel{background:var(--navy);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:60px;position:relative;overflow:hidden}
  .auth-panel::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 80%,rgba(29,158,117,.22) 0%,transparent 55%),radial-gradient(ellipse at 85% 15%,rgba(93,202,165,.1) 0%,transparent 50%)}
  .auth-panel-grid{position:absolute;inset:0;opacity:.04;background-image:linear-gradient(var(--teal-l) 1px,transparent 1px),linear-gradient(90deg,var(--teal-l) 1px,transparent 1px);background-size:40px 40px}
  .auth-logo-mark{width:72px;height:72px;background:linear-gradient(135deg,var(--teal),var(--teal-l));border-radius:18px;display:flex;align-items:center;justify-content:center;margin-bottom:22px;box-shadow:0 8px 24px rgba(29,158,117,.35);position:relative;z-index:1}
  .auth-logo-mark svg{width:40px;height:40px}
  .auth-logo-name{font-family:'DM Serif Display',serif;font-size:38px;color:#fff;letter-spacing:-.5px;position:relative;z-index:1}
  .auth-logo-name span{color:var(--teal-l)}
  .auth-tagline{font-size:14px;color:rgba(255,255,255,.45);margin-top:6px;position:relative;z-index:1;font-weight:300}
  .auth-features{margin-top:44px;display:flex;flex-direction:column;gap:16px;position:relative;z-index:1;width:100%;max-width:300px}
  .auth-feat{display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.6);font-size:13.5px}
  .auth-feat-dot{width:28px;height:28px;border-radius:8px;background:rgba(29,158,117,.2);border:1px solid rgba(29,158,117,.35);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px}
  .auth-form-side{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:48px 40px;background:var(--warm)}
  .auth-form-wrap{width:100%;max-width:400px}
  .auth-title{font-family:'DM Serif Display',serif;font-size:30px;color:var(--ink);margin-bottom:6px}
  .auth-sub{font-size:14px;color:var(--ink-l);margin-bottom:30px}

  /* ── App Layout ── */
  .app{display:flex;min-height:100vh}
  .sidebar{width:var(--sidebar);background:var(--navy);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:200;transition:transform var(--t)}
  .sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:199;backdrop-filter:blur(2px)}
  .main{margin-left:var(--sidebar);flex:1;min-height:100vh;display:flex;flex-direction:column}
  .topbar{display:none;height:var(--header-h);background:var(--navy);align-items:center;justify-content:space-between;padding:0 16px;position:sticky;top:0;z-index:100;border-bottom:1px solid rgba(255,255,255,.06)}
  .topbar-logo{font-family:'DM Serif Display',serif;font-size:22px;color:#fff}
  .topbar-logo span{color:var(--teal-l)}
  .hamburger{background:none;border:none;cursor:pointer;padding:8px;color:rgba(255,255,255,.7);font-size:20px;border-radius:8px;transition:var(--t);line-height:1}
  .hamburger:hover{background:rgba(255,255,255,.1);color:#fff}
  .page-hdr{padding:24px 32px 20px;border-bottom:1px solid var(--mist-dd);background:var(--warm);display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .page-title{font-family:'DM Serif Display',serif;font-size:26px;color:var(--ink)}
  .page-sub{font-size:13px;color:var(--ink-l);margin-top:2px}
  .page-body{padding:24px 32px;flex:1}

  /* ── Sidebar ── */
  .sb-logo{padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:12px}
  .sb-logo-mark{width:38px;height:38px;background:linear-gradient(135deg,var(--teal),var(--teal-l));border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .sb-logo-mark svg{width:22px;height:22px}
  .sb-logo-text{font-family:'DM Serif Display',serif;font-size:20px;color:#fff;letter-spacing:-.3px}
  .sb-logo-text span{color:var(--teal-l)}
  .sb-org{font-size:11px;color:rgba(255,255,255,.35);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sb-nav{flex:1;padding:12px 10px;overflow-y:auto}
  .sb-sec{font-size:10px;font-weight:600;color:rgba(255,255,255,.25);letter-spacing:1.2px;text-transform:uppercase;padding:10px 12px 5px}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;color:rgba(255,255,255,.45);font-size:13px;font-weight:400;cursor:pointer;transition:var(--t);border:none;background:none;width:100%;text-align:left;font-family:inherit}
  .nav-item:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.85)}
  .nav-item.active{background:rgba(29,158,117,.2);color:var(--teal-l);font-weight:500}
  .nav-item.active .nav-icon{color:var(--teal-l)}
  .nav-icon{font-size:16px;width:20px;text-align:center;opacity:.9;flex-shrink:0}
  .sb-footer{padding:12px 10px;border-top:1px solid rgba(255,255,255,.06)}
  .user-pill{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;background:rgba(255,255,255,.05)}
  .avatar{width:32px;height:32px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:white;flex-shrink:0;letter-spacing:.5px}
  .u-name{font-size:12.5px;color:rgba(255,255,255,.85);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .u-role{font-size:10.5px;color:rgba(255,255,255,.3)}
  .logout-btn{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.3);cursor:pointer;font-size:15px;padding:4px 6px;border-radius:4px;transition:var(--t);flex-shrink:0}
  .logout-btn:hover{color:var(--teal-l)}

  /* ── Cards ── */
  .card{background:var(--warm);border:1px solid var(--mist-d);border-radius:var(--r);box-shadow:var(--sh)}
  .card-hdr{padding:16px 20px 12px;border-bottom:1px solid var(--mist-d);display:flex;align-items:center;justify-content:space-between;gap:12px}
  .card-title{font-family:'DM Serif Display',serif;font-size:16px;color:var(--ink)}
  .card-body{padding:16px 20px}

  /* ── Stat Cards ── */
  .stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:12px;margin-bottom:22px}
  .stat-card{background:var(--warm);border:1px solid var(--mist-d);border-radius:var(--r);padding:16px 20px;box-shadow:var(--sh);transition:var(--t);position:relative;overflow:hidden;cursor:default}
  .stat-card::before{content:'';position:absolute;top:-20px;right:-20px;width:80px;height:80px;background:var(--teal-p);border-radius:50%;opacity:.5}
  .stat-card:hover{transform:translateY(-2px);box-shadow:var(--sh-m)}
  .stat-label{font-size:10.5px;font-weight:600;color:var(--ink-l);text-transform:uppercase;letter-spacing:.9px}
  .stat-value{font-family:'DM Serif Display',serif;font-size:26px;color:var(--ink);margin-top:4px;line-height:1.1}
  .stat-sub{font-size:11.5px;color:var(--ink-l);margin-top:4px}
  .stat-icon{position:absolute;top:14px;right:14px;font-size:18px;z-index:1;opacity:.5}

  /* ── Table ── */
  .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
  table{width:100%;border-collapse:collapse;font-size:13px;min-width:500px}
  th{padding:10px 14px;text-align:left;font-size:10.5px;font-weight:600;color:var(--ink-l);text-transform:uppercase;letter-spacing:.8px;background:var(--mist);white-space:nowrap}
  td{padding:12px 14px;border-bottom:1px solid var(--mist-d);color:var(--ink-m);vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tbody tr{transition:var(--t);cursor:default}
  tbody tr:hover{background:var(--mist)}

  /* ── Badges ── */
  .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.2px;white-space:nowrap}
  .b-due{background:var(--err-p);color:var(--err)}
  .b-partial{background:var(--warn-p);color:var(--warn)}
  .b-paid{background:var(--ok-p);color:var(--ok)}
  .b-active{background:var(--ok-p);color:var(--ok)}
  .b-inactive{background:var(--mist);color:var(--ink-l)}
  .b-discontinued{background:#f3e8ff;color:#6b21a8}
  .b-nodue{background:var(--mist);color:var(--ink-l)}
  .b-owner{background:var(--teal-p);color:var(--teal-dd)}
  .b-cat{background:var(--mist);border:1px solid var(--mist-dd);color:var(--ink-m)}
  .b-warn{background:var(--warn-p);color:var(--warn)}
  .b-ok{background:var(--ok-p);color:var(--ok)}

  /* ── Buttons ── */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:var(--r-s);font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;border:none;transition:var(--t);white-space:nowrap;text-decoration:none}
  .btn-p{background:var(--teal);color:white}
  .btn-p:hover:not(:disabled){background:var(--teal-d);box-shadow:0 4px 12px rgba(29,158,117,.35)}
  .btn-s{background:var(--mist);color:var(--ink-m)}
  .btn-s:hover:not(:disabled){background:var(--mist-dd)}
  .btn-g{background:transparent;color:var(--ink-l);border:1px solid var(--mist-dd)}
  .btn-g:hover:not(:disabled){background:var(--mist);color:var(--ink)}
  .btn-err{background:var(--err-p);color:var(--err);border:1px solid rgba(192,57,43,.2)}
  .btn-err:hover:not(:disabled){background:var(--err);color:white}
  .btn-warn{background:var(--warn-p);color:var(--warn);border:1px solid rgba(184,134,11,.2)}
  .btn-warn:hover:not(:disabled){background:var(--warn);color:white}
  .btn-ok{background:var(--ok-p);color:var(--ok);border:1px solid rgba(15,110,86,.2)}
  .btn-ok:hover:not(:disabled){background:var(--ok);color:white}
  .btn-sm{padding:5px 11px;font-size:12px}
  .btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important}

  /* ── Forms ── */
  .fg{margin-bottom:14px}
  .fl{display:block;font-size:12px;font-weight:500;color:var(--ink-m);margin-bottom:5px}
  .fi,.fs,.fta{width:100%;padding:9px 13px;border:1.5px solid var(--mist-d);border-radius:var(--r-s);font-size:13.5px;font-family:inherit;color:var(--ink);background:var(--warm);transition:var(--t);outline:none}
  .fi:focus,.fs:focus,.fta:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(29,158,117,.1)}
  .fta{resize:vertical;min-height:72px}
  .frow{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .frow3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
  .ferr{font-size:12px;color:var(--err);margin-top:4px}
  .fsec{font-size:11px;color:var(--ink-l);margin-top:4px}

  /* ── Modal ── */
  .backdrop{position:fixed;inset:0;background:rgba(10,31,26,.55);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn .15s ease}
  .modal{background:var(--warm);border-radius:var(--r);box-shadow:var(--sh-l);width:100%;max-width:520px;max-height:94vh;overflow-y:auto;animation:slideUp .22s cubic-bezier(.34,1.56,.64,1)}
  .modal-lg{max-width:660px}
  .modal-hdr{padding:20px 24px 16px;border-bottom:1px solid var(--mist-d);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--warm);z-index:1}
  .modal-title{font-family:'DM Serif Display',serif;font-size:20px;color:var(--ink)}
  .modal-x{background:none;border:none;font-size:20px;cursor:pointer;color:var(--ink-l);padding:3px 6px;border-radius:5px;transition:var(--t);line-height:1}
  .modal-x:hover{background:var(--mist);color:var(--ink)}
  .modal-body{padding:20px 24px}
  .modal-ftr{padding:12px 24px 20px;display:flex;gap:10px;justify-content:flex-end;border-top:1px solid var(--mist-d)}

  /* ── Misc ── */
  .divider{height:1px;background:var(--mist-d);margin:16px 0}
  .loading{display:flex;align-items:center;justify-content:center;padding:56px}
  .spinner{width:32px;height:32px;border:3px solid var(--mist-d);border-top-color:var(--teal);border-radius:50%;animation:spin .7s linear infinite}
  .empty{text-align:center;padding:52px 24px;color:var(--ink-l)}
  .empty-icon{font-size:40px;opacity:.3;display:block;margin-bottom:10px}
  .empty-title{font-family:'DM Serif Display',serif;font-size:17px;color:var(--ink-m);margin-bottom:5px}
  .toolbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
  .search-wrap{position:relative;flex:1;min-width:180px}
  .search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--ink-l);pointer-events:none;font-size:14px}
  .pl{padding-left:34px!important}
  .amount{font-family:'DM Serif Display',serif;font-weight:400}
  .muted{color:var(--ink-l);font-size:12.5px}
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

  /* ── Upcoming strip ── */
  .upcoming-strip{background:var(--warn-p);border:1px solid rgba(184,134,11,.2);border-radius:var(--r);padding:12px 16px;margin-bottom:18px;display:flex;align-items:center;gap:12px}
  .upcoming-dot{width:8px;height:8px;border-radius:50%;background:var(--warn);animation:pulse 1.5s ease infinite;flex-shrink:0}

  /* ── Detail row ── */
  .detail-row{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--mist-d)}
  .detail-row:last-child{border-bottom:none}
  .detail-lbl{font-size:11px;font-weight:600;color:var(--ink-l);text-transform:uppercase;letter-spacing:.7px;width:120px;flex-shrink:0;padding-top:2px}
  .detail-val{font-size:13.5px;color:var(--ink-m)}

  /* ── Category card ── */
  .cat-card{background:var(--warm);border:1.5px solid var(--mist-d);border-radius:var(--r);padding:18px 20px;transition:var(--t);position:relative}
  .cat-card:hover{border-color:var(--teal);box-shadow:var(--sh-m)}
  .cat-name{font-family:'DM Serif Display',serif;font-size:17px;color:var(--ink);margin-bottom:6px}
  .cat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
  .cat-stat{text-align:center;padding:9px;background:var(--mist);border-radius:7px}
  .cat-stat-val{font-family:'DM Serif Display',serif;font-size:15px;color:var(--ink)}
  .cat-stat-lbl{font-size:10px;color:var(--ink-l);margin-top:2px}

  /* ── Due card ── */
  .due-card{background:var(--warm);border:1.5px solid var(--mist-d);border-radius:var(--r);padding:14px 16px;display:flex;align-items:center;gap:14px;transition:var(--t)}
  .due-card:hover{border-color:var(--teal);box-shadow:var(--sh)}
  .due-card.urgent{border-color:rgba(192,57,43,.3);background:var(--err-p)}
  .due-card.partial{border-color:rgba(184,134,11,.25);background:var(--warn-p)}
  .due-card.paid{border-color:rgba(15,110,86,.25);background:var(--ok-p);opacity:.75}

  /* ── Progress bar ── */
  .progress-track{height:6px;background:var(--mist-d);border-radius:3px;overflow:hidden;margin-top:5px}
  .progress-fill{height:100%;background:var(--teal);border-radius:3px;transition:width .4s ease}

  /* ── Tabs ── */
  .tabs{display:flex;gap:2px;border-bottom:2px solid var(--mist-d);margin-bottom:20px;overflow-x:auto}
  .tab{padding:9px 16px;font-size:13px;font-weight:500;color:var(--ink-l);cursor:pointer;border:none;background:none;font-family:inherit;border-bottom:2px solid transparent;margin-bottom:-2px;transition:var(--t);white-space:nowrap}
  .tab:hover{color:var(--ink)}
  .tab.active{color:var(--teal-d);border-bottom-color:var(--teal);font-weight:600}

  /* ── Info / Warn boxes ── */
  .info-box{padding:10px 14px;background:var(--teal-p);border:1px solid rgba(29,158,117,.2);border-radius:var(--r-s);font-size:12.5px;color:var(--teal-dd)}
  .warn-box{padding:10px 14px;background:var(--warn-p);border:1px solid rgba(184,134,11,.2);border-radius:var(--r-s);font-size:12.5px;color:var(--warn)}

  /* ────────── RESPONSIVE ────────── */
  @media(max-width:900px){
    :root{--sidebar:240px}
  }
  @media(max-width:768px){
    .auth-wrap{grid-template-columns:1fr}
    .auth-panel{display:none}
    .auth-form-side{padding:32px 24px;min-height:100vh}
    .sidebar{transform:translateX(-100%)}
    .sidebar.open{transform:translateX(0)}
    .sidebar-overlay{display:block}
    .sidebar-overlay.hidden{display:none}
    .main{margin-left:0}
    .topbar{display:flex}
    .page-body{padding:16px}
    .page-hdr{padding:16px;gap:10px}
    .page-title{font-size:22px}
    .frow,.frow3{grid-template-columns:1fr}
    .stat-grid{grid-template-columns:1fr 1fr;gap:10px}
    .stat-value{font-size:22px}
    .page-hdr .btn{font-size:12px;padding:7px 12px}
    .modal{margin:0;max-height:96vh;border-radius:16px 16px 0 0;position:fixed;bottom:0;left:0;right:0;max-width:100%}
    .backdrop{align-items:flex-end;padding:0}
    .card-body{padding:14px 16px}
    .card-hdr{padding:14px 16px 10px}
    .modal-body{padding:16px 18px}
    .modal-hdr{padding:16px 18px 14px}
    .modal-ftr{padding:12px 18px 20px;flex-wrap:wrap}
    .modal-ftr .btn{flex:1;justify-content:center}
    table{min-width:460px}
    .page-body .flex.gap3{flex-direction:column}
    .page-body .card.flex1,.page-body .card[style*="flex: 0"]{min-width:unset!important;flex:unset!important;width:100%}
  }
  @media(max-width:480px){
    .stat-grid{grid-template-columns:1fr}
    .toolbar{gap:8px}
    .toolbar .fs{flex:1}
    .frow3{grid-template-columns:1fr}
    .auth-form-side{padding:24px 16px}
  }
`;

// ── Logo SVG ──
const HaltoLogo = ({ size = 22, light = false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect x="10" y="10" width="28" height="80" rx="4" fill={light ? "#fff" : "#fff"}/>
    <rect x="62" y="10" width="28" height="80" rx="4" fill={light ? "#9FE1CB" : "#9FE1CB"}/>
    <path d="M10 55 L50 30 L90 55" stroke={light ? "#fff" : "#5DCAA5"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

function Spinner() { return <div className="loading"><div className="spinner" /></div>; }

function Modal({ open, onClose, title, children, footer, size = "" }) {
  if (!open) return null;
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
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
      <p style={{ fontSize: 14, color: "var(--ink-m)", lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}

// ── Auth Page ──
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

  const features = [
    { icon: "👥", text: "Manage members with full details" },
    { icon: "🏷", text: "Categories with auto-calculated dues" },
    { icon: "🔔", text: "10-day ahead payment alerts" },
    { icon: "💳", text: "Partial payments & tracking" },
  ];

  return (
    <div className="auth-wrap">
      <div className="auth-panel">
        <div className="auth-panel-grid" />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", width: "100%", maxWidth: 320 }}>
          <div className="auth-logo-mark" style={{ margin: "0 auto 22px" }}>
            <HaltoLogo size={40} light />
          </div>
          <div className="auth-logo-name">Halto<span>.</span></div>
          <div className="auth-tagline">Hostel & Business Management</div>
          <div className="auth-features">
            {features.map(f => (
              <div key={f.text} className="auth-feat">
                <div className="auth-feat-dot">{f.icon}</div>
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,var(--teal),var(--teal-l))", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HaltoLogo size={20} />
            </div>
            <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, color: "var(--ink)" }}>Halto<span style={{ color: "var(--teal)" }}>.</span></span>
          </div>
          <div className="auth-title">{mode === "login" ? "Welcome back" : "Get started"}</div>
          <div className="auth-sub">{mode === "login" ? "Sign in to your account" : "Create your organisation"}</div>
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
            <button className="btn btn-p w100" style={{ marginTop: 4 }} disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}</button>
          </form>
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13.5, color: "var(--ink-l)" }}>
            {mode === "login" ? <>New? <button style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 600, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit" }} onClick={() => setMode("register")}>Create account</button></> : <>Have account? <button style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 600, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit" }} onClick={() => setMode("login")}>Sign in</button></>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──
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
              <span style={{ color: "var(--ink-m)", fontSize: 13.5 }}> have dues coming up this period.</span>
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
          <div className="card flex1" style={{ minWidth: 280 }}>
            <div className="card-hdr"><span className="card-title">Monthly Collection {now.getFullYear()}</span></div>
            <div className="card-body">
              {monthly.filter(m => m.totalDue > 0).length === 0
                ? <div style={{ textAlign: "center", padding: 20, color: "var(--ink-l)", fontSize: 13 }}>No data yet</div>
                : monthly.filter(m => m.totalDue > 0).map(m => (
                  <div key={m.month} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 11.5, color: "var(--ink-l)", width: 28, textAlign: "right", flexShrink: 0 }}>{MONTHS[m.month - 1]}</span>
                    <div style={{ flex: 1, height: 22, background: "var(--mist-d)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${(m.totalPaid / Math.max(m.totalDue, 1)) * 100}%`, background: "var(--teal)", borderRadius: 4, transition: "width .6s ease", opacity: .85 }} />
                    </div>
                    <span style={{ fontSize: 11.5, color: "var(--ink-m)", width: 60, flexShrink: 0, textAlign: "right", fontWeight: 500 }}>{fmt(m.totalPaid)}</span>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="card" style={{ flex: "0 0 360px", minWidth: 280 }}>
            <div className="card-hdr">
              <span className="card-title">Upcoming Dues</span>
              <span className="badge b-warn" style={{ fontSize: 11 }}>{MONTHS[upcoming[0]?.dueMonth - 1] ?? MONTHS[now.getMonth()]} {upcoming[0]?.dueYear ?? now.getFullYear()}</span>
            </div>
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {upcoming.length === 0
                ? <div className="empty" style={{ padding: 28 }}><span className="empty-icon">📋</span><p>No upcoming dues</p></div>
                : upcoming.map(u => (
                  <div key={u.memberId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: "1px solid var(--mist-d)" }}>
                    <div className="avatar" style={{ background: u.status === "Paid" ? "var(--ok)" : u.status === "Partial" ? "var(--warn)" : "var(--teal)" }}>
                      {initials(u.memberName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.memberName}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-l)" }}>
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

        {payModal && (
          <QuickPayModal
            due={payModal}
            onClose={() => setPayModal(null)}
            onSaved={() => { setPayModal(null); load(); toast("Payment recorded!", "success"); }}
          />
        )}
      </div>
    </>
  );
}

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
          <div key={l} style={{ textAlign: "center", padding: "10px 6px", background: "var(--mist)", borderRadius: 8 }}>
            <div style={{ fontSize: 10.5, color: "var(--ink-l)", textTransform: "uppercase", letterSpacing: ".5px" }}>{l}</div>
            <div className="amount" style={{ fontSize: 15 }}>{v}</div>
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

// ── Categories ──
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
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
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
        message={`Delete "${confirm?.name}"? This can't be undone.`}
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
      <div className="info-box mt2">Monthly rent will be used to auto-calculate dues for this category.</div>
      {error && <div className="ferr mt2">⚠ {error}</div>}
    </Modal>
  );
}

// ── Members ──
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
            <span className="search-icon">⌕</span>
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
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 11, flexShrink: 0, background: m.discontinuedAt ? "#6b21a8" : m.isActive ? "var(--teal)" : "var(--ink-l)" }}>{initials(m.fullName)}</div>
                        <div>
                          <div className="fw5" style={{ color: "var(--ink)" }}>{m.fullName}</div>
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
                        {isOwner && m.isActive && !m.discontinuedAt && <button className="btn btn-err btn-sm" onClick={() => setDiscontinueMember(m)}>Stop</button>}
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
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-l)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>Personal Details</div>
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
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-l)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>Category & Accommodation</div>
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
      <div className="flex aic gap3 mb3" style={{ paddingBottom: 16, borderBottom: "1px solid var(--mist-d)" }}>
        <div className="avatar" style={{ width: 52, height: 52, fontSize: 18, flexShrink: 0, background: member.discontinuedAt ? "#6b21a8" : member.isActive ? "var(--teal)" : "var(--ink-l)" }}>
          {initials(member.fullName)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20 }}>{member.fullName}</div>
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
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-m)", marginBottom: 12 }}>Create Login Credentials</div>
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
      <div className="warn-box mb3">⚠ This will mark the member as discontinued. They will no longer appear in active members or have dues generated.</div>
      <div className="fg"><label className="fl">Reason (optional)</label><textarea className="fta" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Moved out, Course completed…" /></div>
      {error && <div className="ferr">⚠ {error}</div>}
    </Modal>
  );
}

// ── Dues ──
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
          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", maxWidth: 480, marginBottom: 18 }}>
            {[["Total Due", fmt(totals.due)], ["Collected", fmt(totals.paid)], ["Pending", fmt(totals.due - totals.paid)]].map(([l, v]) => (
              <div key={l} className="stat-card" style={{ padding: "12px 16px" }}>
                <div className="stat-label">{l}</div>
                <div className="stat-value" style={{ fontSize: 20 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
        <div className="toolbar">
          <select className="fs" style={{ width: 100 }} value={year} onChange={e => setYear(+e.target.value)}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
          <select className="fs" style={{ width: 100 }} value={month} onChange={e => setMonth(+e.target.value)}>
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
                      <td><div className="fw5" style={{ color: "var(--ink)" }}>{d.memberName}</div></td>
                      <td>{d.categoryName ? <span className="badge b-cat" style={{ fontSize: 11 }}>{d.categoryName}</span> : <span className="muted">—</span>}</td>
                      <td className="amount">{fmt(d.amount)}</td>
                      <td className="amount" style={{ color: "var(--ok)" }}>{fmt(d.totalPaid)}</td>
                      <td className="amount" style={{ color: d.balance > 0 ? "var(--err)" : "var(--ink-l)" }}>{fmt(d.balance)}</td>
                      <td style={{ width: 90 }}>
                        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? "var(--ok)" : pct > 0 ? "var(--warn)" : "var(--teal)" }} /></div>
                        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{pct.toFixed(0)}%</div>
                      </td>
                      <td><StatusBadge status={d.status} /></td>
                      <td>{d.status !== "Paid" && <button className="btn btn-p btn-sm" onClick={() => setPayModal(d)}>Pay</button>}</td>
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
          <div style={{ fontSize: 44, marginBottom: 10 }}>✓</div>
          <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 21, marginBottom: 8 }}>Dues Generated</div>
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
    <Modal open onClose={onClose} title="Record Payment"
      footer={<><button className="btn btn-g" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={submit} disabled={loading}>Save Payment</button></>}>
      <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, marginBottom: 14 }}>{due.memberName}</div>
      <div className="frow3 mb3">
        {[["Total Due", fmt(due.amount)], ["Already Paid", fmt(due.totalPaid)], ["Balance", fmt(due.balance)]].map(([l, v]) => (
          <div key={l} style={{ textAlign: "center", padding: "10px 6px", background: "var(--mist)", borderRadius: 8 }}>
            <div style={{ fontSize: 10.5, color: "var(--ink-l)", textTransform: "uppercase", letterSpacing: ".5px" }}>{l}</div>
            <div className="amount" style={{ fontSize: 15 }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="mb3">
        <div style={{ fontSize: 12, color: "var(--ink-l)", marginBottom: 4 }}>Payment progress after this entry</div>
        <div className="progress-track" style={{ height: 8 }}>
          <div className="progress-fill" style={{ width: `${newPct}%`, background: newPct >= 100 ? "var(--ok)" : newPct > 0 ? "var(--warn)" : "var(--teal)" }} />
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
          <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-l)", marginBottom: 8 }}>PAYMENT HISTORY</div>
          {due.payments.map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--mist-d)", fontSize: 13 }}>
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

// ── Payments History ──
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
                    <td className="fw5" style={{ color: "var(--ink)" }}>{p.memberName}</td>
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

// ── Staff ──
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
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 11, background: "var(--ink-m)" }}>{initials(s.fullName)}</div>
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
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Staff Member" footer={null}>
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

// ── Super Admin ──
function SuperAdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, o] = await Promise.all([
        api("/api/super/summary").catch(() => null),
        api("/api/super/organizations").catch(() => []),
      ]);
      setSummary(s); setOrgs(Array.isArray(o) ? o : []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(org) {
    try {
      await api(`/api/super/organizations/${org.id}/status`, { method: "PATCH", body: JSON.stringify({ isActive: !org.isActive }) });
      toast(`${org.name} ${!org.isActive ? "activated" : "deactivated"}`, "success"); load();
    } catch (e) { toast(e.message, "error"); }
    setConfirm(null);
  }

  return (
    <>
      <div className="page-hdr">
        <div><h1 className="page-title">Organisations</h1><p className="page-sub">Platform overview</p></div>
        <button className="btn btn-p" onClick={() => setShowAdd(true)}>＋ New Organisation</button>
      </div>
      <div className="page-body">
        {summary && (
          <div className="stat-grid">
            {[
              { label: "Total Orgs", value: summary.totalOrganizations ?? "—", sub: "registered", icon: "🏢" },
              { label: "Active Orgs", value: summary.activeOrganizations ?? "—", sub: "running", icon: "●" },
              { label: "Total Members", value: summary.totalMembers ?? "—", sub: "across all orgs", icon: "◉" },
              { label: "Total Users", value: summary.totalUsers ?? "—", sub: "all roles", icon: "👥" },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        )}
        <div className="card">
          {loading ? <Spinner /> : orgs.length === 0
            ? <div className="empty"><span className="empty-icon">🏢</span><div className="empty-title">No organisations yet</div></div>
            : <div className="tbl-wrap"><table>
              <thead><tr><th>Organisation</th><th>Owner</th><th>Type</th><th>Members</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {orgs.map(o => (
                  <tr key={o.id}>
                    <td><div className="fw5" style={{ color: "var(--ink)" }}>{o.name}</div></td>
                    <td className="muted">{o.ownerName || "—"}</td>
                    <td><span className="badge b-cat">{o.businessType === 1 ? "Hostel" : o.businessType === 2 ? "Tuition" : o.businessType === 3 ? "Gym" : "Other"}</span></td>
                    <td className="muted">{o.memberCount ?? 0}</td>
                    <td><StatusBadge status={o.isActive ? "Active" : "Inactive"} /></td>
                    <td>
                      <button className={`btn btn-sm ${o.isActive ? "btn-err" : "btn-ok"}`} onClick={() => setConfirm(o)}>
                        {o.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
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
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-l)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>Organisation</div>
      <div className="frow">
        <div className="fg"><label className="fl">Organisation Name *</label><input className="fi" value={form.organizationName} onChange={set("organizationName")} placeholder="Green Valley Hostel" /></div>
        <div className="fg"><label className="fl">Business Type</label>
          <select className="fs" value={form.businessType} onChange={set("businessType")}>
            <option value="1">Hostel</option><option value="2">Tuition</option><option value="3">Gym</option><option value="4">Other</option>
          </select>
        </div>
      </div>
      <div className="divider" />
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-l)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12 }}>Owner Account</div>
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

// ── Nav Config ──
const NAV = [
  { id: "dashboard", icon: "⊞", label: "Dashboard", roles: ["OrganizationOwner", "OrganizationStaff"] },
  { id: "categories", icon: "🏷", label: "Categories", roles: ["OrganizationOwner", "OrganizationStaff"] },
  { id: "members", icon: "◉", label: "Members", roles: ["OrganizationOwner", "OrganizationStaff"] },
  { id: "dues", icon: "◌", label: "Dues", roles: ["OrganizationOwner", "OrganizationStaff"] },
  { id: "payments", icon: "●", label: "Payments", roles: ["OrganizationOwner", "OrganizationStaff"] },
  { id: "staff", icon: "⬡", label: "Staff", roles: ["OrganizationOwner"] },
  { id: "superadmin", icon: "★", label: "Organisations", roles: ["SuperAdmin"] },
];

// ── App Shell ──
function AppShell({ user, onLogout }) {
  const isSuperAdmin = user?.role === "SuperAdmin";
  const [page, setPage] = useState(isSuperAdmin ? "superadmin" : "dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = NAV.filter(n => n.roles.includes(user?.role));

  function navigate(id) {
    setPage(id);
    setSidebarOpen(false);
  }

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
      {/* Sidebar overlay for mobile */}
      <div className={`sidebar-overlay ${sidebarOpen ? "" : "hidden"}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sb-logo">
          <div className="sb-logo-mark"><HaltoLogo size={22} /></div>
          <div>
            <div className="sb-logo-text">Halto<span>.</span></div>
            <div className="sb-org">{isSuperAdmin ? "Super Admin" : (user?.organizationName || "Organisation")}</div>
          </div>
        </div>
        <div className="sb-nav">
          <div className="sb-sec">Navigation</div>
          {nav.map(n => (
            <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => navigate(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
        <div className="sb-footer">
          <div className="user-pill">
            <div className="avatar" style={{ background: isSuperAdmin ? "var(--warn)" : "var(--teal)" }}>{initials(user?.fullName)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="u-name">{user?.fullName}</div>
              <div className="u-role">{isSuperAdmin ? "Super Admin" : user?.role === "OrganizationOwner" ? "Owner" : "Staff"}</div>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Sign out">⏻</button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="main">
        {/* Mobile top bar */}
        <div className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="topbar-logo">Halto<span>.</span></div>
          <div className="avatar" style={{ background: isSuperAdmin ? "var(--warn)" : "var(--teal)", cursor: "default" }}>{initials(user?.fullName)}</div>
        </div>
        {renderPage()}
      </main>
    </div>
  );
}

// ── Root ──
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
