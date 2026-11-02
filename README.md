![Northstar Ops dashboard preview](./public/preview.png)

# Northstar Ops

**Live demo:** [https://miladmo68.github.io/northstar-ops-dashboard/](https://miladmo68.github.io/northstar-ops-dashboard/)

[![Live](https://img.shields.io/badge/Live-GitHub%20Pages-c7ff5e?style=for-the-badge&logo=github&logoColor=111821)](https://miladmo68.github.io/northstar-ops-dashboard/)
![Next.js](https://img.shields.io/badge/Next.js-16-111821?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Build](https://img.shields.io/badge/Build-Passing-1dbb82?style=for-the-badge&logo=githubactions&logoColor=white)

Northstar Ops is a responsive fleet-intelligence dashboard built for operations teams that need a fast view of vehicle health, route performance, utilization, and service risk.

## ◉ Product views

| Fleet operations | Route network |
|---|---|
| ![Fleet operations](./public/screenshots/fleet.png) | ![Route network](./public/screenshots/routes.png) |

| Performance reports | Control center |
|---|---|
| ![Performance reports](./public/screenshots/reports.png) | ![Control center](./public/screenshots/overview.png) |

## ✦ Highlights

- Responsive control-center interface for desktop, tablet, and mobile
- Live fleet search across vehicle IDs, drivers, routes, and statuses
- Complete Overview, Fleet, Routes, Reports, and Settings workspaces
- Shareable hash routes with browser Back/Forward support
- Functional filters, notification center, route explorer, CSV export, and preferences
- Interactive utilization overview and operational alert feed
- Vehicle health, ETA, and delivery-status monitoring
- Add-vehicle workflow with session-based state
- Accessible controls, keyboard-friendly inputs, and reduced-motion support
- Static production export with automated GitHub Pages deployment

## ◈ Technology

- Next.js 16 with App Router
- React 19 and TypeScript
- CSS design system with responsive breakpoints
- JSON-backed operational dataset
- GitHub Actions and GitHub Pages

## ⬡ Architecture

The dashboard uses a statically exported Next.js application for reliable hosting on GitHub Pages. Operational records are loaded from a structured JSON dataset, while temporary changes use browser session storage. The deployment workflow runs type checking and a production build before publishing the generated static output.

## ⚙ Local development

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run typecheck
npm run build
```

## ✓ Project report

Build and release details are recorded in [PROJECT_REPORT.md](./PROJECT_REPORT.md).

The acceptance rules used for this project are documented in [QUALITY_STANDARD.md](./QUALITY_STANDARD.md).
