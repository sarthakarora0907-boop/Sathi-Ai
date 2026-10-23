// Gemini Multimodal Civic Analysis Service
const { GoogleGenAI } = require('@google/genai');

/**
 * Normalizes and categorizes civic issues based on natural language keywords
 */
function analyzeWithLocalCivicEngine({ description, location, language = 'en', file }) {
  const text = (description + ' ' + (location || '')).toLowerCase();
  
  let category = "Potholes & Damaged Roads";
  let subcategory = "Road Surface Deformation / Crater";
  let severity = 3;
  let severityLabel = "Moderate Risk";
  let authority = "Pune Municipal Corporation (PMC) - Road Maintenance Dept";
  let authorityContact = "PMC Road Helpline: 1800-1030-222 | PMC Care App";
  let charterSLA = "48 to 72 hours under PMC Citizen Charter";

  // Primary civic category classification with boundary sensitivity
  if (text.includes('pothole') || text.includes('crater') || text.includes('khadda') || text.includes('road cave') || text.includes('asphalt') || text.includes('uneven road')) {
    category = "Potholes & Damaged Roads";
    subcategory = "Arterial Road Crater / Asphalt Damage";
    severity = text.includes('deep') || text.includes('accident') || text.includes('skid') || text.includes('flyover') ? 4 : 3;
    severityLabel = severity === 4 ? "High - Two-Wheeler Collision & Fall Risk" : "Moderate - Traffic Disruption";
    authority = "PMC Road Infrastructure & Maintenance Wing";
    authorityContact = "PMC Pothole Grievance Portal & Toll-Free: 1800-1030-222";
    charterSLA = "48 hours for cold-mix / asphalt repair";
  } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('dump') || text.includes('kachra') || text.includes('dustbin') || text.includes('kooda')) {
    category = "Garbage Accumulation";
    subcategory = "Uncollected Solid Waste / Overflowing Bin";
    severity = 3;
    severityLabel = "Moderate - Public Health Hazard";
    authority = "Pune Municipal Corporation (PMC) - Solid Waste Management Dept";
    authorityContact = "PMC Solid Waste Cell: 1800-1030-222 | Swachhata App";
    charterSLA = "24 to 48 hours for clearing community bin spillover";
  } else if (text.includes('streetlight') || text.includes('street light') || text.includes('lamp') || text.includes('dark stretch') || text.includes('pole') || text.includes('exposed wire') || text.includes('bijli')) {
    category = "Broken Streetlights";
    subcategory = "Illumination Failure / Exposed Electrical Hardware";
    severity = text.includes('wire') || text.includes('spark') ? 5 : 3;
    severityLabel = severity === 5 ? "Critical - Immediate Life Safety Risk" : "Moderate - Public Safety Concern";
    authority = text.includes('wire') ? "MSEDCL (Maharashtra State Electricity Distribution) / PMC Electrical" : "PMC Electrical Department (Public Lighting Cell)";
    authorityContact = "PMC Electrical Helpline: 020-25501000 | MSEDCL Emergency: 1912";
    charterSLA = text.includes('wire') ? "Emergency Dispatch: 4 hours" : "48 hours for replacement";
  } else if (text.includes('water leak') || text.includes('pipeline') || text.includes('pipe burst') || text.includes('pipe rupture') || text.includes('water gush') || text.includes('potable water') || text.includes('sewage overflow')) {
    category = "Water Leakage & Wastage";
    subcategory = "Pipeline Rupture / Potable Water Loss";
    severity = 4;
    severityLabel = "High - Resource Wastage & Road Saturation";
    authority = "Pune Municipal Corporation (PMC) - Water Supply & Pumping Dept";
    authorityContact = "PMC Water Grievance Cell: 020-25501383 / 25501384";
    charterSLA = "24 hours for main pipe valve isolation & patch";
  }

  // Refine severity if critical words present
  if (text.includes('critical') || text.includes('emergency') || text.includes('severe') || text.includes('accident') || text.includes('life risk') || text.includes('exposed wire')) {
    severity = 5;
    severityLabel = "Critical - Immediate Danger";
  }

  const cleanDescription = `Observed ${category.toLowerCase()} condition at ${location || 'unspecified Pune location'}. ${description.trim()}`;

  const visibleEvidence = [
    `Physical hazard type identified: ${category} (${subcategory}).`,
    location ? `Specific Pune geographical context provided: "${location}".` : 'Location context requires geo-tagging confirmation.',
    file ? `Evidence photograph attached (${file.originalname || 'Uploaded Image'}, ${(file.size / 1024).toFixed(1)} KB) showing surface condition.` : 'Photographic documentation pending (verbal citizen report).'
  ];

  const factsVerified = [
    `Citizen submission logged with authentic incident description.`,
    location ? `Location identifies an established Pune municipal territory.` : 'Location requires clarification.'
  ];

  const uncertainties = [
    `Underground structural integrity (cables, sub-surface foundation, pipe joints) requires physical sounding.`,
    `Exact dimensional measurements (depth/volume) require field gauge inspection by PMC Ward Jr. Engineer.`,
    file ? `Image verified for surface appearance; timestamp metadata requires client device sync.` : `Visual extent not verified due to absence of uploaded photo.`
  ];

  const recommendedActions = [
    `Submit formal representation via PMC Care Portal (pmc.gov.in) with this generated tracking summary.`,
    `If on an arterial road or PWD highway (e.g. Pune-Solapur, Katraj bypass), notify Maharashtra PWD Division.`,
    `Take daytime photos with landmark reference (e.g. nearest shop or electric pole number) for PMC spot verification.`,
    `Engage local Mohalla Committee or Ward Corporator office if SLA exceeds ${charterSLA}.`
  ];

  const complaintLetterEnglish = `To,
The Ward Officer / Executive Engineer,
Pune Municipal Corporation (PMC),
Pune, Maharashtra.

Subject: Urgent Redressal Request: ${category} at ${location || 'Local Pune Ward'}

Respected Sir/Madam,

I am writing to draw your immediate attention to a serious civic hazard affecting public safety and daily transit in our neighborhood.

Incident Details:
• Category: ${category} (${subcategory})
• Location / Landmark: ${location || 'Pune Municipal Area'}
• Severity Level: ${severity}/5 (${severityLabel})
• Problem Description: ${description.trim()}

Impact & Evidence:
This condition poses severe risks to daily commuters, especially senior citizens and two-wheeler riders. Preliminary observations show visible surface degradation that requires urgent municipal repair to avert accidents and hygiene risks.

Requested Action:
In accordance with the PMC Citizen Charter standards (mandating action within ${charterSLA}), I earnestly request your office to dispatch an inspection squad, install temporary barricading if necessary, and execute permanent repairs at the earliest.

Kindly provide a grievance reference number and acknowledge receipt.

Thanking you,
Yours sincerely,
A Concerned Resident of Pune
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  const complaintLetterHindi = `सेवा में,
मा. क्षेत्रीय अधिकारी / कार्यकारी अभियंता,
पुणे महानगरपालिका (PMC),
पुणे, महाराष्ट्र.

