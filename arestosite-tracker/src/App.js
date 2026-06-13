import { useState, useEffect } from "react";

const STATUSES = [
  { key: "to_call", label: "To Call", color: "#6366f1" },
  { key: "called", label: "Called", color: "#f59e0b" },
  { key: "interested", label: "Interested", color: "#3b82f6" },
  { key: "demo_sent", label: "Demo Sent", color: "#8b5cf6" },
  { key: "closed", label: "Closed ✓", color: "#10b981" },
  { key: "rejected", label: "Rejected", color: "#ef4444" },
];

const NICHES = ["Restaurant", "Hair Salon", "Dental", "Hotel", "Law Office", "Beauty Clinic", "Maritime", "Other"];
const CALL_DAYS = ["Monday", "Wednesday"];

const EMPTY_LEAD = {
  id: null,
  business: "",
  contact: "",
  phone: "",
  niche: "Restaurant",
  status: "to_call",
  price: "",
  notes: "",
  callDay: "Monday",
  followUp: "",
  addedDate: "",
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function StatusBadge({ status }) {
  const s = STATUSES.find((x) => x.key === status);
  return (
    <span style={{
      background: s.color + "22", color: s.color,
      border: `1px solid ${s.color}55`, borderRadius: 6,
      padding: "2px 10px", fontSize: 12, fontWeight: 600,
      letterSpacing: 0.3, whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: "#111318", border: "1px solid #1e2028",
      borderRadius: 12, padding: "16px 18px", flex: 1, minWidth: 100,
    }}>
      <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent || "#fff", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

export default function App() {
  const [leads, setLeads] = useState(() => {
    try { return JSON.parse(localStorage.getItem("arestoLeads") || "[]"); }
    catch { return []; }
  });

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_LEAD });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDay, setFilterDay] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [view, setView] = useState("list"); // list | board

  useEffect(() => {
    try { localStorage.setItem("arestoLeads", JSON.stringify(leads)); }
    catch {}
  }, [leads]);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_LEAD, addedDate: new Date().toISOString().slice(0, 10) });
    setModal(true);
  };

  const openEdit = (lead) => {
    setEditing(lead.id);
    setForm({ ...lead });
    setModal(true);
  };

  const saveForm = () => {
    if (!form.business.trim()) return;
    if (editing) {
      setLeads((prev) => prev.map((l) => (l.id === editing ? { ...form, id: editing } : l)));
    } else {
      setLeads((prev) => [...prev, { ...form, id: generateId() }]);
    }
    setModal(false);
  };

  const deleteLead = (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setDeleteConfirm(null);
  };

  const quickStatus = (id, status) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const filtered = leads.filter((l) => {
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (filterDay !== "all" && l.callDay !== filterDay) return false;
    if (search && !l.business.toLowerCase().includes(search.toLowerCase()) &&
        !l.contact.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const closed = leads.filter((l) => l.status === "closed");
  const totalRevenue = closed.reduce((s, l) => s + (parseFloat(l.price) || 0), 0);
  const interested = leads.filter((l) => l.status === "interested" || l.status === "demo_sent").length;
  const closeRate = leads.length > 0 ? Math.round((closed.length / leads.length) * 100) : 0;
  const thisMonth = leads.filter((l) => l.addedDate?.slice(0, 7) === new Date().toISOString().slice(0, 7)).length;

  const inputStyle = {
    width: "100%", background: "#0c0d10", border: "1px solid #1e2028",
    borderRadius: 8, color: "#e2e4ea", padding: "9px 12px",
    fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block", fontSize: 11, color: "#555",
    marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5,
  };

  return (
    <div style={{ minHeight: "100vh", minHeight: "100dvh", background: "#0c0d10", color: "#e2e4ea", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1c22", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#0c0d10", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, fontWeight: 800, color: "#fff",
          }}>A</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.1 }}>ArestoSite</div>
            <div style={{ fontSize: 11, color: "#555" }}>Lead Tracker</div>
          </div>
        </div>
        <button onClick={openAdd} style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none", borderRadius: 9, color: "#fff",
          padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}>+ Add Lead</button>
      </div>

      <div style={{ padding: "20px 16px", maxWidth: 900, margin: "0 auto" }}>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <StatCard label="Revenue" value={`€${totalRevenue.toLocaleString()}`} accent="#10b981" />
          <StatCard label="Closed" value={closed.length} accent="#10b981" />
          <StatCard label="Hot" value={interested} accent="#3b82f6" />
          <StatCard label="Close %" value={`${closeRate}%`} accent="#f59e0b" />
          <StatCard label="This Month" value={thisMonth} accent="#8b5cf6" />
        </div>

        {/* Goal bar */}
        <div style={{ background: "#111318", border: "1px solid #1e2028", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Monthly Goal</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: totalRevenue >= 3000 ? "#10b981" : "#e2e4ea" }}>
              €{totalRevenue.toLocaleString()} / €3,000
            </span>
          </div>
          <div style={{ background: "#1e2028", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{
              width: `${Math.min((totalRevenue / 3000) * 100, 100)}%`,
              height: "100%",
              background: totalRevenue >= 3000 ? "#10b981" : "linear-gradient(90deg, #6366f1, #8b5cf6)",
              borderRadius: 99,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, flex: "1 1 140px", minWidth: 120, padding: "8px 12px" }}
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ ...inputStyle, width: "auto", padding: "8px 10px", cursor: "pointer" }}>
            <option value="all">All Status</option>
            {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <select value={filterDay} onChange={e => setFilterDay(e.target.value)}
            style={{ ...inputStyle, width: "auto", padding: "8px 10px", cursor: "pointer" }}>
            <option value="all">All Days</option>
            <option value="Monday">Monday</option>
            <option value="Wednesday">Wednesday</option>
          </select>
        </div>

        {/* Call Day Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["all", "Monday", "Wednesday"].map(d => (
            <button key={d} onClick={() => setFilterDay(d)} style={{
              background: filterDay === d ? (d === "Monday" ? "#6366f1" : d === "Wednesday" ? "#8b5cf6" : "#1e2028") : "#111318",
              border: `1px solid ${filterDay === d ? "transparent" : "#1e2028"}`,
              borderRadius: 8, color: filterDay === d ? "#fff" : "#666",
              padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              {d === "all" ? "All Days" : d}
              {d !== "all" && (
                <span style={{ marginLeft: 6, background: filterDay === d ? "#ffffff33" : "#1e2028", borderRadius: 99, padding: "1px 6px", fontSize: 11 }}>
                  {leads.filter(l => l.callDay === d).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Leads List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ background: "#111318", border: "1px solid #1a1c22", borderRadius: 12, textAlign: "center", padding: "50px 20px", color: "#444" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              <div style={{ fontWeight: 600, color: "#666", marginBottom: 4 }}>No leads here</div>
              <div style={{ fontSize: 13 }}>Tap + Add Lead to get started</div>
            </div>
          ) : (
            filtered.map(lead => (
              <div key={lead.id} style={{
                background: lead.status === "closed" ? "#10b98108" : lead.status === "interested" || lead.status === "demo_sent" ? "#3b82f608" : "#111318",
                border: `1px solid ${lead.status === "closed" ? "#10b98133" : lead.status === "interested" || lead.status === "demo_sent" ? "#3b82f633" : "#1a1c22"}`,
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{lead.business}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                      {lead.contact && <span>{lead.contact}</span>}
                      {lead.contact && lead.phone && <span style={{ margin: "0 6px", color: "#333" }}>·</span>}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} style={{ color: "#6366f1", textDecoration: "none" }}>{lead.phone}</a>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {lead.price && <span style={{ color: "#10b981", fontWeight: 700, fontSize: 14 }}>€{lead.price}</span>}
                    <button onClick={() => openEdit(lead)} style={{
                      background: "#1e2028", border: "none", borderRadius: 6,
                      color: "#888", padding: "5px 10px", fontSize: 12, cursor: "pointer"
                    }}>Edit</button>
                    <button onClick={() => setDeleteConfirm(lead.id)} style={{
                      background: "#1e1215", border: "none", borderRadius: 6,
                      color: "#ef4444", padding: "5px 8px", fontSize: 12, cursor: "pointer"
                    }}>✕</button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <StatusBadge status={lead.status} />
                  <span style={{ background: "#1e2028", borderRadius: 5, padding: "2px 8px", fontSize: 11, color: "#666" }}>{lead.niche}</span>
                  <span style={{ fontSize: 11, color: lead.callDay === "Monday" ? "#6366f1" : "#8b5cf6", fontWeight: 600 }}>{lead.callDay}</span>
                  {lead.followUp && <span style={{ fontSize: 11, color: "#555" }}>📅 {lead.followUp}</span>}
                </div>

                {lead.notes && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#555", fontStyle: "italic", borderTop: "1px solid #1a1c22", paddingTop: 8 }}>
                    {lead.notes}
                  </div>
                )}

                {/* Quick status change */}
                <div style={{ marginTop: 10, display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {STATUSES.filter(s => s.key !== lead.status).slice(0, 4).map(s => (
                    <button key={s.key} onClick={() => quickStatus(lead.id, s.key)} style={{
                      background: "none", border: `1px solid ${s.color}44`,
                      borderRadius: 6, color: s.color, padding: "3px 9px",
                      fontSize: 11, cursor: "pointer", fontWeight: 500,
                    }}>→ {s.label}</button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {leads.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, color: "#333", textAlign: "center" }}>
            {filtered.length} of {leads.length} leads
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000dd",
          display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100,
        }} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={{
            background: "#111318", borderRadius: "16px 16px 0 0",
            padding: "24px 20px", width: "100%", maxWidth: 500,
            maxHeight: "90vh", overflowY: "auto",
            border: "1px solid #1e2028", borderBottom: "none",
          }}>
            <div style={{ width: 36, height: 4, background: "#2a2c35", borderRadius: 99, margin: "0 auto 20px" }} />
            <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 20 }}>
              {editing ? "Edit Lead" : "New Lead"}
            </div>

            {[
              { label: "Business Name *", key: "business", type: "text", placeholder: "e.g. Εστιατόριο Αθηνά" },
              { label: "Contact Person", key: "contact", type: "text", placeholder: "Owner's name" },
              { label: "Phone", key: "phone", type: "tel", placeholder: "+357 99 123456" },
              { label: "Price (€)", key: "price", type: "number", placeholder: "500" },
              { label: "Follow-up Date", key: "followUp", type: "date", placeholder: "" },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={labelStyle}>{field.label}</label>
                <input type={field.type} value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder} style={inputStyle} />
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Niche</label>
                <select value={form.niche} onChange={e => setForm(f => ({ ...f, niche: e.target.value }))} style={inputStyle}>
                  {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Call Day</label>
                <select value={form.callDay} onChange={e => setForm(f => ({ ...f, callDay: e.target.value }))} style={inputStyle}>
                  {CALL_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
                {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Objections, callbacks, anything relevant…"
                rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setModal(false)} style={{
                flex: 1, background: "#1e2028", border: "none", borderRadius: 10,
                color: "#888", padding: "13px", fontWeight: 600, fontSize: 14, cursor: "pointer"
              }}>Cancel</button>
              <button onClick={saveForm} disabled={!form.business.trim()} style={{
                flex: 2,
                background: form.business.trim() ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#1e2028",
                border: "none", borderRadius: 10,
                color: form.business.trim() ? "#fff" : "#555",
                padding: "13px", fontWeight: 700, fontSize: 14,
                cursor: form.business.trim() ? "pointer" : "default"
              }}>
                {editing ? "Save Changes" : "Add Lead"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000dd",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20
        }}>
          <div style={{
            background: "#111318", border: "1px solid #ef444433", borderRadius: 14,
            padding: 26, maxWidth: 300, width: "100%", textAlign: "center"
          }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 6 }}>Delete this lead?</div>
            <div style={{ fontSize: 13, color: "#555", marginBottom: 20 }}>This can't be undone.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, background: "#1e2028", border: "none", borderRadius: 8,
                color: "#888", padding: "11px", fontWeight: 600, cursor: "pointer"
              }}>Cancel</button>
              <button onClick={() => deleteLead(deleteConfirm)} style={{
                flex: 1, background: "#ef4444", border: "none", borderRadius: 8,
                color: "#fff", padding: "11px", fontWeight: 700, cursor: "pointer"
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
