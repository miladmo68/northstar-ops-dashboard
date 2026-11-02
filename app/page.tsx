"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import fleet from "../data/fleet.json";

type Vehicle = (typeof fleet.vehicles)[number];
type View = "Overview" | "Fleet" | "Routes" | "Reports" | "Settings";

const routes = [
  { id: "RT-401A", from: "Toronto", to: "Hamilton", vehicles: 18, distance: 69, progress: 72, status: "On schedule", color: "green" },
  { id: "RT-417C", from: "Ottawa", to: "Kingston", vehicles: 12, distance: 196, progress: 48, status: "On schedule", color: "blue" },
  { id: "RT-8W", from: "London", to: "Waterloo", vehicles: 9, distance: 113, progress: 61, status: "Congestion", color: "orange" },
  { id: "RT-400S", from: "Barrie", to: "Toronto", vehicles: 14, distance: 94, progress: 84, status: "On schedule", color: "violet" },
];

const reportRows = [
  { period: "Oct 27 – Nov 2", deliveries: 1842, onTime: 96.4, utilization: 82.7, incidents: 3 },
  { period: "Oct 20 – Oct 26", deliveries: 1769, onTime: 94.3, utilization: 80.1, incidents: 5 },
  { period: "Oct 13 – Oct 19", deliveries: 1811, onTime: 95.1, utilization: 81.6, incidents: 4 },
  { period: "Oct 6 – Oct 12", deliveries: 1698, onTime: 93.8, utilization: 78.9, incidents: 6 },
];

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
    download: <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
    filter: <><path d="M4 5h16M7 12h10M10 19h4"/></>,
  };
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