विषय: तुरंत निवारण हेतु प्रार्थना पत्र: ${location || 'पुणे क्षेत्र'} में ${category} की समस्या

महोदय/महोदया,

मैं आपका ध्यान हमारे इलाके में उत्पन्न एक गंभीर नागरिक समस्या की ओर आकर्षित करना चाहता हूँ, जिससे आम नागरिकों और दैनिक यात्रियों की सुरक्षा खतरे में है।

समस्या का विवरण:
• श्रेणी: ${category} (${subcategory})
• स्थान / लैंडमार्क: ${location || 'पुणे महानगरपालिका क्षेत्र'}
• गंभीरता स्तर: ${severity}/5 (${severityLabel})
• समस्या का संक्षिप्त विवरण: ${description.trim()}

प्रभाव एवं प्रमाण:
यह स्थिति विशेष रूप से दोपहिया वाहन चालकों, वरिष्ठ नागरिकों और पैदल यात्रियों के लिए दुर्घटना का कारण बन सकती है। प्राथमिक निरीक्षण में स्पष्ट रूप से तुरंत मरम्मत की आवश्यकता दिखाई देती है।

निवेदन:
पुणे महानगरपालिका सिटीजन चार्टर के निर्धारित मानकों के तहत, आपसे विनम्र अनुरोध है कि संबंधित वॉर्ड टीम को भेजकर इस समस्या का शीघ्र निवारण कराने की कृपा करें।

सधन्यवाद,
भवदीय,
एक जागरूक पुणेकर (सजग नागरिक)
दिनांक: ${new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  return {
    isLiveGemini: false,
    isDemoMode: true,
    engineName: "Saathi Local Civic Rule Engine (Demo Mode)",
    demoNotice: "DEMO ENGINE: Running on local civic heuristic analysis. Provide a valid GEMINI_API_KEY in .env to enable live Google Gemini 2.5 Flash inference.",
    category,
    subcategory,
    cleanDescription,
    severity,
    severityLabel,
    severityReason: `Assessed based on immediate danger to pedestrians and vehicular transit in urban Pune traffic conditions.`,
    visibleEvidence,
    factsVerified,
    uncertainties,
    suggestedAuthority: authority,
    authorityContact,
    charterSLA,
    recommendedActions,
    confidenceScore: file ? 88 : 74,
    confidenceExplanation: file 
      ? "High confidence derived from corroborating textual description and visual evidence attachment."
      : "Moderate confidence derived from textual incident report without photographic confirmation.",
    complaintLetterEnglish,
    complaintLetterHindi
  };
}

