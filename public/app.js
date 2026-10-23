// SAATHI AI — Client Application Logic

// Global state
let currentLanguage = 'en';
let currentLetterLang = 'en';
let analysisData = null;
let currentSelectedFile = null;
let mapInstance = null;
let mapMarkers = [];
let allReportsCache = [];

// Pre-configured demonstration presets for 1-click judging evaluation
const DEMO_PRESETS = [
  {
    category: "Potholes & Damaged Roads",
    location: "Nal Stop, Karve Road, Kothrud",
    description: "Deep pothole measuring approximately 2.5 feet wide and 5 inches deep right after the Nal Stop Flyover descent towards Karve Road. Two-wheelers frequently swerve into the bus lane to avoid it, creating heavy collision risk during evening peak hours.",
    samplePhoto: "pothole"
  },
  {
    category: "Garbage Accumulation",
    location: "Datta Mandir Chowk, Viman Nagar",
    description: "Community dustbin overflowing with wet food waste and unsegregated plastic packaging for over 48 hours. Waste has spilled onto 15 feet of road area attracting stray dogs and cattle, causing foul odor near residential apartments.",
    samplePhoto: "garbage"
  },
  {
    category: "Broken Streetlights",
    location: "Baner High Street, Baner",
    description: "Complete dark stretch between Balewadi Phata and High Street intersection. 5 consecutive LED street poles are not turning on after 6:30 PM. High pedestrian footfall, creating safety concerns especially for women commuters and walkers.",
    samplePhoto: "streetlight"
  },
  {
    category: "Water Leakage & Wastage",
    location: "Katraj-Kondhwa Road near Rajas Society, Katraj",
    description: "Drinking water pipeline ruptured under tarmac. Clean potable water gushing at high pressure since 6 AM, flooding 100 meters of road surface and causing loss of pressure in surrounding residential societies.",
    samplePhoto: "waterleak"
  }
];