function MetricCard({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return <article className="metric-card"><div className={`metric-orb ${tone}`}><span /></div><div><p>{label}</p><strong>{value}</strong><span className="metric-note">{note}</span></div></article>;
}

function FleetTable({ vehicles }: { vehicles: Vehicle[] }) {
  return <div className="table-wrap"><table><thead><tr><th>Vehicle</th><th>Driver</th><th>Active route</th><th>ETA</th><th>Health</th><th>Status</th></tr></thead><tbody>{vehicles.map((vehicle) => <tr key={vehicle.id}><td><span className="vehicle-id">{vehicle.id}</span></td><td><div className="driver"><span>{vehicle.driver.split(" ").map((part) => part[0]).join("")}</span>{vehicle.driver}</div></td><td>{vehicle.route}</td><td>{vehicle.eta}</td><td><div className="health"><div><span style={{width: `${vehicle.health}%`}}/></div>{vehicle.health}%</div></td><td><span className={`status ${vehicle.status.toLowerCase().replaceAll(" ", "-")}`}>{vehicle.status}</span></td></tr>)}</tbody></table>{vehicles.length === 0 && <div className="empty-state">No records match the current search and filters.</div>}</div>;
}

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [activeNav, setActiveNav] = useState<View>("Overview");
  const [vehicles, setVehicles] = useState<Vehicle[]>(fleet.vehicles);
  const [modalOpen, setModalOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [fleetFilter, setFleetFilter] = useState("All");
  const [period, setPeriod] = useState("7");
  const [settings, setSettings] = useState({ emailAlerts: true, delayAlerts: true, maintenanceAlerts: false, compactRows: false, threshold: "85" });

  useEffect(() => {
    const savedVehicles = sessionStorage.getItem("northstar-vehicles");
    const savedSettings = sessionStorage.getItem("northstar-settings");
    if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    const syncView = () => {
      const requested = window.location.hash.slice(1).toLowerCase();
      const match = (["Overview", "Fleet", "Routes", "Reports", "Settings"] as View[]).find((view) => view.toLowerCase() === requested);
      if (match) setActiveNav(match);
    };
    syncView();
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, []);

  const visibleVehicles = useMemo(() => vehicles.filter((vehicle) => {
    const matchesQuery = `${vehicle.id} ${vehicle.driver} ${vehicle.route} ${vehicle.status}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = fleetFilter === "All" || vehicle.status === fleetFilter;
    return matchesQuery && matchesFilter;
  }), [query, vehicles, fleetFilter]);

  const chartData = period === "7" ? fleet.utilization : [
    { day: "W1", value: 74 }, { day: "W2", value: 79 }, { day: "W3", value: 85 }, { day: "W4", value: 83 }
  ];

  function navigate(view: View) {
    setActiveNav(view); setQuery(""); setAlertsOpen(false);
    window.location.hash = view.toLowerCase();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2600); }
  function addVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const vehicle: Vehicle = { id: String(data.get("id")), driver: String(data.get("driver")), route: String(data.get("route")), eta: "—", health: 100, status: "Ready" };
    const next = [vehicle, ...vehicles]; setVehicles(next); sessionStorage.setItem("northstar-vehicles", JSON.stringify(next)); setModalOpen(false); notify(`${vehicle.id} added to the active fleet`);
  }
  function saveSettings() { sessionStorage.setItem("northstar-settings", JSON.stringify(settings)); notify("Preferences saved for this session"); }
  function exportReport() {
    const header = "Period,Deliveries,On-time rate,Fleet utilization,Incidents\n";
    const rows = reportRows.map((row) => `${row.period},${row.deliveries},${row.onTime}%,${row.utilization}%,${row.incidents}`).join("\n");
    const url = URL.createObjectURL(new Blob([header + rows], { type: "text/csv" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "northstar-performance-report.csv"; anchor.click(); URL.revokeObjectURL(url); notify("Performance report downloaded");
  }

  const heading: Record<View, [string, string, string]> = {
    Overview: ["CONTROL CENTER", "Good morning, Milad.", "Here’s what is happening across your network today."],
    Fleet: ["FLEET OPERATIONS", "Fleet command.", "Search, filter, and manage every vehicle in the active network."],
    Routes: ["ROUTE NETWORK", "Routes and movement.", "Monitor corridor progress, congestion, and active allocation."],
    Reports: ["PERFORMANCE", "Operational reports.", "Compare service quality, utilization, and delivery volume over time."],
    Settings: ["PREFERENCES", "Workspace settings.", "Tune notifications, thresholds, and dashboard behavior."],
  };

  return <main className={`app-shell ${settings.compactRows ? "compact" : ""}`}>
    <aside className="sidebar"><div className="brand"><span className="brand-mark">N</span><div><strong>Northstar</strong><small>Fleet intelligence</small></div></div><nav>{(["Overview", "Fleet", "Routes", "Reports"] as View[]).map((label) => <button key={label} className={activeNav === label ? "active" : ""} onClick={() => navigate(label)}><Icon name={label.toLowerCase()}/>{label}</button>)}</nav><div className="sidebar-spacer"/><div className="service-card"><span className="pulse"/><strong>All systems operational</strong><small>Updated moments ago</small></div><button className={`settings ${activeNav === "Settings" ? "active" : ""}`} onClick={() => navigate("Settings")}><Icon name="settings"/>Settings</button><div className="profile"><span>MM</span><div><strong>Milad Mohammadi</strong><small>Operations lead</small></div></div></aside>

    <section className="workspace"><header className="topbar"><label className="search"><Icon name="search"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={activeNav === "Routes" ? "Search routes or regions…" : "Search vehicles, routes, drivers…"}/><kbd>⌘ K</kbd></label><div className="top-actions"><button className="icon-button" aria-label="Notifications" onClick={() => setAlertsOpen(!alertsOpen)}><Icon name="bell"/><span/></button><button className="primary" onClick={() => setModalOpen(true)}><Icon name="plus"/>Add vehicle</button></div>{alertsOpen && <div className="notification-popover"><div><strong>Notifications</strong><button onClick={() => setAlertsOpen(false)}>×</button></div>{fleet.alerts.map((alert) => <button key={alert.title} onClick={() => navigate("Fleet")}><span className={`severity ${alert.severity.toLowerCase()}`}>{alert.severity[0]}</span><div><strong>{alert.title}</strong><small>{alert.time}</small></div></button>)}</div>}</header>

      <div className="content"><section className="page-heading"><div><p className="eyebrow">{heading[activeNav][0]}</p><h1>{heading[activeNav][1]}</h1><p>{heading[activeNav][2]}</p></div><div className="date-chip"><span>LIVE</span> Sunday, Nov 2</div></section>

        {activeNav === "Overview" && <><section className="metric-grid"><MetricCard label="Active vehicles" value="248" note="+12 this month" tone="blue"/><MetricCard label="On-time delivery" value="96.4%" note="+2.1% vs last week" tone="green"/><MetricCard label="Fleet utilization" value="82.7%" note="Within target range" tone="violet"/><MetricCard label="Open alerts" value="12" note="3 require attention" tone="orange"/></section><section className="dashboard-grid"><article className="panel utilization-panel"><div className="panel-heading"><div><h2>Fleet utilization</h2><p>Vehicle utilization across the selected period</p></div><select aria-label="Utilization period" value={period} onChange={(e) => setPeriod(e.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select></div><div className="chart-wrap"><div className="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="bar-chart">{chartData.map((item) => <div className="bar-column" key={item.day}><div className="bar-value">{item.value}%</div><div className="bar-track"><div style={{height: `${item.value}%`}}/></div><span>{item.day}</span></div>)}</div></div><div className="chart-footer"><span><i/>Target range: 78–88%</span><strong>82.7% <small>period average</small></strong></div></article><article className="panel alerts-panel"><div className="panel-heading"><div><h2>Live alerts</h2><p>Items that may need your attention</p></div><button onClick={() => navigate("Fleet")}>View all <Icon name="arrow"/></button></div><div className="alert-list">{fleet.alerts.map((alert) => <div className="alert-item" key={alert.title}><span className={`severity ${alert.severity.toLowerCase()}`}>{alert.severity[0]}</span><div><strong>{alert.title}</strong><p>{alert.detail}</p><small>{alert.time}</small></div></div>)}</div></article></section><section className="panel fleet-panel"><div className="panel-heading"><div><h2>Active fleet</h2><p>Live movement and vehicle health</p></div><button className="text-action" onClick={() => navigate("Fleet")}>Open fleet <Icon name="arrow"/></button></div><FleetTable vehicles={visibleVehicles}/></section></>}

        {activeNav === "Fleet" && <><section className="metric-grid fleet-metrics"><MetricCard label="In transit" value={String(vehicles.filter((v) => v.status === "In transit").length)} note="Currently moving" tone="blue"/><MetricCard label="Average health" value="91.6%" note="Across visible assets" tone="green"/><MetricCard label="Delayed" value={String(vehicles.filter((v) => v.status === "Delayed").length)} note="Requires review" tone="orange"/><MetricCard label="Ready" value={String(vehicles.filter((v) => v.status === "Ready").length)} note="Available for dispatch" tone="violet"/></section><section className="panel fleet-panel"><div className="panel-heading fleet-toolbar"><div><h2>Vehicle registry</h2><p>{visibleVehicles.length} records in the current view</p></div><div className="filter-group"><Icon name="filter"/>{["All", "In transit", "Delayed", "Arriving", "Ready"].map((filter) => <button key={filter} className={fleetFilter === filter ? "selected" : ""} onClick={() => setFleetFilter(filter)}>{filter}</button>)}</div></div><FleetTable vehicles={visibleVehicles}/></section></>}

        {activeNav === "Routes" && <><section className="route-layout"><article className="panel network-map"><div className="panel-heading"><div><h2>Regional network</h2><p>Live corridor allocation across Ontario</p></div><span className="map-live">● LIVE</span></div><div className="map-canvas"><div className="map-line line-a"/><div className="map-line line-b"/><div className="map-line line-c"/>{[["Toronto",47,66],["Hamilton",24,79],["London",12,49],["Waterloo",31,43],["Barrie",53,29],["Ottawa",84,19],["Kingston",75,47]].map(([name,x,y]) => <button key={name} className="map-node" style={{left: `${x}%`, top: `${y}%`}} onClick={() => {setQuery(String(name)); notify(`${name} corridor selected`);}}><span/><strong>{name}</strong></button>)}</div></article><article className="panel route-summary"><div className="panel-heading"><div><h2>Network status</h2><p>Current route distribution</p></div></div>{fleet.regions.map((region) => <button key={region.name} className="region-row" onClick={() => notify(`${region.name}: ${region.vehicles} vehicles`)}><div><strong>{region.name}</strong><span>{region.vehicles} vehicles</span></div><div className="ring" style={{"--value": `${region.utilization * 3.6}deg`} as React.CSSProperties}><span>{region.utilization}%</span></div></button>)}</article></section><section className="route-cards">{routes.filter((route) => `${route.id} ${route.from} ${route.to}`.toLowerCase().includes(query.toLowerCase())).map((route) => <article className="panel route-card" key={route.id}><div><span className={`route-dot ${route.color}`}/><small>{route.id}</small><span className={`status ${route.status === "Congestion" ? "delayed" : "in-transit"}`}>{route.status}</span></div><h3>{route.from} <Icon name="arrow"/> {route.to}</h3><p>{route.vehicles} vehicles · {route.distance} km</p><div className="route-progress"><span style={{width: `${route.progress}%`}}/></div><footer><span>{route.progress}% complete</span><button onClick={() => notify(`${route.id} details opened`)}>Details <Icon name="arrow"/></button></footer></article>)}</section></>}

        {activeNav === "Reports" && <><section className="report-hero"><div><p className="eyebrow">MONTHLY TREND</p><strong>+8.5%</strong><span>delivery volume</span></div><div><p className="eyebrow">SERVICE QUALITY</p><strong>96.4%</strong><span>on-time rate</span></div><div><p className="eyebrow">COST EFFICIENCY</p><strong>$2.18</strong><span>per delivery km</span></div><button className="primary" onClick={exportReport}><Icon name="download"/>Export CSV</button></section><section className="dashboard-grid reports-grid"><article className="panel report-chart"><div className="panel-heading"><div><h2>Delivery performance</h2><p>Completed deliveries by week</p></div></div><div className="line-chart"><svg viewBox="0 0 640 230" role="img" aria-label="Delivery performance trend"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c7ff5e" stopOpacity=".35"/><stop offset="1" stopColor="#c7ff5e" stopOpacity="0"/></linearGradient></defs><path className="area" d="M25 190 L180 145 L335 110 L490 74 L615 42 L615 210 L25 210Z"/><path className="trend" d="M25 190 L180 145 L335 110 L490 74 L615 42"/>{[[25,190],[180,145],[335,110],[490,74],[615,42]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="6"/>)}</svg></div></article><article className="panel insight-panel"><div className="panel-heading"><div><h2>Performance insights</h2><p>Changes worth reviewing</p></div></div><div className="insight-list"><div><span>01</span><p><strong>Peak delivery window improved</strong>Friday throughput increased 14% after route balancing.</p></div><div><span>02</span><p><strong>Ottawa utilization below target</strong>Current utilization is 78% versus the 82% network average.</p></div><div><span>03</span><p><strong>Incident rate declined</strong>Critical service events decreased for a third consecutive week.</p></div></div></article></section><section className="panel report-table"><div className="panel-heading"><div><h2>Weekly report</h2><p>Verified operating metrics</p></div></div><div className="table-wrap"><table><thead><tr><th>Period</th><th>Deliveries</th><th>On-time rate</th><th>Utilization</th><th>Incidents</th></tr></thead><tbody>{reportRows.map((row) => <tr key={row.period}><td><strong>{row.period}</strong></td><td>{row.deliveries.toLocaleString()}</td><td>{row.onTime}%</td><td>{row.utilization}%</td><td>{row.incidents}</td></tr>)}</tbody></table></div></section></>}

        {activeNav === "Settings" && <section className="settings-layout"><article className="panel settings-panel"><div className="panel-heading"><div><h2>Notification rules</h2><p>Choose which events create an alert</p></div></div>{[["emailAlerts","Daily operations summary","Receive a concise network summary each morning."],["delayAlerts","Route delay alerts","Notify when a route exceeds its planned arrival window."],["maintenanceAlerts","Maintenance reminders","Show service reminders 500 km before they are due."]].map(([key,title,description]) => <label className="setting-row" key={key}><div><strong>{title}</strong><span>{description}</span></div><input type="checkbox" checked={settings[key as keyof typeof settings] as boolean} onChange={(e) => setSettings({...settings,[key]:e.target.checked})}/><i/></label>)}</article><article className="panel settings-panel"><div className="panel-heading"><div><h2>Dashboard preferences</h2><p>Control density and risk thresholds</p></div></div><label className="setting-field"><span>Minimum healthy vehicle score</span><select value={settings.threshold} onChange={(e) => setSettings({...settings,threshold:e.target.value})}><option value="80">80%</option><option value="85">85%</option><option value="90">90%</option></select></label><label className="setting-row"><div><strong>Compact table rows</strong><span>Show more fleet records on each screen.</span></div><input type="checkbox" checked={settings.compactRows} onChange={(e) => setSettings({...settings,compactRows:e.target.checked})}/><i/></label><div className="settings-action"><button className="primary" onClick={saveSettings}>Save preferences</button><button className="secondary" onClick={() => {sessionStorage.clear();setVehicles(fleet.vehicles);setSettings({emailAlerts:true,delayAlerts:true,maintenanceAlerts:false,compactRows:false,threshold:"85"});notify("Session data reset");}}>Reset session</button></div></article></section>}
      </div>
    </section>

    {modalOpen && <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}><form className="modal" onSubmit={addVehicle} onMouseDown={(e) => e.stopPropagation()}><div><p className="eyebrow">NEW ASSET</p><h2>Add vehicle</h2><button type="button" onClick={() => setModalOpen(false)}>×</button></div><label>Vehicle ID<input name="id" required placeholder="NS-2500"/></label><label>Driver<input name="driver" required placeholder="Driver name"/></label><label>Route<input name="route" required placeholder="Toronto → Ottawa"/></label><button className="primary" type="submit">Add to fleet <Icon name="arrow"/></button></form></div>}
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </main>;
}
