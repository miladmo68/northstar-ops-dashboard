"use client";

import { FormEvent, useMemo, useState } from "react";
import fleet from "../data/fleet.json";

type Vehicle = (typeof fleet.vehicles)[number];

const Icon = ({ name }: { name: string }) => {
  const paths: Record<string, React.ReactNode> = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    fleet: <><path d="M3 12h18M5 12l2-5h10l2 5v6H5z"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></>,
    routes: <><circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18h3a4 4 0 0 0 4-4v-4a4 4 0 0 1 4-4"/></>,
    reports: <><path d="M5 20V10M12 20V4M19 20v-7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
  };
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

function MetricCard({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return (
    <article className="metric-card">
      <div className={`metric-orb ${tone}`}><span /></div>
      <div><p>{label}</p><strong>{value}</strong><span className="metric-note">{note}</span></div>
    </article>
  );
}

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [activeNav, setActiveNav] = useState("Overview");
  const [vehicles, setVehicles] = useState<Vehicle[]>(fleet.vehicles);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");

  const visibleVehicles = useMemo(() => vehicles.filter((vehicle) =>
    `${vehicle.id} ${vehicle.driver} ${vehicle.route} ${vehicle.status}`.toLowerCase().includes(query.toLowerCase())
  ), [query, vehicles]);

  function addVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const vehicle: Vehicle = {
      id: String(data.get("id")),
      driver: String(data.get("driver")),
      route: String(data.get("route")),
      eta: "—",
      health: 100,
      status: "Ready",
    };
    const next = [vehicle, ...vehicles];
    setVehicles(next);
    sessionStorage.setItem("northstar-vehicles", JSON.stringify(next));
    setModalOpen(false);
    setToast(`${vehicle.id} added to the active fleet`);
    setTimeout(() => setToast(""), 2600);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">N</span><div><strong>Northstar</strong><small>Fleet intelligence</small></div></div>
        <nav>
          {[["Overview", "overview"], ["Fleet", "fleet"], ["Routes", "routes"], ["Reports", "reports"]].map(([label, icon]) => (
            <button key={label} className={activeNav === label ? "active" : ""} onClick={() => setActiveNav(label)}><Icon name={icon}/>{label}</button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="service-card"><span className="pulse"/><strong>All systems operational</strong><small>Updated moments ago</small></div>
        <button className="settings"><Icon name="settings"/>Settings</button>
        <div className="profile"><span>MM</span><div><strong>Milad Mohammadi</strong><small>Operations lead</small></div></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <label className="search"><Icon name="search"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search vehicles, routes, drivers…"/><kbd>⌘ K</kbd></label>
          <div className="top-actions"><button className="icon-button" aria-label="Notifications"><Icon name="bell"/><span /></button><button className="primary" onClick={() => setModalOpen(true)}><Icon name="plus"/>Add vehicle</button></div>
        </header>

        <div className="content">
          <section className="page-heading"><div><p className="eyebrow">CONTROL CENTER</p><h1>Good morning, Milad.</h1><p>Here&apos;s what is happening across your network today.</p></div><div className="date-chip"><span>LIVE</span> Sunday, Nov 2</div></section>

          <section className="metric-grid">
            <MetricCard label="Active vehicles" value="248" note="+12 this month" tone="blue" />
            <MetricCard label="On-time delivery" value="96.4%" note="+2.1% vs last week" tone="green" />
            <MetricCard label="Fleet utilization" value="82.7%" note="Within target range" tone="violet" />
            <MetricCard label="Open alerts" value="12" note="3 require attention" tone="orange" />
          </section>

          <section className="dashboard-grid">
            <article className="panel utilization-panel">
              <div className="panel-heading"><div><h2>Fleet utilization</h2><p>Vehicle utilization across the last seven days</p></div><select aria-label="Utilization period"><option>Last 7 days</option><option>Last 30 days</option></select></div>
              <div className="chart-wrap"><div className="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="bar-chart">{fleet.utilization.map((item) => <div className="bar-column" key={item.day}><div className="bar-value">{item.value}%</div><div className="bar-track"><div style={{height: `${item.value}%`}} /></div><span>{item.day}</span></div>)}</div></div>
              <div className="chart-footer"><span><i/>Target range: 78–88%</span><strong>82.7% <small>weekly average</small></strong></div>
            </article>

            <article className="panel alerts-panel">
              <div className="panel-heading"><div><h2>Live alerts</h2><p>Items that may need your attention</p></div><button>View all <Icon name="arrow"/></button></div>
              <div className="alert-list">{fleet.alerts.map((alert) => <div className="alert-item" key={alert.title}><span className={`severity ${alert.severity.toLowerCase()}`}>{alert.severity[0]}</span><div><strong>{alert.title}</strong><p>{alert.detail}</p><small>{alert.time}</small></div></div>)}</div>
            </article>
          </section>

          <section className="panel fleet-panel">
            <div className="panel-heading"><div><h2>Active fleet</h2><p>Live movement and vehicle health</p></div><div className="legend"><span><i className="healthy"/>Healthy</span><span><i className="watch"/>Needs attention</span></div></div>
            <div className="table-wrap"><table><thead><tr><th>Vehicle</th><th>Driver</th><th>Active route</th><th>ETA</th><th>Health</th><th>Status</th></tr></thead><tbody>{visibleVehicles.map((vehicle) => <tr key={vehicle.id}><td><span className="vehicle-id">{vehicle.id}</span></td><td><div className="driver"><span>{vehicle.driver.split(" ").map((part) => part[0]).join("")}</span>{vehicle.driver}</div></td><td>{vehicle.route}</td><td>{vehicle.eta}</td><td><div className="health"><div><span style={{width: `${vehicle.health}%`}}/></div>{vehicle.health}%</div></td><td><span className={`status ${vehicle.status.toLowerCase().replace(" ", "-")}`}>{vehicle.status}</span></td></tr>)}</tbody></table>{visibleVehicles.length === 0 && <div className="empty-state">No fleet records match “{query}”.</div>}</div>
          </section>
        </div>
      </section>

      {modalOpen && <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}><form className="modal" onSubmit={addVehicle} onMouseDown={(e) => e.stopPropagation()}><div><p className="eyebrow">NEW ASSET</p><h2>Add vehicle</h2><button type="button" onClick={() => setModalOpen(false)}>×</button></div><label>Vehicle ID<input name="id" required placeholder="NS-2500" /></label><label>Driver<input name="driver" required placeholder="Driver name" /></label><label>Route<input name="route" required placeholder="Toronto → Ottawa" /></label><button className="primary" type="submit">Add to fleet <Icon name="arrow"/></button></form></div>}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}