// Bilingual translations dictionary
const I18N = {
  en: {
    nav_report: "Report an Issue",
    nav_pune_map: "Pune Civic Map",
    nav_privacy: "Privacy & Safety",
    cta_start_report: "Report Now",
    hero_badge: "CITIZEN EMPOWERMENT • PUNE MUNICIPALITY",
    hero_title_1: "From Chaos to Action:",
    hero_title_2: "AI-Powered Civic Redressal",
    hero_desc: "Transform messy real-world civic problems—potholes, garbage dumps, dark streetlights, and burst water pipes—into verified municipal intelligence, transparent evidence analysis, and copy-ready formal complaint representations.",
    stat_categories: "Civic Categories",
    stat_wards: "Pune Wards Seeded",
    stat_cluster: "Cluster Proximity",
    stat_sla: "PMC Charter SLA",
    hero_cta_report: "File a Citizen Report",
    hero_cta_map: "View Seeded Pune Reports",
    supported_issues_title: "Supported Pune Civic Issues",
    click_to_test: "Click to Quick Test",
    cat_potholes: "Potholes & Damaged Roads",
    cat_potholes_sub: "Craters, road cave-ins, and uneven asphalt hazard",
    cat_garbage: "Garbage Accumulation",
    cat_garbage_sub: "Overflowing bins, open waste dumping & hygiene risks",
    cat_streetlights: "Broken Streetlights",
    cat_streetlights_sub: "Dark lanes, fixture faults, and exposed wiring hazard",
    cat_water: "Water Leakage & Wastage",
    cat_water_sub: "Pipeline ruptures, chamber overflow & potable water loss",
    hero_honesty_note: "Demonstration Mode handles missing API keys smoothly with local civic rules.",
    step1_badge: "Step 1 — Report an Issue",
    step1_heading: "Describe the Real-World Problem in Natural Language",
    step1_subheading: "Report in Hindi or English. Our AI analyzes severity, visible evidence, Pune municipal jurisdiction, and builds a copy-ready complaint letter.",
    presets_title: "One-Click Demonstration Scenarios for Judges & Testers:",
    presets_hint: "Click any scenario to auto-fill text, location & sample photo",
    form_desc_label: "Problem Description",
    form_loc_label: "Pune Location / Landmark",
    btn_detect_gps: "Detect",
    form_photo_label: "Photographic Evidence",
    upload_click_or_drag: "Click or drag & drop photo here",
    form_lang_pref: "Analysis & Letter Language:",
    form_consent_text: "I confirm this report reflects an observed civic condition and consent to AI-assisted analysis for civic reporting. No biometric or sensitive PII is included.",
    btn_analyze: "Run Multimodal AI Analysis",
    empty_state_title: "AI Civic Intelligence Pipeline Standing By",
    empty_state_desc: "Fill in an issue on the left or click any of the 4 demo presets above. The engine will extract hazard categories, determine Pune municipal routing, evaluate corroborating evidence, and draft a formal complaint representation.",
    severity_label: "Severity Level",
    structured_problem_summary: "Structured Problem Summary",
    visible_evidence_title: "Visible Evidence & Observations",
    verified_facts_title: "Facts Verified from Submission",
    uncertainties_title: "Unknown or Uncertain Factors",
    suggested_authority_title: "Suggested Responsible Authority",
    confidence_gauge_title: "AI Diagnostic Confidence",
    verification_panel_title: "Evidence Verification & Geo-Proximity Analysis",
    corroborating_evidence_title: "Corroborating Evidence:",
    matching_reports_title: "Nearest Correlating Demo Reports in Pune:",
    demo_honesty_text: "Demonstration Integrity Notice: Matched reports are simulated demonstration records for Pune. Proximity and keyword correlation demonstrate pattern clustering but do not constitute official municipal verification.",
    complaint_letter_title: "Official Complaint Representation (Ready-to-File)",
    action_steps_title: "Actionable Citizen Next Steps",
    formal_text_label: "Formal Letter to Pune Municipal Corporation:",
    btn_copy_letter: "Copy to Clipboard",
    btn_download: "Download .txt",
    demo_submit_title: "Record in Pune Civic Desk",
    demo_submit_subtitle: "Simulates municipal grievance intake with unique tracking reference",
    btn_submit_demo: "Submit Report (Demonstration)",
    sub_success_title: "Report Successfully Recorded",
    sub_honesty_disclaimer: "Simulation Transparency: This submission is securely stored in the local demo database and visible on the Pune Community Map below. It has not been sent to actual government servers.",
    map_badge: "PUNE MUNICIPALITY CIVIC INTELLIGENCE",
    map_heading: "Seeded Community Reports & Pune GIS Map",
    map_subheading: "Realistic demonstration records across Kothrud, Shivaji Nagar, Baner, Viman Nagar, Hinjewadi, Hadapsar, and Katraj.",
    privacy_badge: "Privacy, Ethics & Safety Standards",
    privacy_heading: "Built for Citizen Trust & Responsible AI",
    privacy_subheading: "How SAATHI AI handles your civic evidence, protects privacy, and ensures algorithmic transparency.",
    priv_col1_title: "Ephemeral Processing",
    priv_col1_desc: "Uploaded evidence photos are processed in server memory for Gemini visual inference and are not retained in permanent storage.",
    priv_col2_title: "Zero PII Harvesting",
    priv_col2_desc: "No Aadhaar, phone numbers, or residential addresses are requested or logged. We protect citizens from unintended exposure.",
    priv_col3_title: "Anti-Hallucination Guard",
    priv_col3_desc: "The AI is strictly prompted to never invent locations or factual certainty. Unknowns are explicitly segregated from verified facts.",
    priv_col4_title: "Transparent Demonstration",
    priv_col4_desc: "Demonstration records are clearly labeled as hackathon simulation data. No false claims of live government dispatch are made."
  },
  hi: {
    nav_report: "समस्या दर्ज करें",
    nav_pune_map: "पुणे सिविक मैप",
    nav_privacy: "गोपनीयता एवं सुरक्षा",
    cta_start_report: "रिपोर्ट दर्ज करें",
    hero_badge: "नागरिक सशक्तिकरण • पुणे महानगरपालिका",
    hero_title_1: "अव्यवस्था से समाधान तक:",
    hero_title_2: "एआई-संचलित नागरिक शिकायत निवारण",
    hero_desc: "नागरिक समस्याओं—सड़क के गड्ढे, कचरे के ढेर, बंद स्ट्रीटलाइट्स और पानी का रिसाव—को प्रमाणित नगर निगम जानकारी, साक्ष्य विश्लेषण और औपचारिक शिकायत पत्र में बदलें।",
    stat_categories: "समस्या श्रेणियां",
    stat_wards: "पुणे वॉर्ड शामिल",
    stat_cluster: "क्लस्टर निकटता",
    stat_sla: "PMC चार्टर समय-सीमा",
    hero_cta_report: "नागरिक शिकायत दर्ज करें",
    hero_cta_map: "पुणे की रिपोर्ट्स देखें",
    supported_issues_title: "पुणे की प्रमुख नागरिक समस्याएं",
    click_to_test: "परीक्षण हेतु क्लिक करें",
    cat_potholes: "सड़क के गड्ढे एवं टूटी सड़कें",
    cat_potholes_sub: "गहरे गड्ढे, धंसी सड़कें और दोपहिया वाहनों के लिए जोखिम",
    cat_garbage: "कचरे का जमावड़ा एवं गंदगी",
    cat_garbage_sub: "ओवरफ्लो कूड़ेदान, खुले में कचरा और स्वास्थ्य खतरे",
    cat_streetlights: "बंद या खराब स्ट्रीटलाइट्स",
    cat_streetlights_sub: "अंधेरे रास्ते, लैंप की खराबी और खुले बिजली के तार",
    cat_water: "पानी का रिसाव एवं बर्बादी",
    cat_water_sub: "पाइपलाइन टूटना, चैंबर ओवरफ्लो और पेयजल की बर्बादी",
    hero_honesty_note: "डेमो मोड: एपीआई की अनुपस्थिति में भी स्थानीय सिविक नियमों द्वारा पूर्ण प्रदर्शन।",
    step1_badge: "चरण 1 — समस्या दर्ज करें",
    step1_heading: "अपनी समस्या को सामान्य भाषा में बताएं",
    step1_subheading: "हिंदी या अंग्रेजी में लिखें। हमारा AI गंभीरता, प्रत्यक्ष प्रमाण और पुणे महानगरपालिका अधिकार क्षेत्र का विश्लेषण कर औपचारिक पत्र तैयार करता है।",
    presets_title: "जजों और परीक्षकों के लिए त्वरित डेमो विकल्प:",
    presets_hint: "किसी भी विकल्प पर क्लिक करके विवरण, स्थान और नमूना फोटो स्वतः भरें",
    form_desc_label: "समस्या का विवरण",
    form_loc_label: "पुणे का स्थान / लैंडमार्क",
    btn_detect_gps: "पहचानें",
    form_photo_label: "फोटो प्रमाण (वैकल्पिक)",
    upload_click_or_drag: "फोटो यहाँ क्लिक करें या ड्रैग करें",
    form_lang_pref: "विश्लेषण एवं पत्र की भाषा:",
    form_consent_text: "मैं पुष्टि करता हूँ कि यह रिपोर्ट वास्तविक नागरिक समस्या पर आधारित है और AI-सहायता प्राप्त विश्लेषण हेतु सहमति देता हूँ। कोई संवेदनशील व्यक्तिगत डेटा शामिल नहीं है।",
    btn_analyze: "मल्टीमॉडल AI विश्लेषण प्रारंभ करें",
    empty_state_title: "AI नागरिक विश्लेषण प्रणाली तैयार है",
    empty_state_desc: "बाईं ओर विवरण भरें या ऊपर दिए गए 4 डेमो विकल्पों में से चुनें। सिस्टम समस्या श्रेणी, जिम्मेदार वॉर्ड और औपचारिक शिकायत पत्र स्वतः तैयार करेगा।",
    severity_label: "गंभीरता स्तर",
    structured_problem_summary: "समस्या का संरचित सारांश",
    visible_evidence_title: "प्रत्यक्ष साक्ष्य एवं अवलोकन",
    verified_facts_title: "प्रस्तुत विवरण से सत्यापित तथ्य",
    uncertainties_title: "अज्ञात या अनिश्चित पहलू (स्थलीय निरीक्षण आवश्यक)",
    suggested_authority_title: "सुझाया गया जिम्मेदार विभाग",
    confidence_gauge_title: "AI विश्लेषणात्मक सटीकता",
    verification_panel_title: "साक्ष्य सत्यापन एवं भू-स्थानिक निकटता विश्लेषण",
    corroborating_evidence_title: "पुष्टि करने वाले साक्ष्य:",
    matching_reports_title: "पुणे के निकटतम संबंधित डेमो मामले:",
    demo_honesty_text: "डेमो पारदर्शिता सूचना: यह मिलान पुणे के डेमो रिकॉर्ड पर आधारित है। यह पैटर्न क्लस्टरिंग दर्शाता है परंतु आधिकारिक सरकारी सत्यापन नहीं है।",
    complaint_letter_title: "पुणे महानगरपालिका हेतु औपचारिक शिकायत पत्र",
    action_steps_title: "नागरिक हेतु आवश्यक अगले कदम",
    formal_text_label: "पुणे महानगरपालिका को प्रेषित पत्र:",
    btn_copy_letter: "पत्र कॉपी करें",
    btn_download: ".txt डाउनलोड करें",
    demo_submit_title: "पुणे सिविक डेस्क में दर्ज करें",
    demo_submit_subtitle: "विशिष्ट ट्रैकिंग संख्या के साथ सिमुलेटेड शिकायत पंजीकरण",
    btn_submit_demo: "रिपोर्ट सबमिट करें (डेमो)",
    sub_success_title: "रिपोर्ट सफलतापूर्वक दर्ज की गई",
    sub_honesty_disclaimer: "सिमुलेशन पारदर्शिता: यह रिकॉर्ड स्थानीय डेमो डेटाबेस में सुरक्षित है और नीचे मैप पर प्रदर्शित है। यह वास्तविक सरकारी सर्वर पर प्रेषित नहीं हुआ है।",
    map_badge: "पुणे महानगरपालिका सिविक इंटेलिजेंस",
    map_heading: "समुदाय की रिपोर्ट्स एवं पुणे जीआईएस मैप",
    map_subheading: "कोथरुड, शिवाजी नगर, बानेर, विमान नगर, हिंजेवाड़ी, हडपसर एवं कात्रज के वास्तविक डेमो रिकॉर्ड।",
    privacy_badge: "गोपनीयता, नैतिकता एवं सुरक्षा मानक",
    privacy_heading: "नागरिक विश्वास और उत्तरदायी AI",
    privacy_subheading: "SAATHI AI नागरिक साक्ष्यों का सुरक्षित और पारदर्शी प्रबंधन कैसे करता है।",
    priv_col1_title: "अल्पकालिक डेटा प्रोसेसिंग",
    priv_col1_desc: "अपलोड की गई तस्वीरें केवल मेमोरी में विश्लेषित होती हैं और स्थायी रूप से सर्वर पर संग्रहीत नहीं की जातीं।",
    priv_col2_title: "व्यक्तिगत डेटा संग्रह नहीं",
    priv_col2_desc: "कोई आधार संख्या, फोन नंबर या निजी पता नहीं मांगा जाता। नागरिकों की गोपनीयता सर्वोच्च प्राथमिकता है।",
    priv_col3_title: "भ्रम-मुक्त सुरक्षा",
    priv_col3_desc: "AI को बिना प्रमाण के स्थान या आधिकारिक सत्यापन न गढ़ने के सख्त निर्देश हैं। अनिश्चितताओं को स्पष्ट अलग रखा जाता है।",
    priv_col4_title: "पारदर्शी सिमुलेशन",
    priv_col4_desc: "डेमो डेटा स्पष्ट रूप से चिह्नित है। किसी भी अनधिकृत सरकारी प्रेषण का झूठा दावा नहीं किया जाता।"
  }
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initHealthCheck();
  initMap();
  loadCommunityReports();
  initDropzone();
});

