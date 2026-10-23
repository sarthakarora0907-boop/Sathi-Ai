require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');

const { sampleReports } = require('./data/sampleReports');
const { analyzeCivicReport } = require('./services/geminiService');
const { verifyReportAgainstDataset } = require('./services/verificationService');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for reports (seeded reports + live user demo submissions)
let activeReports = [...sampleReports];

// Security middleware - helmet with relaxed CSP for CDN resources (Leaflet, Tailwind, Google Fonts)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://unpkg.com",
          "https://cdn.jsdelivr.net"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://unpkg.com",
          "https://cdn.jsdelivr.net"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org", "https://unpkg.com", "https://images.unsplash.com"],
        connectSrc: ["'self'"]
      }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // limit each IP to 120 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after a few minutes.' }
});
app.use('/api/', apiLimiter);

// Multer memory storage configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload JPG, PNG, or WebP images only.'));
    }
  }
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  res.json({
    status: 'ok',
    service: 'SAATHI AI — From Chaos to Action',
    location: 'Pune, Maharashtra, India',
    gemini_configured: hasKey,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  });
});

/**
 * Get all civic reports (seeded demonstration records + user reports)
 */
app.get('/api/reports', (req, res) => {
  const { category, status } = req.query;
  let results = [...activeReports];

  if (category && category !== 'All') {
    results = results.filter(r => r.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (status && status !== 'All') {
    results = results.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }

  res.json({
    success: true,
    count: results.length,
    reports: results
  });
});

/**
 * STEP 2: AI Analysis endpoint
 */
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const { description, location, language = 'en', consent } = req.body;

    // Validate description
    if (!description || description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a clear description of the civic problem (at least 5 characters).'
      });
    }

    if (consent !== 'true' && consent !== true) {
      return res.status(400).json({
        success: false,
        error: 'User consent is required before processing civic incident data.'
      });
    }

    // Call Gemini or local fallback engine
    const analysis = await analyzeCivicReport({
      description,
      location: location || '',
      language,
      file: req.file
    });

    // Also run immediate geo-spatial verification against Pune records
    const verification = verifyReportAgainstDataset({
      description,
      location: location || '',
      category: analysis.category
    }, activeReports);

    res.json({
      success: true,
      analysis,
      verification,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error during report analysis:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred during analysis.'
    });
  }
});

/**
 * STEP 3: Manual Verification endpoint
 */
app.post('/api/verify', (req, res) => {
  try {
    const { description, location, category, coordinates } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required for evidence verification.'
      });
    }

    const verificationResult = verifyReportAgainstDataset({
      description,
      location,
      category,
      coordinates
    }, activeReports);

    res.json({
      success: true,
      verification: verificationResult
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * STEP 6: Simulated Demonstration Submission endpoint
 */
app.post('/api/submit-report', (req, res) => {
  try {
    const {
      category,
      subcategory,
      title,
      description,
      location,
      severity,
      authority,
      complaintLetter
    } = req.body;

    if (!description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required report fields.'
      });
    }

    // Generate random realistic Pune tracking ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `PUN-CIV-2026-${randomNum}`;

    const newReport = {
      id: trackingId,
      category: category || 'Civic Issue',
      subcategory: subcategory || 'General Civic Concern',
      title: title || `${category} reported at ${location || 'Pune Ward'}`,
      description,
      location: location || 'Pune Municipal Jurisdiction',
      ward: location ? `Identified Zone: ${location}` : 'Unassigned Ward',
      coordinates: null, // User submission without GPS
      severity: Number(severity) || 3,
      status: 'Logged for Triage',
      reportedAt: new Date().toISOString(),
      verifiedByCount: 1,
      authority: authority || 'Pune Municipal Corporation (PMC)',
      isDemo: true,
      isUserSubmitted: true
    };

    // Prepend to active reports list
    activeReports.unshift(newReport);

    res.json({
      success: true,
      message: 'Demonstration report successfully recorded in local civic desk.',
      trackingId,
      status: 'Logged for Triage',
      timestamp: new Date().toISOString(),
      slaEstimate: '48 Hours (PMC Citizen Charter Target)',
      disclaimer: 'HONEST SIMULATION: This submission is securely logged in the local demonstration hub. It has not been dispatched to live municipal government systems.'
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generic error handler for multer and express
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File size exceeds 5MB limit. Please upload a smaller image.' });
    }
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
  next();
});

// Start listening
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SAATHI AI — From Chaos to Action`);
  console.log(`  Target City : Pune, Maharashtra, India`);
  console.log(`  Server Port : http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`  Gemini Key  : ${process.env.GEMINI_API_KEY ? 'Configured (Live AI)' : 'Not Set (Engaging Local Rule Engine)'}`);
  console.log(`=======================================================`);
});
