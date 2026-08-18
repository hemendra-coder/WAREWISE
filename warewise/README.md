# 📦 WareWise | Architectural & Editorial Logistics OS

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg?style=flat-square)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-4.4-646cff.svg?style=flat-square)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-4.0-38bdf8.svg?style=flat-square)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **WareWise** is a high-craft, enterprise-grade logistics and fulfillment platform combined with a modern e-commerce storefront. Designed following the *Architectural & Editorial Minimalist Logistics OS* design archetype, it features an elegant warm-neutral palette, rigorous mathematical visual ratios, hands-free voice-assisted warehouse picking, TSP-optimized route planning, live courier telemetry, and automated fault-containment boundaries.

---

## 🗺️ System Architecture & Portals

WareWise operates as a full-suite dual-portal ecosystem, coordinating real-time warehouse back-office workflows with an ultra-responsive customer-facing storefront.

```
                         ┌─────────────────────────────────┐
                         │      WareWise App Root          │
                         └────────────────┬────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
   ┌─────────────────────────────┐                 ┌─────────────────────────────┐
   │  Admin Operations Portal    │                 │   Online Storefront Portal  │
   ├─────────────────────────────┤                 ├─────────────────────────────┤
   │ • Live Command Center       │                 │ • Smart Catalog Browse      │
   │ • Inventory & Allocation    │                 │ • AI Shopping Advisor       │
   │ • Voice-Assisted Picking    │                 │ • Command Palette (Cmd+K)   │
   │ • TSP Routing Visualizer    │                 │ • Multimodal Search         │
   │ • Live Dispatch Telemetry   │                 │ • Live Courier Tracker      │
   └─────────────────────────────┘                 └─────────────────────────────┘
```

### 1. Admin Operations Portal (`/src/components/admin`)
The control deck for warehouse operations, managers, and fulfillment clerks:
- **Command Center & Hub Map**: Visualizes multi-hub metropolitan distribution nodes, current storage density, live operational metrics, and real-time system tickers.
- **Inventory & Smart Allocation**: Tracks high-density storage bins, item shelf-life, and automatically flags low-stock thresholds.
- **Voice-Assisted Picking Controller**: Hands-free picking commands leveraging client-side speech synthesis and speech recognition APIs, designed to improve throughput in rapid distribution pipelines.
- **TSP Path Route Optimizer**: Implements a localized Travelling Salesperson Problem (TSP) greedy heuristic optimizer to visualizes the shortest path for pickers across warehouse coordinate grids.
- **Quality Control & Custom Packing**: Interactive step-by-step weight verification and secure box packing procedures.
- **Real-Time Dispatch Courier Telemetry**: Maps delivery rider routes with dynamically moving coordinate markers, speed indicators, and destination ETA countdowns.

### 2. Online Storefront Portal (`/src/components/customer`)
A modern, polished consumer-facing store optimized for high-performance transactions:
- **Intelligent Shopping Advisor**: Fully contextual server-side LLM copilot that handles deep item comparison, inventory check, and custom checkout creation.
- **Multimodal Search System**: Voice and Image search inputs utilizing integrated browser speech and file-handling pipelines.
- **Product Comparison Matrix**: A multi-dimensional side-by-side comparison matrix tracking technical specs, price-to-performance ratings, power inputs, and dimensions.
- **Omnipresent Command Palette (`⌘K` / `Ctrl+K`)**: Keyboard-driven UI to instantly find products, track invoices, open menus, or trigger support functions.
- **Frictionless Checkout Suite**: Progressive, accessibility-validated steps managing addresses, courier selections, and billing details.

---

## 🛠️ Resiliency & Performance Engineering

WareWise integrates cutting-edge frontend telemetry and diagnostic systems designed to maintain maximum uptime in heavy-traffic enterprise environments.

### 🛡️ Enhanced Bug Boundaries (`ErrorBoundary.tsx`)
Rather than risking total application crashes, WareWise wraps key operational layouts, sidebars, and modules in modular **Enhanced Bug Boundaries**.
- **Fault Isolation**: Isolates errors within specific panels (e.g., a specific warehouse picking module) while leaving the rest of the operational layout fully functional.
- **Graceful Recovery**: Displays error parameters in a developer-friendly terminal view and provides a **"Recover Component"** button that dynamically flushes state and re-mounts the module.
- **Telemetry Storage**: Automatically logs intercepted errors into `localStorage` (`warewise_bug_telemetry`) with timestamp, stack traces, and browser environment data.

### ⚡ Telemetry Performance HUD (`PerformanceMonitor.tsx`)
A live hardware diagnostic drawer that allows administrators and evaluators to audit system metrics in real time:
- **FPS Graph**: Monitors frame rate consistency using a `requestAnimationFrame` evaluation loop, plotting results on a dynamic SVG sparkline.
- **JS Heap Memory Tracker**: Analyzes active heap allocation and overall memory bounds.
- **DOM Node Density**: Monitors DOM footprint thresholds to prevent UI degradation (`Optimal Threshold < 1500 nodes`).
- **Network Ping Latency**: Measures network ping and active WebSocket/HTTP channel speeds.
- **Chaos & Stress Test Suite**:
  - *Simulate Compute Stress*: Spawns heavy array calculations to test system behavior during high-CPU operations.
  - *Simulate Network Latency*: Artificially inflates latency to verify network alert banners.
  - *Trigger Exception*: Induces a component fault to demonstrate the Bug Boundary intercepting and recovering live.

---

## 🎨 Visual Identity & Rhythmic Spacing

Designed according to the **UI/UX Pro Max** guidelines:
- **Warm Editorial Color Palette**:
  - **Background**: `#F8F7F4` (Warm Linen/Bone)
  - **Ink & Contrast**: `#1C1917` (Deep Charcoal)
  - **Accent / Urgency**: `#E27B58` (Terracotta / Burnt Orange)
- **Mathematical Typography**:
  - Headings / Display: *Cormorant Garamond* (600 italic, luxury serif)
  - Metadata / Telemetry: *Space Mono* (uppercase, tracked out letter spacing)
  - UI Controls / Labels: *Inter* (responsive, medium/semibold)
- **Geometrical Rhythm**:
  - Nested corner radius formula: $\text{Radius}_{\text{inner}} = \text{Radius}_{\text{outer}} - \text{Padding}_{\text{container}}$
  - Horizontal buttons feature exactly $2\times$ vertical padding (e.g., `px-4 py-2`).

---

## 🚀 Installation & Local Development

### Prerequisites
Make sure you have Node.js (v18+) and npm installed on your system.

### 1. Clone & Set Up the Workspace
```bash
# Clone the repository
git clone https://github.com/your-username/warewise-logistics-os.git

# Navigate to project directory
cd warewise-logistics-os

# Install required dependencies
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add any server-side secret API keys (e.g., Gemini integration, if applicable):
```env
# .env
GEMINI_API_KEY=your_server_side_secret_key_here
```

### 3. Start Development Server
```bash
# Starts development server (Vite)
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to preview.

### 4. Build & Production Compile
```bash
# Production bundle build
npm run build

# Standalone start (compiles server.ts and hosts static bundle)
npm run start
```

---

## 📦 Deployment

### Vercel Deployment
This repository comes with a pre-configured `vercel.json` file to support seamless SPA client-side routing rewrites:
1. Push your code to your GitHub repository.
2. Link your repository in the Vercel Dashboard.
3. Vercel automatically detects the Vite config; click **Deploy**!

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