/**
 * Checks server health and Gemini configuration status
 */
async function initHealthCheck() {
  const badge = document.getElementById('backendStatusBadge');
  const text = document.getElementById('backendStatusText');

  try {
    const res = await fetch('/health');
    const data = await res.json();
    
    if (data.status === 'ok') {
      if (data.gemini_configured) {
        text.innerHTML = `Connected • <span class="text-teal-300 font-semibold">Gemini 2.5 Flash Live</span>`;
      } else {
        text.innerHTML = `Connected • <span class="text-amber-300 font-semibold">Local Civic Rule Engine (Demo)</span>`;
      }
    }
  } catch (err) {
    text.innerHTML = `<span class="text-rose-400">Offline / Server Reconnecting</span>`;
  }
}

/**
 * Sets UI language (en or hi) and updates DOM text
 */
function setLanguage(lang) {
  currentLanguage = lang;
  const enBtn = document.getElementById('langEnBtn');
  const hiBtn = document.getElementById('langHiBtn');

  if (lang === 'en') {
    enBtn.className = "px-2.5 py-1 rounded-md font-semibold text-white bg-brand-600 transition";
    hiBtn.className = "px-2.5 py-1 rounded-md font-medium text-slate-400 hover:text-white transition";
    document.querySelector('input[name="langSelection"][value="en"]').checked = true;
  } else {
    hiBtn.className = "px-2.5 py-1 rounded-md font-semibold text-white bg-brand-600 transition";
    enBtn.className = "px-2.5 py-1 rounded-md font-medium text-slate-400 hover:text-white transition";
    document.querySelector('input[name="langSelection"][value="hi"]').checked = true;
  }

  // Update elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[lang] && I18N[lang][key]) {
      el.textContent = I18N[lang][key];
    }
  });

  // Update placeholders
  const descInput = document.getElementById('issueDescription');
  if (lang === 'hi') {
    descInput.placeholder = "उदा. कर्वे रोड पर नल स्टॉप मेट्रो स्टेशन के पास 5 इंच गहरा गड्ढा है जिससे दोपहिया वाहनों के फिसलने का खतरा है...";
  } else {
    descInput.placeholder = "e.g. Near Nal Stop metro station on Karve Road, there is a deep 5-inch pothole causing heavy two-wheeler skids...";
  }

  // If analysis is already rendered, update letter
  if (analysisData) {
    renderComplaintLetter();
  }
}

