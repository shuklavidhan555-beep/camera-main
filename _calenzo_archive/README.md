# CALENZO — Clinic Appointment & Queue Management System
> **"Handling your conversion, convenience, and patients."**  
> *Production-Ready Web-Based Clinic Management Solution*

---

## 🌟 Overview

**Calenzo** is a modern, unified clinic appointment booking and real-time queue management system built specifically for clinics, doctors, and multi-specialty healthcare centers. It addresses all 8 critical pain points identified in clinic operations:

1. **Long Queues & Waiting**: Patients track live queue position and dynamic wait times from home.
2. **Phone-Based Bookings**: 24/7 online self-service booking with strict double-booking prevention.
3. **No-Show Patients**: Automated WhatsApp reminders, arrival windows, and no-show tracking.
4. **No Follow-up System**: Automated 7/30/90-day follow-up CRM tasks with Hot, Warm, Cold priorities.
5. **No Data or Analytics**: Real-time analytics on patient volume, no-show rates, peak hours, and consult duration.
6. **Staff Overloaded**: Front-desk walk-in intake completed in under 30 seconds with 1-click WhatsApp triggers.
7. **No 24/7 Availability**: Public web portal operates 24/7 on any smartphone or computer with zero app installation.
8. **No Single Unified Platform**: Role-based access for Admin, Doctor, Receptionist, and Patients in one cohesive system.

---

## 🚀 Quick Start (One-Click Launch)

### Option 1: Double-Click Launcher
Double-click `start-calenzo.bat` in the root folder:
```cmd
start-calenzo.bat
```

### Option 2: PowerShell Command
Run the backend server directly in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File "d:\system\server.ps1" -Port 5000
```
Then open your browser to: **[http://localhost:5000](http://localhost:5000)**

---

## 🧩 Core Features & Architecture

### 1. Online Appointment Booking (Public / Patient Portal)
- **Bilingual Interface**: Seamless 1-click toggle between **English** and **हिंदी (Hindi)**.
- **Consultation Type Selector**:
  - *First-Time Patient (New)*: 20-min consultation & medical intake (₹600)
  - *Returning Patient (Follow-up)*: 10-min routine review (₹300)
  - *Procedure / Screening*: 30-min ECG & diagnostic screening (₹1200)
- **Strict Double-Booking Prevention**: Only open, unbooked slots are clickable.
- **Dynamic Suggested Arrival Window**: Displays recommended arrival time (e.g. `09:50 AM - 10:00 AM`) so patients do not wait outside needlessly.
- **Instant Token Assignment**: Generates unique day token (e.g. `A-01`, `A-02`).
- **Digital Ticket & Live Tracking Link**: Immediate confirmation card with simulated WhatsApp confirmation message.

### 2. Rapid Walk-In Intake (< 30 Seconds)
- Designed specifically for busy receptionists.
- Simple fast entry form: Name, Phone (+91), Age, Gender, and Consultation Type.
- 1-click submission immediately assigns the next token number, inserts into the live queue, and dispatches a WhatsApp notification.
- Algorithmic duration calculation based on consultation type and previous rolling averages.

### 3. Real-Time Queue Management & Controls
- **Lifecycle Flow**: `Waiting` ➔ `Arrived` ➔ `In Consultation` ➔ `Completed` (or `Skipped` / `Cancelled`).
- **Dynamic Wait Time Calculation**: Calculates estimated wait time per patient based on remaining consultation times of preceding patients + active clinic delays.
- **Staff Controls (1-Click Actions)**:
  - `Mark Arrived`: Patient has checked into the waiting area.
  - `Start Consult`: Patient enters the doctor's room.
  - `Complete & Next`: Finishes consultation, records medical notes, auto-schedules follow-up, rings hospital chime, and calls next token.
  - `Skip`: Patient absent when called; moved to skipped list.
  - `Recall`: Restores skipped patient back to active queue.
  - `Add Delay (+15m)`: Adds clinic delay and broadcasts WhatsApp alert to all waiting patients.

### 4. Emergency Cancellation & Dynamic Downstream Recalculation
- Patients or staff can trigger **Emergency Cancellation**:
  - Captures reason (Medical Emergency, Travel Delay, Work Conflict, etc.)
  - Offers policy resolutions:
    1. **Reschedule to Next Available Business Day**
    2. **50% Instant Refund to Original Payment Source**
  - **Dynamic Downstream Adjustment**: When a patient (e.g. #7) cancels:
    - Their estimated time is immediately subtracted from all subsequent patients (#8, #9, #10).
    - Downstream arrival windows are updated earlier.
    - Slot is freed and an empty slot alert is dispatched to priority waitlist / receptionist.

### 5. Automated WhatsApp & SMS Notification Engine
- **Triggers**:
  - Booking confirmation (with live tracking link)
  - Delay notification broadcasts
  - Turn-approaching alerts ("You are 1 patient away...")
  - Follow-up reminder cadence (7 days, 1 month, 3 months)
  - Cancellation & refund status receipts
- **1-Click WhatsApp Quick Action**: Staff can click the WhatsApp button next to any patient to launch `https://wa.me/91XXXXXXXXXX?text=...` with pre-filled message text.
- **Notification Audit Log**: Searchable history of all dispatched messages with timestamps and delivery status.

