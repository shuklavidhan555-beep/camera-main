# SmartCity Command Center — Real Dataset Integration Platform

An enterprise-grade, high-performance urban traffic monitoring and computer vision surveillance platform powered by **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**.

This platform replaces all static mock placeholders with actual sensor streams, spatial coordinates, time-series velocity matrices, and forensic feeds drawn from real municipal traffic and surveillance datasets.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js LTS (v20+ or v24+) & npm

### Running the Application

```powershell
# Set Node into environment PATH (Windows PowerShell)
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH

# Install dependencies (if not already installed)
npm install

# Start Vite Development Server with Hot Module Replacement
npm run dev

# Or build and launch production preview server
npm run build
npm run preview
```

### Running Automated Test Suite

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH

# Run complete test suite (Schema validation, volume checks, edge cases, server smoke test)
npm run test

# Run code linter
npm run lint
```

---

## 📊 Integrated Real Datasets

| Dataset Source | Ingested Volume | Platform Integration |
|---|---|---|
| **Caltrans PeMS D7 (District 7 - Los Angeles)** | 228 Traffic Stations | GPS-mapped tactical GIS map, Freeway corridors (I-105, I-405, SR-91, SR-22) |
| **Shenzhen T-GCN Urban Speed Matrix** | 2,976 Time Intervals (156 links) | Hourly volume profiles, network velocity tracking, critical congestion bottlenecks |
| **Municipal Vehicle Spreadsheets** | 23,801 Detection Records | Vehicle classification distribution (Cars, Two-Wheelers, Buses, Trucks), daily KPI count |
| **Pascal VOC Urban Detection Benchmark** | 75 Annotated XML Frames | Bounding box spatial overlays (car, bus, truck, pedestrian) rendered on CCTV player |
| **Urban CCTV Video Feeds** | 5 High-Definition MP4 Streams | Streaming video wall, full-screen inspection player, incident modal replay |
| **CrashSenseAI / Accident Detection** | Forensic Image Frames | High-confidence incident audit cards, collision snapshots, emergency dispatch workflows |

---

## 🏗️ Architecture & Data Pipeline

```
Real Datasets (.xlsx, .csv, .xml, .mp4, .jpg)
                   │
                   ▼ (ETL Pre-processing)
      public/data/integrated_dataset.json
                   │
                   ▼
      src/data/realDataset.ts (Type-Safe Schema)
                   │
                   ▼
      src/services/dataService.ts (Singleton Analytics Service)
                   │
                   ▼
      src/context/CommandCenterContext.tsx (Global Dynamic State & KPI Calculator)
                   │
    ┌──────────────┼──────────────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼              ▼
Overview      Live Video Wall   Traffic Map   Safety Alerts   Audit Reports
(KPI Cards,   (CCTV Player,    (Tactical GIS, (Emergency      (ISO Telemetry
Corridors,    AI Bounding Box  PeMS Vectors,  Dispatch,       CSV & Executive
Charts)       HUD Overlays)    Link Speeds)   Forensics)      Summaries)
```

---

## 🎯 Key Capabilities

1. **Dynamic Real-Time KPI Cards**:
   - Zero hardcoded metrics.
   - Calculates operational camera availability percentage, active sensor counts, total vehicle count (23,801 today), severe bottleneck links, and unresolved Priority 1 emergency alerts dynamically via `useMemo`.

2. **CCTV Stream Player with Computer Vision HUD**:
   - Plays actual urban traffic MP4 streams (`cam_downtown_cmc.mp4`, `cam_traffic_zone.mp4`, `cam_harbour_logistics.mp4`, etc.).
   - Overlays normalized bounding boxes directly from real Pascal VOC detections.
   - Features digital 1.4x zoom, night-vision LUT filter, optical motion simulation, and millisecond-accurate timecodes.

3. **Tactical GIS City Map**:
   - Caltrans PeMS D7 GPS coordinates normalized to the municipal coordinate plane.
   - Real-time heatmaps based on link speed matrices from T-GCN.
   - Interactive zoom/pan, camera inspect triggers, and incident location pings.

4. **Public Safety & Emergency Dispatch System**:
   - Vision AI incident detection backed by accident forensic imagery and CCTV playback.
   - Emergency response package dispatch workflow (EMS Code 3, Police, Traffic Diversion).
   - Audio synthesized control room chimes using the HTML5 Web Audio API.

5. **Compliance & Export Subsystem**:
   - On-the-fly CSV generation for ISO 37120 Smart City Telemetry.
   - Vehicle classification dataset exports with counts, percentage shares, and average segment speeds.
   - Municipal executive summary audit generation with cryptographic hash validation.

---

## 🧪 Verification & Test Coverage

The test suite in `tests/` verifies:
- `data_integration.test.js`:
  - Validates `integrated_dataset.json` schema, coordinate ranges (0-100%), and volume thresholds.
  - Verifies vehicle class distribution adds up to 100% and count >= 20,000.
  - Verifies presence and file integrity of all video feeds and forensic snapshots.
  - Tests `DataService.calculateKpis()` across edge cases: empty sensor lists, 100% offline network, and complete alert acknowledgment.
  - Tests telemetry and vehicle distribution CSV serialization.
- `server_smoke.test.js`:
  - Spins up a static HTTP server on an ephemeral port.
  - Verifies HTTP 200 delivery for `index.html`, `integrated_dataset.json`, CCTV MP4 video streams, and image frames.