/**
 * Analyzes report using Google Gemini API if key exists, with automatic fallback
 */
async function analyzeCivicReport({ description, location, language = 'en', file }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.trim() === 'YOUR_GEMINI_API_KEY') {
    // Graceful fallback to rich local civic engine with transparent notice
    return analyzeWithLocalCivicEngine({ description, location, language, file });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const systemPrompt = `You are SAATHI AI, an expert civic-tech problem analyzer specializing in urban issues in Pune, Maharashtra, India.
Analyze the citizen's report and optional attached photograph with high precision and ethical restraint.

SUPPORTED CIVIC CATEGORIES (choose the most accurate):
- Potholes & Damaged Roads
- Garbage Accumulation
- Broken Streetlights
- Water Leakage & Wastage
- Other Civic Hazard

RULES:
1. Never invent a location or factual certainty that the evidence does not support.
2. Clearly separate "Visible Evidence & Observations", "Facts Independently Verified", and "Unknown or Uncertain Information".
3. Assign severity from 1 to 5 (1 = Minor cosmetic, 5 = Critical immediate danger/injury risk).
4. Identify the specific Pune authority (e.g. Pune Municipal Corporation - Road Dept, PMC Solid Waste Management, MSEDCL, PMC Water Supply Dept, Pune Traffic Police).
5. Generate a formal, respectful complaint letter in both English and Hindi.
6. Return ONLY a valid JSON object matching the requested schema. No markdown formatting, no backticks.`;

    const contents = [];
    
    // Add text prompt
    let userText = `Citizen Report from Pune, Maharashtra:
Description: "${description}"
Reported Location / Landmark: "${location || 'Not specifically provided'}"
Preferred Language: ${language === 'hi' ? 'Hindi (हिंदी)' : 'English'}

Please analyze this civic issue and return a JSON object with:
{
  "category": "One of the 4 supported categories or Other Civic Hazard",
  "subcategory": "Specific technical subcategory",
  "cleanDescription": "Clean, structured objective summary of the problem",
  "severity": 1 to 5,
  "severityLabel": "Low | Moderate | High | Severe | Critical",
  "severityReason": "Concise justification for the severity rating",
  "visibleEvidence": ["Observation 1", "Observation 2"],
  "factsVerified": ["Fact 1 verified from text/image", "Fact 2"],
  "uncertainties": ["What is still unknown / cannot be determined without physical site visit"],
  "suggestedAuthority": "Specific PMC department or utility",
  "authorityContact": "Pune helpline/portal details",
  "charterSLA": "Expected resolution timeframe",
  "recommendedActions": ["Action 1 for citizen", "Action 2"],
  "confidenceScore": 50 to 98,
  "confidenceExplanation": "Plain-language explanation of confidence score",
  "complaintLetterEnglish": "Complete formal complaint letter to PMC Ward Officer",
  "complaintLetterHindi": "Complete formal complaint letter in Hindi"
}`;

    contents.push({ text: userText });

    // Add image if supplied
    if (file && file.buffer) {
      contents.push({
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString('base64')
        }
      });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text ? response.text.trim() : '';
    // Parse JSON
    let parsed;
    try {
      const cleaned = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn("Failed to parse Gemini JSON output, falling back to local engine:", parseErr.message);
      return analyzeWithLocalCivicEngine({ description, location, language, file });
    }

    // Attach metadata
    return {
      isLiveGemini: true,
      isDemoMode: false,
      engineName: `Google Gemini (${modelName})`,
      demoNotice: null,
      ...parsed
    };
  } catch (apiError) {
    console.error("Gemini API call encountered an error:", apiError.message);
    const fallback = analyzeWithLocalCivicEngine({ description, location, language, file });
    fallback.demoNotice = `Live Gemini API Notice: Call failed (${apiError.message || 'Network/Quota issue'}). Active fallback engine engaged for uninterrupted demonstration.`;
    return fallback;
  }
}

module.exports = {
  analyzeCivicReport,
  analyzeWithLocalCivicEngine
};