### 6. Doctor Consultation Room
- Focused clinician workspace:
  - **Live Consultation Timer** (color-coded warning if consult exceeds duration).
  - Current patient file: Demographics, past medical history, known allergies, confidential notes.
  - Clinical Assessment, Diagnosis, and Prescription (Rx) note writer.
  - Recommended follow-up timeline selector (7 days, 14 days, 30 days, 90 days).
  - 1-click **"Complete & Next"** button with Web Audio hospital chime announcement.
  - "Next In Line" queue strip for quick call-in.

### 7. Follow-Up Management CRM
- Every completed appointment automatically generates a follow-up task.
- Filterable by priority levels:
  - 🔴 **Hot (Urgent)**: Due within 7 days.
  - 🟡 **Warm (Routine)**: Due within 14–30 days.
  - ⚪ **Cold (Low)**: Due in 90 days (routine monitoring).
- 1-click WhatsApp follow-up reminder launcher.
- Status tracking: `Pending`, `Contacted`, `Completed`, `Rescheduled`.

### 8. Patient Database & Medical Records
- Searchable directory across Patient Name, Phone (+91), or Patient ID.
- Complete patient profile with visit history, no-show count, allergies, and past consultation notes.
- **1-Click CSV Export**: Downloads complete patient directory (`calenzo_patients.csv`) ensuring zero clinic lock-in.

### 9. Analytics Dashboard
- Total appointments, completed count, no-show rate percentage.
- Source breakdown: Online vs Walk-in ratio.
- Average consultation wait time & average consultation duration.
- Hourly peak slot heatmap highlighting busiest periods (e.g. 10:00 AM peak).

### 10. TV Waiting Room Display (Digital Signage)
- Fullscreen high-contrast display for waiting room TVs and kiosks.
- **NOW SERVING**: Large token callout (e.g. `TOKEN A-03`), patient name, room name, and doctor name.
- **NEXT IN LINE**: Upcoming tokens with dynamic estimated wait times.
- **Audio Chime & Speech Synthesis**: Dual-frequency hospital chime (`523.25 Hz -> 659.25 Hz`) and voice callout ("Token A-04, please proceed to Consultation Room 1").

---

## 📂 Directory Structure

```
d:\system\
│
├── server.ps1                  # PowerShell HTTP REST API & static server (.NET HttpListener)
├── start-calenzo.bat           # 1-click Windows launcher script
├── README.md                   # Complete system documentation
│
├── data\                       # Persistent JSON database
│   ├── clinic.json             # Clinic profile, timings, durations, and services
│   ├── patients.json           # Complete patient directory & medical histories
│   ├── appointments.json       # Daily & historical appointments with token lifecycle
│   ├── followups.json          # CRM follow-up tasks with Hot/Warm/Cold priorities
│   └── notifications.json      # WhatsApp & SMS audit log
│
└── public\                     # Modern zero-dependency frontend web application
    ├── index.html              # Responsive single-page app layout with all 6 views
    ├── style.css               # Medical design system, badges, TV display styling
    ├── app.js                  # Reactive controller, Web Audio chime, queue engine
    └── translations.js         # Bilingual English & Hindi translation dictionary
```

---

## 🔌 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/clinic` | Get clinic profile and settings |
| `POST` | `/api/clinic` | Update clinic configuration |
| `GET` | `/api/queue/live` | Real-time queue snapshot (now serving, active queue, wait times) |
| `POST` | `/api/queue/action` | Queue action (`arrived`, `start`, `complete`, `skip`, `recall`, `cancel`, `delay`) |
| `GET` | `/api/appointments` | Get appointments (supports `?date=YYYY-MM-DD`) |
| `POST` | `/api/appointments/book` | Book new appointment (online or walk-in, assigns token & sends WhatsApp) |
| `POST` | `/api/appointments/emergency-cancel` | Emergency cancellation with 50% refund or reschedule |
| `GET` | `/api/patients` | Search patient database (supports `?q=search`) |
| `POST` | `/api/patients` | Create or update patient record |
| `GET` | `/api/followups` | Get follow-up CRM tasks |
| `POST` | `/api/followups/action` | Update follow-up task (`contacted`, `completed`, `rescheduled`) |
| `GET` | `/api/notifications` | Get WhatsApp message audit log |
| `POST` | `/api/notifications/send` | Dispatch customized notification |
| `GET` | `/api/analytics` | Compute clinic performance metrics & hourly trends |
| `GET` | `/*` | Serves frontend static assets (`index.html`, `style.css`, `app.js`, etc.) |

---

## 🛡️ Zero External Dependencies

- **Backend**: Native Windows PowerShell with .NET `HttpListener` — requires no Node.js, Python, or npm installations.
- **Frontend**: Native HTML5, modern CSS3, and ES6 JavaScript.
- **Persistence**: Clean, human-readable UTF-8 JSON files in `data/`.
- **Audio Chimes**: Built-in Web Audio API synthesizers — no external audio files required.
- **Browser Compatibility**: Fully responsive across Chrome, Edge, Brave, Safari, and mobile browsers.