/**
 * Auto-fills form with a selected preset scenario
 */
async function fillPreset(index) {
  const preset = DEMO_PRESETS[index];
  if (!preset) return;

  document.getElementById('issueDescription').value = preset.description;
  document.getElementById('issueLocation').value = preset.location;
  updateCharCount(document.getElementById('issueDescription'));

  // Load matching SVG sample photo
  await loadSamplePhoto(preset.samplePhoto);

  // Scroll smoothly to form
  document.getElementById('report-section').scrollIntoView({ behavior: 'smooth' });
  showToast(`Loaded ${preset.category} scenario for ${preset.location}`);
}

/**
 * Character counter for description textarea
 */
function updateCharCount(el) {
  const count = el.value.length;
  document.getElementById('charCount').textContent = `${count} / 800`;
}

/**
 * Initializes Drag & Drop for image upload
 */
function initDropzone() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('imageInput');

  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    fileInput.click();
  });

  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('border-brand-500', 'bg-brand-50/40');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-brand-500', 'bg-brand-50/40');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processSelectedFile(files[0]);
    }
  });
}

function handleFileSelect(e) {
  if (e.target.files && e.target.files.length > 0) {
    processSelectedFile(e.target.files[0]);
  }
}

function processSelectedFile(file) {
  // Validate type & size (5MB max)
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
  if (!allowed.includes(file.type)) {
    alert('Please upload a valid JPG, PNG, or WebP photo.');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds 5MB limit. Please upload a smaller image.');
    return;
  }

  currentSelectedFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('imagePreview').src = e.target.result;
    document.getElementById('previewMeta').textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    document.getElementById('uploadPrompt').classList.add('hidden');
    document.getElementById('imagePreviewContainer').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function removeImage(e) {
  if (e) e.stopPropagation();
  currentSelectedFile = null;
  document.getElementById('imageInput').value = '';
  document.getElementById('imagePreview').src = '';
  document.getElementById('uploadPrompt').classList.remove('hidden');
  document.getElementById('imagePreviewContainer').classList.add('hidden');
}

/**
 * Loads a built-in sample photo asset as a File object for testing
 */
async function loadSamplePhoto(type) {
  try {
    const filename = `${type}-sample.svg`;
    const res = await fetch(`/assets/${filename}`);
    if (!res.ok) throw new Error('Asset not found');
    const blob = await res.blob();
    const file = new File([blob], `${type}-evidence-pune.svg`, { type: 'image/svg+xml' });
    processSelectedFile(file);
  } catch (err) {
    console.error('Failed to load sample asset:', err);
  }
}

/**
 * Simulates or fetches device location in Pune
 */
function detectLocation() {
  const btn = document.getElementById('geoLocBtn');
  btn.innerHTML = `<span class="animate-spin inline-block">⏳</span> <span>Locating...</span>`;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Successful GPS
        document.getElementById('issueLocation').value = `Nal Stop, Karve Road, Kothrud (GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
        btn.innerHTML = `<span>📍</span> <span>Detected</span>`;
        showToast('Pune location tagged via GPS');
      },
      (err) => {
        // Fallback default
        document.getElementById('issueLocation').value = `Nal Stop, Karve Road, Kothrud, Pune`;
        btn.innerHTML = `<span>📍</span> <span>Detected</span>`;
        showToast('Default Pune Ward resolved');
      },
      { timeout: 4000 }
    );
  } else {
    document.getElementById('issueLocation').value = `Nal Stop, Karve Road, Kothrud, Pune`;
    btn.innerHTML = `<span>📍</span> <span>Detected</span>`;
  }
}

/**
 * STEP 2: Main Submission Handler for Multimodal AI Analysis
 */
async function handleReportSubmit(e) {
  e.preventDefault();

  const description = document.getElementById('issueDescription').value.trim();
  const location = document.getElementById('issueLocation').value.trim();
  const langRadio = document.querySelector('input[name="langSelection"]:checked');
  const language = langRadio ? langRadio.value : currentLanguage;
  const consent = document.getElementById('consentCheckbox').checked;

  if (description.length < 5) {
    alert('Please enter at least 5 characters describing the civic problem.');
    return;
  }
  if (!consent) {
    alert('Please confirm the citizen consent checkbox to proceed.');
    return;
  }

  // Loading state
  const submitBtn = document.getElementById('submitBtn');
  const submitIcon = document.getElementById('submitIcon');
  const submitSpinner = document.getElementById('submitSpinner');
  const submitText = document.getElementById('submitBtnText');
  const statusMsg = document.getElementById('formStatusMsg');

  submitBtn.disabled = true;
  submitIcon.classList.add('hidden');
  submitSpinner.classList.remove('hidden');
  submitText.textContent = language === 'hi' ? 'एआई विश्लेषण जारी है...' : 'Analyzing Civic Evidence...';
  
  statusMsg.className = "text-xs p-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 block";
  statusMsg.innerHTML = `
    <div class="flex items-center gap-2 font-semibold">
      <span class="animate-spin text-sm">🔄</span>
      <span>Inspecting visual cues, severity & Pune municipal routing...</span>
    </div>
  `;

  // Build FormData
  const formData = new FormData();
  formData.append('description', description);
  formData.append('location', location);
  formData.append('language', language);
  formData.append('consent', 'true');

  if (currentSelectedFile) {
    formData.append('image', currentSelectedFile);
  }

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Server returned an error.');
    }

    // Save active analysis in state
    analysisData = data;

    // Render results
    renderAIAnalysis(data.analysis);
    renderVerificationPanel(data.verification);
    renderComplaintLetter();

    // Show result container, hide empty state
    document.getElementById('emptyResultState').classList.add('hidden');
    document.getElementById('aiResultContainer').classList.remove('hidden');

    // Scroll to results
    document.getElementById('aiResultContainer').scrollIntoView({ behavior: 'smooth' });

    statusMsg.className = "hidden";
    showToast('AI Analysis completed successfully');

  } catch (err) {
    console.error('Analysis failed:', err);
    statusMsg.className = "text-xs p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 block";
    statusMsg.innerHTML = `<strong>Error:</strong> ${err.message}`;
  } finally {
    submitBtn.disabled = false;
    submitIcon.classList.remove('hidden');
    submitSpinner.classList.add('hidden');
    submitText.textContent = language === 'hi' ? 'मल्टीमॉडल AI विश्लेषण प्रारंभ करें' : 'Run Multimodal AI Analysis';
  }
}

/**
 * Renders structured AI analysis results
 */
function renderAIAnalysis(analysis) {
  // Attribution Banner
  const banner = document.getElementById('aiEngineBanner');
  if (analysis.isLiveGemini) {
    banner.className = "p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-900 flex flex-wrap items-center justify-between gap-2 text-xs";
    banner.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        <span class="font-bold">Live AI Inference Engine: ${analysis.engineName || 'Google Gemini 2.5 Flash'}</span>
      </div>
      <span class="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">Verified Multimodal Response</span>
    `;
  } else {
    banner.className = "p-3.5 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 flex flex-wrap items-center justify-between gap-2 text-xs";
    banner.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
        <span class="font-bold">${analysis.engineName || 'Saathi Local Civic Rule Engine (Demo Mode)'}</span>
      </div>
      <span class="text-[11px] text-amber-700">${analysis.demoNotice || 'Demo Mode Active'}</span>
    `;
  }

  // Header badges & titles
  document.getElementById('resultCategoryBadge').textContent = analysis.category;
  document.getElementById('resultSubcategory').textContent = analysis.subcategory;
  document.getElementById('resultCleanTitle').textContent = `${analysis.category} at ${document.getElementById('issueLocation').value || 'Reported Location'}`;

  // Severity Level & Bars
  const severity = Number(analysis.severity) || 3;
  const sevBar = document.getElementById('severityBar');
  sevBar.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const bar = document.createElement('div');
    bar.className = `sev-bar ${i <= severity ? `active-${severity}` : ''}`;
    sevBar.appendChild(bar);
  }
  
  const sevLabel = document.getElementById('resultSeverityLabel');
  sevLabel.textContent = `${severity}/5 — ${analysis.severityLabel || 'Hazard Rating'}`;
  if (severity >= 4) {
    sevLabel.className = "text-xs font-bold text-rose-600";
  } else if (severity === 3) {
    sevLabel.className = "text-xs font-bold text-amber-600";
  } else {
    sevLabel.className = "text-xs font-bold text-emerald-600";
  }

  document.getElementById('resultCharterSLA').textContent = `Target SLA: ${analysis.charterSLA || '48 Hours'}`;

  // Clean description
  document.getElementById('resultCleanDescription').textContent = analysis.cleanDescription;

  // Visible Evidence
  const evidenceList = document.getElementById('resultEvidenceList');
  evidenceList.innerHTML = '';
  (analysis.visibleEvidence || []).forEach(item => {
    const li = document.createElement('li');
    li.className = "flex items-start gap-2";
    li.innerHTML = `<span class="text-brand-600 font-bold">•</span><span>${item}</span>`;
    evidenceList.appendChild(li);
  });

  // Verified Facts
  const factsList = document.getElementById('resultVerifiedFacts');
  factsList.innerHTML = '';
  (analysis.factsVerified || []).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    factsList.appendChild(li);
  });

  // Uncertainties
  const uncertaintiesList = document.getElementById('resultUncertainties');
  uncertaintiesList.innerHTML = '';
  (analysis.uncertainties || []).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    uncertaintiesList.appendChild(li);
  });

  // Suggested Authority
  document.getElementById('resultAuthorityName').textContent = analysis.suggestedAuthority;
  document.getElementById('resultAuthorityContact').textContent = analysis.authorityContact || 'PMC Care Portal: pmc.gov.in | Helpline: 1800-1030-222';

  // Confidence
  const confScore = analysis.confidenceScore || 85;
  document.getElementById('resultConfidenceScore').textContent = `${confScore}%`;
  document.getElementById('resultConfidenceBar').style.width = `${confScore}%`;
  document.getElementById('resultConfidenceExplanation').textContent = analysis.confidenceExplanation || 'Score based on consistency of textual and spatial indicators.';
}

/**
 * STEP 3: Renders Evidence Verification & Geo-Proximity Panel
 */
function renderVerificationPanel(verification) {
  if (!verification) return;

  document.getElementById('verificationScore').textContent = `${verification.verificationScore}%`;
  document.getElementById('verificationStatusText').textContent = verification.statusText;

  // Supporting Evidence list
  const evList = document.getElementById('verificationEvidenceList');
  evList.innerHTML = '';
  (verification.supportingEvidence || []).forEach(ev => {
    const li = document.createElement('li');
    li.textContent = ev;
    evList.appendChild(li);
  });

  // Matching Reports in Proximity
  const reportsList = document.getElementById('matchingReportsList');
  reportsList.innerHTML = '';

  if (verification.matchingReports && verification.matchingReports.length > 0) {
    verification.matchingReports.forEach(report => {
      const card = document.createElement('div');
      card.className = "p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3";
      card.innerHTML = `
        <div>
          <div class="font-bold text-slate-900">${report.title}</div>
          <div class="text-[11px] text-slate-500">${report.location} • <span class="font-semibold text-brand-700">${report.distanceLabel}</span></div>
        </div>
        <div class="text-right shrink-0">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            ${report.matchScore}% Correlation
          </span>
          <div class="text-[10px] text-slate-400 mt-0.5">Status: ${report.status}</div>
        </div>
      `;
      reportsList.appendChild(card);
    });
  } else {
    reportsList.innerHTML = `
      <div class="p-3 rounded-xl bg-slate-50 text-slate-500 text-xs italic">
        No immediate demonstration reports found within 200m radius. This appears to be a unique or newly reported civic issue in this sector.
      </div>
    `;
  }
}

/**
 * STEP 4 & 5: Renders Action Plan Checklist and Generated Complaint Letter
 */
function renderComplaintLetter() {
  if (!analysisData || !analysisData.analysis) return;
  const analysis = analysisData.analysis;

  // Next steps checklist
  const actionsList = document.getElementById('recommendedActionsList');
  actionsList.innerHTML = '';
  (analysis.recommendedActions || []).forEach((act, idx) => {
    const div = document.createElement('div');
    div.className = "flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100";
    div.innerHTML = `
      <span class="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
      <span>${act}</span>
    `;
    actionsList.appendChild(div);
  });

  // Complaint Letter Text
  const letterEl = document.getElementById('complaintLetterContent');
  if (currentLetterLang === 'hi' && analysis.complaintLetterHindi) {
    letterEl.textContent = analysis.complaintLetterHindi;
  } else {
    letterEl.textContent = analysis.complaintLetterEnglish;
  }
}

/**
 * Toggles complaint letter language between English and Hindi
 */
function switchLetterLang(lang) {
  currentLetterLang = lang;
  const enBtn = document.getElementById('letterLangEn');
  const hiBtn = document.getElementById('letterLangHi');

  if (lang === 'en') {
    enBtn.className = "px-2.5 py-1 rounded font-bold bg-white text-brand-700 shadow-xs";
    hiBtn.className = "px-2.5 py-1 rounded font-medium text-slate-600 hover:text-slate-900";
  } else {
    hiBtn.className = "px-2.5 py-1 rounded font-bold bg-white text-brand-700 shadow-xs";
    enBtn.className = "px-2.5 py-1 rounded font-medium text-slate-600 hover:text-slate-900";
  }
  renderComplaintLetter();
}

/**
 * Copies complaint letter text to clipboard
 */
async function copyLetterToClipboard() {
  const content = document.getElementById('complaintLetterContent').textContent;
  try {
    await navigator.clipboard.writeText(content);
    const label = document.getElementById('copyBtnLabel');
    label.textContent = "Copied to Clipboard!";
    showToast("Complaint letter copied to clipboard!");
    setTimeout(() => {
      label.textContent = currentLanguage === 'hi' ? "पत्र कॉपी करें" : "Copy to Clipboard";
    }, 2500);
  } catch (err) {
    showToast("Unable to copy automatically. Please select text manually.");
  }
}

/**
 * Downloads complaint letter as a .txt file
 */
function downloadLetterTxt() {
  const content = document.getElementById('complaintLetterContent').textContent;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PMC_Civic_Complaint_Letter_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Letter downloaded as text file.");
}

/**
 * STEP 6: Simulated Demonstration Submission to Civic Desk
 */
async function submitDemoReport() {
  if (!analysisData || !analysisData.analysis) {
    alert("Please analyze a report first before submitting.");
    return;
  }

  const analysis = analysisData.analysis;
  const description = document.getElementById('issueDescription').value.trim();
  const location = document.getElementById('issueLocation').value.trim();

  const payload = {
    category: analysis.category,
    subcategory: analysis.subcategory,
    title: `${analysis.category} - ${location || 'Pune Ward'}`,
    description,
    location,
    severity: analysis.severity,
    authority: analysis.suggestedAuthority,
    complaintLetter: currentLetterLang === 'hi' ? analysis.complaintLetterHindi : analysis.complaintLetterEnglish
  };

  const btn = document.getElementById('demoSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = `<span class="animate-spin inline-block">🔄</span> <span>Recording Demo...</span>`;

  try {
    const res = await fetch('/api/submit-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Submission failed');

    // Show success confirmation
    const successBox = document.getElementById('submissionSuccessBox');
    document.getElementById('demoTrackingIdBadge').textContent = data.trackingId;
    successBox.classList.remove('hidden');

    btn.innerHTML = `<span>✓</span> <span>Recorded (${data.trackingId})</span>`;
    btn.className = "px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs sm:text-sm";

    showToast(`Report logged with tracking ID: ${data.trackingId}`);

    // Refresh community reports list & map
    loadCommunityReports();

  } catch (err) {
    alert(`Submission error: ${err.message}`);
    btn.disabled = false;
    btn.innerHTML = `<span>Submit Report (Demonstration)</span>`;
  }
}

/**
 * Initializes Leaflet Map of Pune
 */
function initMap() {
  const puneCenter = [18.5204, 73.8567]; // Pune Coordinates
  mapInstance = L.map('puneMap').setView(puneCenter, 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance);
}

/**
 * Loads seeded demonstration reports from backend and places markers on the map
 */
async function loadCommunityReports() {
  try {
    const res = await fetch('/api/reports');
    const data = await res.json();
    if (data.success && data.reports) {
      allReportsCache = data.reports;
      renderReportsGrid(allReportsCache);
      renderMapMarkers(allReportsCache);
      document.getElementById('countAll').textContent = allReportsCache.length;
    }
  } catch (err) {
    console.error('Failed to load reports:', err);
  }
}

/**
 * Renders interactive pins on the Leaflet map
 */
function renderMapMarkers(reports) {
  if (!mapInstance) return;

  // Clear existing markers
  mapMarkers.forEach(m => mapInstance.removeLayer(m));
  mapMarkers = [];

  reports.forEach(report => {
    if (!report.coordinates) return;

    const { lat, lng } = report.coordinates;
    const sev = report.severity || 3;

    // Pick emoji by category
    let emoji = '📍';
    if (report.category.includes('Pothole')) emoji = '🕳️';
    else if (report.category.includes('Garbage')) emoji = '🗑️';
    else if (report.category.includes('Streetlight')) emoji = '💡';
    else if (report.category.includes('Water')) emoji = '💧';

    const customIcon = L.divIcon({
      className: `custom-civic-marker marker-sev-${sev} ${sev === 5 ? 'pulse-sev-5' : ''}`,
      html: `<span>${emoji}</span>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance);

    const popupHtml = `
      <div class="space-y-1.5 text-xs">
        <div class="flex items-center justify-between gap-2">
          <span class="font-bold text-slate-900">${report.category}</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Sev ${sev}/5</span>
        </div>
        <div class="font-semibold text-slate-800">${report.title}</div>
        <div class="text-[11px] text-slate-500">📍 ${report.location}</div>
        <div class="text-[11px] text-slate-600 line-clamp-2">${report.description}</div>
        <div class="pt-1 flex items-center justify-between text-[10px]">
          <span class="text-teal-700 font-bold">Status: ${report.status}</span>
          <span class="text-slate-400">DEMO RECORD</span>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    mapMarkers.push(marker);
  });
}

/**
 * Filters reports grid and map by category
 */
function filterReports(cat) {
  // Update active tab
  document.querySelectorAll('.filter-tab').forEach(tab => {
    if (tab.getAttribute('data-cat') === cat) {
      tab.classList.add('active', 'bg-brand-50', 'text-brand-700', 'font-bold');
      tab.classList.remove('text-slate-600');
    } else {
      tab.classList.remove('active', 'bg-brand-50', 'text-brand-700', 'font-bold');
      tab.classList.add('text-slate-600');
    }
  });

  let filtered = allReportsCache;
  if (cat !== 'All') {
    filtered = allReportsCache.filter(r => r.category.toLowerCase().includes(cat.toLowerCase()));
  }

  renderReportsGrid(filtered);
  renderMapMarkers(filtered);
}

/**
 * Renders community report cards in grid
 */
function renderReportsGrid(reports) {
  const grid = document.getElementById('reportsGrid');
  const countEl = document.getElementById('filteredCount');
  countEl.textContent = reports.length;
  grid.innerHTML = '';

  reports.forEach(report => {
    let icon = '📍';
    let catColor = 'bg-slate-100 text-slate-800';
    if (report.category.includes('Pothole')) {
      icon = '🕳️';
      catColor = 'bg-amber-100 text-amber-800';
    } else if (report.category.includes('Garbage')) {
      icon = '🗑️';
      catColor = 'bg-emerald-100 text-emerald-800';
    } else if (report.category.includes('Streetlight')) {
      icon = '💡';
      catColor = 'bg-blue-100 text-blue-800';
    } else if (report.category.includes('Water')) {
      icon = '💧';
      catColor = 'bg-cyan-100 text-cyan-800';
    }

    const card = document.createElement('div');
    card.className = "bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between";
    card.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${catColor}">
            <span>${icon}</span>
            <span>${report.category}</span>
          </span>
          <span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            DEMO DATA
          </span>
        </div>

        <h4 class="font-heading font-bold text-sm text-slate-900 line-clamp-1">${report.title}</h4>
        <p class="text-xs text-slate-500 line-clamp-2">${report.description}</p>
      </div>

      <div class="pt-3 border-t border-slate-100 space-y-2 text-xs">
        <div class="flex items-center justify-between text-slate-500 text-[11px]">
          <span>📍 ${report.location}</span>
          <span class="font-bold text-slate-700">Sev ${report.severity}/5</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-brand-700">${report.status}</span>
          <button type="button" onclick="focusOnReport('${report.id}')" class="text-[11px] font-semibold text-brand-600 hover:text-brand-800">
            Show on Map ↗
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

/**
 * Focuses map onto specific report marker
 */
function focusOnReport(id) {
  const report = allReportsCache.find(r => r.id === id);
  if (!report || !report.coordinates || !mapInstance) return;

  mapInstance.setView([report.coordinates.lat, report.coordinates.lng], 15);
  document.getElementById('community-section').scrollIntoView({ behavior: 'smooth' });

  // Open corresponding popup
  const marker = mapMarkers.find(m => {
    const latLng = m.getLatLng();
    return Math.abs(latLng.lat - report.coordinates.lat) < 0.0001 && Math.abs(latLng.lng - report.coordinates.lng) < 0.0001;
  });
  if (marker) marker.openPopup();
}

/**
 * Displays floating toast notification
 */
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  toastMsg.textContent = msg;
  toast.classList.add('toast-visible');
  setTimeout(() => {
    toast.classList.remove('toast-visible');
  }, 3500);
}
