// Evidence verification and geo-spatial cluster matching for civic reports in Pune
const { sampleReports } = require('../data/sampleReports');

// Known coordinates for common Pune localities
const PUNE_LOCALITY_COORDINATES = {
  "kothrud": { lat: 18.5074, lng: 73.8077 },
  "nal stop": { lat: 18.5089, lng: 73.8268 },
  "karve road": { lat: 18.5050, lng: 73.8200 },
  "viman nagar": { lat: 18.5679, lng: 73.9143 },
  "baner": { lat: 18.5590, lng: 73.7868 },
  "balewadi": { lat: 18.5726, lng: 73.7717 },
  "katraj": { lat: 18.4575, lng: 73.8677 },
  "kondhwa": { lat: 18.4750, lng: 73.8900 },
  "shivaji nagar": { lat: 18.5204, lng: 73.8415 },
  "fc road": { lat: 18.5204, lng: 73.8415 },
  "deccan": { lat: 18.5167, lng: 73.8447 },
  "hinjewadi": { lat: 18.5912, lng: 73.7389 },
  "hadapsar": { lat: 18.5089, lng: 73.9260 },
  "kalyani nagar": { lat: 18.5463, lng: 73.9033 },
  "aundh": { lat: 18.5580, lng: 73.8077 },
  "swargate": { lat: 18.5018, lng: 73.8587 },
  "kasba peth": { lat: 18.5196, lng: 73.8553 },
  "camp": { lat: 18.5126, lng: 73.8786 },
  "koregaon park": { lat: 18.5362, lng: 73.8940 },
  "wakad": { lat: 18.5987, lng: 73.7660 }
};

/**
 * Calculates Haversine distance in meters between two lat/lng pairs
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}

/**
 * Extracts approximate coordinates from location string if not explicitly supplied
 */
function resolveCoordinates(locationStr, inputCoords) {
  if (inputCoords && typeof inputCoords.lat === 'number' && typeof inputCoords.lng === 'number') {
    return inputCoords;
  }
  if (!locationStr) return null;
  
  const lower = locationStr.toLowerCase();
  for (const [locality, coords] of Object.entries(PUNE_LOCALITY_COORDINATES)) {
    if (lower.includes(locality)) {
      return coords;
    }
  }
  return null;
}

/**
 * Verifies a citizen report against demo community records
 */
