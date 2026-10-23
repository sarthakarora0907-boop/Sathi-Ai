# SAATHI AI — From Chaos to Action
> **Prompt Wars | Societal Benefit Challenge | Pune Civic Redressal Platform**  
> *"Your voice. Your neighborhood. Real action."*

---

## 🎯 Executive Summary
**SAATHI AI** is a production-grade civic-tech web application built to empower citizens in **Pune, Maharashtra, India**. It transforms unstructured, chaotic real-world civic complaints into structured municipal intelligence, ground-truth evidence verification, responsible authority routing, and copy-ready formal complaint representations.

### Supported Civic Issue Verticals:
1. 🕳️ **Potholes & Damaged Roads** (PMC Road Dept / PWD)
2. 🗑️ **Garbage Accumulation & Overflowing Bins** (PMC Solid Waste Management Dept)
3. 💡 **Broken Streetlights & Hazardous Wiring** (MSEDCL / PMC Electrical Dept)
4. 💧 **Water Leakage & Pipeline Ruptures** (PMC Water Supply & Sewage Dept)

Primary Languages: **English** and **Hindi (हिंदी)**.

---

## 🚀 Quick Start Instructions

### 1. Prerequisites
- **Node.js**: v20 or higher (Tested on Node v24.21.0)
- **npm**: v10 or higher

### 2. Installation
```bash
# Clone or navigate to the project directory
cd /path/to/Sathi-AI

# Install dependencies (Express, Multer, Helmet, CORS, dotenv, @google/genai)
npm install
```

### 3. Environment Configuration (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gemini API key if available:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
```
> **Notice on Demo Mode**: If `GEMINI_API_KEY` is not provided or quota is unavailable, SAATHI AI automatically engages its built-in **Local Civic Heuristic Rule Engine** for seamless demonstration. All screens, evidence verification, and complaint letters remain fully functional and clearly labeled.

### 4. Start the Application
```bash
# Run production server
npm start

# Or run with auto-reload
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🛠️ Architecture & Core End-to-End Workflow

```
[ Citizen Report ] ──> [ Express Server ] ──> [ Google Gemini 2.5 Flash / Local Rule Engine ]
       │                      │                                 │
  Text & Photo           Rate Limit & CSP              Structured JSON Extraction
  Hindi / English        Memory Multer              (Severity, Evidence, Authority)
                               │                                 │
                               v                                 v
                     [ Spatial Verifier ]             [ Pune Civic Desk ]
                    Haversine Proximity (<200m)     Official Complaint Letter (EN/HI)
                    12 Seeded Pune Wards            Simulated Tracking ID PUN-CIV-2026-XXXX
```

### Key Working Features:
- **Step 1: Multimodal Intake**: Citizen describes issues in plain English or Hindi, uploads photographic evidence (max 5MB, JPG/PNG/WebP), selects Pune locality or uses GPS.
- **One-Click Presets**: 4 ready-to-test demonstration presets (Kothrud Pothole, Viman Nagar Garbage, Baner Streetlights, Katraj Water Burst) that prefill description, location, and sample evidence photos with a single click.
- **Step 2: Structured AI Analysis**: Extracts category, subcategory, objective summary, 1–5 severity rating with risk justification, visible evidence observations, and PMC Citizen Charter SLA targets.
- **Ground Truth & Uncertainty Segregation**: Strictly isolates verified submission facts from unverified on-site physical factors (e.g. subsurface pipe conditions, physical depth gauges).
- **Step 3: Evidence Verification & Cluster Proximity**: Computes Haversine distance against seeded demonstration records, flags incidents within 200m or adjacent wards, and shows matching cluster scores.
- **Step 4 & 5: Action Plan & Complaint Letter Generator**: Generates formal administrative representations addressed to the PMC Ward Officer / Addl. Commissioner in English and Hindi with 1-click clipboard copy and text download.
- **Step 6: Demonstration Submission**: Records reports into the local civic desk, assigns a simulated tracking number (`PUN-CIV-2026-XXXX`), displays a 4-step progress stepper, and adds the report to the live Pune map.
- **Interactive Pune GIS Map**: Powered by Leaflet.js, featuring 12 realistic seeded Pune civic reports with color-coded severity pins, category filters, and interactive popups.
- **Privacy & Security**: Ephemeral memory processing (no permanent image retention), zero PII collection, helmet security headers, rate limiting, and explicit user consent.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server status, Pune jurisdiction, and Gemini configuration check |
| `GET` | `/api/reports` | Returns community civic reports with optional `category` filter |
| `POST` | `/api/analyze` | Multimodal AI analysis (description, location, language, image) |
| `POST` | `/api/verify` | Spatial proximity and cluster matching against Pune records |
| `POST` | `/api/submit-report` | Simulated civic intake generating demo tracking ID |

---

## ⚖️ Civic Transparency & Honesty
All seeded records and simulated submissions are explicitly tagged as **DEMO DATA** to maintain complete ethical transparency during judging. No false claims of live government dispatch are made unless an authorized municipal API integration is established.