function verifyReportAgainstDataset(report, allReports = sampleReports) {
  const { description = '', location = '', category = '', coordinates: inputCoords = null } = report;
  const resolvedCoords = resolveCoordinates(location, inputCoords);
  const normalizedDesc = description.toLowerCase();
  const normalizedCat = category.toLowerCase();

  const matchedReports = [];
  let proximityMatchCount = 0;
  let categoryMatchCount = 0;
  let keywordMatchCount = 0;

  // Extract key terms
  const keywords = normalizedDesc
    .replace(/[^\w\s]/gi, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !['with', 'from', 'have', 'near', 'this', 'that', 'road', 'pune'].includes(word));

  for (const demoReport of allReports) {
    let matchScore = 0;
    let distanceMeters = null;
    let distanceLabel = 'Distance unknown';

    // 1. Geo-spatial proximity check
    if (resolvedCoords && demoReport.coordinates) {
      distanceMeters = calculateHaversineDistance(
        resolvedCoords.lat,
        resolvedCoords.lng,
        demoReport.coordinates.lat,
        demoReport.coordinates.lng
      );

      if (distanceMeters <= 200) {
        matchScore += 45;
        proximityMatchCount++;
        distanceLabel = `${distanceMeters}m away (Immediate Vicinity <200m)`;
      } else if (distanceMeters <= 1000) {
        matchScore += 25;
        distanceLabel = `${(distanceMeters / 1000).toFixed(1)}km away (Same Neighborhood)`;
      } else if (distanceMeters <= 3000) {
        matchScore += 10;
        distanceLabel = `${(distanceMeters / 1000).toFixed(1)}km away (Adjacent Ward)`;
      } else {
        distanceLabel = `${(distanceMeters / 1000).toFixed(1)}km away`;
      }
    } else if (location && demoReport.location.toLowerCase().includes(location.toLowerCase())) {
      matchScore += 20;
      distanceLabel = 'Same reported locality';
    }

    // 2. Category match
    if (normalizedCat && demoReport.category.toLowerCase().includes(normalizedCat)) {
      matchScore += 30;
      categoryMatchCount++;
    }

    // 3. Keyword / text match
    let sharedKeywords = 0;
    const demoDesc = demoReport.description.toLowerCase();
    for (const kw of keywords) {
      if (demoDesc.includes(kw)) {
        sharedKeywords++;
      }
    }
    if (sharedKeywords > 0) {
      const keywordScore = Math.min(25, sharedKeywords * 8);
      matchScore += keywordScore;
      keywordMatchCount++;
    }

    if (matchScore >= 35) {
      matchedReports.push({
        id: demoReport.id,
        title: demoReport.title,
        category: demoReport.category,
        location: demoReport.location,
        status: demoReport.status,
        severity: demoReport.severity,
        distanceMeters,
        distanceLabel,
        matchScore: Math.min(100, matchScore),
        isDemo: true
      });
    }
  }

  // Sort by highest match score
  matchedReports.sort((a, b) => b.matchScore - a.matchScore);

  // Compute overall verification confidence
  let overallScore = 0;
  let statusText = 'Single Independent Report';

  if (matchedReports.length > 0) {
    const topMatch = matchedReports[0];
    overallScore = Math.min(94, Math.round(topMatch.matchScore * 0.8 + Math.min(matchedReports.length * 5, 20)));
    
    if (proximityMatchCount > 0) {
      statusText = `Corroborated by ${matchedReports.length} Nearby Demo Report(s) within 200m–1km`;
    } else {
      statusText = `Pattern Matches ${matchedReports.length} Demo Record(s) in Pune`;
    }
  } else {
    overallScore = 45; // Baseline confidence for novel, unverified single citizen report
    statusText = 'Uncorrelated Report (First report in this specific zone)';
  }

  // Supporting evidence breakdown
  const supportingEvidence = [];
  if (resolvedCoords) {
    supportingEvidence.push(`Geo-coordinates resolved to (${resolvedCoords.lat.toFixed(4)}, ${resolvedCoords.lng.toFixed(4)}) in Pune municipal area.`);
  }
  if (proximityMatchCount > 0) {
    supportingEvidence.push(`${proximityMatchCount} existing demonstration report(s) found within immediate vicinity (<1km).`);
  }
  if (categoryMatchCount > 0) {
    supportingEvidence.push(`Civic classification aligned with active Municipal Service category.`);
  }
  if (matchedReports.length > 0) {
    supportingEvidence.push(`Corroborating hazard reports show similar impact patterns in the neighborhood.`);
  } else {
    supportingEvidence.push(`Report provides specific Pune locality context suitable for ward dispatch.`);
  }

  // Uncertainties and gaps that still require physical ground verification
  const uncertainties = [
    'Sub-surface damage extent (drainage lines, tarmac foundation) cannot be verified from photographs alone.',
    'Exact measurements (depth, cubic volume of waste, voltage status) require PMC field engineer inspection.',
    'Demonstration matching records are simulated hackathon data and do not constitute an official PMC verification certification.'
  ];

  return {
    verificationScore: overallScore,
    statusText,
    proximityMatchCount,
    matchingReports: matchedReports.slice(0, 3),
    totalMatchesFound: matchedReports.length,
    supportingEvidence,
    uncertainties,
    isDemonstrationNotice: "DEMO DATA: Match calculations use seeded Pune civic records for hackathon demonstration. They do not constitute official government verification."
  };
}

module.exports = {
  verifyReportAgainstDataset,
  calculateHaversineDistance,
  resolveCoordinates,
  PUNE_LOCALITY_COORDINATES
};
