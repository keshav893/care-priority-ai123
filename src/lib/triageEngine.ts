/**
 * TriageAI Engine — Client-side healthcare triage scoring system.
 * Uses rule-based NLP keyword matching and vital sign analysis
 * to simulate ML-based severity prediction.
 */

// ── Types ──────────────────────────────────────────────────────

export interface PatientInput {
  age: number;
  symptoms: string;
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  oxygenLevel: number;
  temperature: number;
  medicalHistory?: string;
}

export type PriorityLevel = "Critical" | "High" | "Medium" | "Low";

export interface TriageResult {
  priorityLevel: PriorityLevel;
  riskScore: number; // 0–100
  possibleConditions: string[];
  recommendedAction: string;
  explanations: ExplanationFactor[];
}

export interface ExplanationFactor {
  factor: string;
  impact: "high" | "medium" | "low";
  detail: string;
}

// ── Symptom Knowledge Base ─────────────────────────────────────

interface SymptomEntry {
  keywords: string[];
  severity: number; // 0–30
  conditions: string[];
}

const SYMPTOM_DB: SymptomEntry[] = [
  { keywords: ["chest pain", "chest tightness", "chest pressure"], severity: 28, conditions: ["Acute Coronary Syndrome", "Angina", "Myocardial Infarction"] },
  { keywords: ["difficulty breathing", "shortness of breath", "dyspnea", "can't breathe", "gasping"], severity: 27, conditions: ["Respiratory Distress", "Pneumonia", "Pulmonary Embolism", "Asthma Exacerbation"] },
  { keywords: ["stroke", "slurred speech", "facial drooping", "arm weakness"], severity: 30, conditions: ["Cerebrovascular Accident (Stroke)", "TIA"] },
  { keywords: ["unconscious", "unresponsive", "passed out", "fainted", "syncope"], severity: 29, conditions: ["Syncope", "Cardiac Arrest", "Seizure"] },
  { keywords: ["seizure", "convulsion", "fitting"], severity: 26, conditions: ["Epileptic Seizure", "Febrile Seizure"] },
  { keywords: ["severe bleeding", "hemorrhage", "heavy bleeding"], severity: 28, conditions: ["Hemorrhage", "Trauma"] },
  { keywords: ["allergic reaction", "anaphylaxis", "swelling throat", "hives"], severity: 25, conditions: ["Anaphylaxis", "Severe Allergic Reaction"] },
  { keywords: ["headache", "migraine", "head pain"], severity: 10, conditions: ["Migraine", "Tension Headache", "Meningitis"] },
  { keywords: ["fever", "chills", "high temperature"], severity: 12, conditions: ["Infection", "Influenza", "COVID-19"] },
  { keywords: ["nausea", "vomiting", "throwing up"], severity: 8, conditions: ["Gastroenteritis", "Food Poisoning", "Appendicitis"] },
  { keywords: ["abdominal pain", "stomach pain", "belly pain"], severity: 14, conditions: ["Appendicitis", "Gastritis", "Kidney Stones"] },
  { keywords: ["dizziness", "vertigo", "lightheaded"], severity: 11, conditions: ["Vertigo", "Dehydration", "Anemia"] },
  { keywords: ["cough", "sore throat", "congestion", "runny nose"], severity: 5, conditions: ["Upper Respiratory Infection", "Common Cold", "Flu"] },
  { keywords: ["rash", "skin irritation", "itching"], severity: 4, conditions: ["Dermatitis", "Allergic Reaction", "Eczema"] },
  { keywords: ["back pain", "joint pain", "muscle pain"], severity: 6, conditions: ["Musculoskeletal Pain", "Sciatica", "Arthritis"] },
  { keywords: ["fracture", "broken bone", "deformity"], severity: 18, conditions: ["Fracture", "Dislocation"] },
  { keywords: ["burn", "scalded"], severity: 16, conditions: ["Burn Injury"] },
  { keywords: ["diabetic", "high blood sugar", "low blood sugar", "hypoglycemia"], severity: 15, conditions: ["Diabetic Emergency", "Hypoglycemia", "DKA"] },
  { keywords: ["suicidal", "self harm", "want to die"], severity: 30, conditions: ["Mental Health Crisis"] },
  { keywords: ["confusion", "disoriented", "altered mental status"], severity: 22, conditions: ["Delirium", "Stroke", "Metabolic Disorder"] },
];

const HISTORY_RISK: Record<string, number> = {
  "heart disease": 8, "cardiac": 8, "hypertension": 6, "diabetes": 6,
  "asthma": 5, "copd": 7, "cancer": 7, "stroke": 8, "kidney disease": 6,
  "liver disease": 5, "immunocompromised": 7, "hiv": 6, "transplant": 7,
};

// ── Scoring Functions ──────────────────────────────────────────

function scoreVitals(input: PatientInput): { score: number; explanations: ExplanationFactor[] } {
  let score = 0;
  const explanations: ExplanationFactor[] = [];

  // Heart rate
  if (input.heartRate > 120 || input.heartRate < 50) {
    score += 20;
    explanations.push({ factor: "Heart Rate", impact: "high", detail: `${input.heartRate} bpm is critically abnormal (normal: 60–100)` });
  } else if (input.heartRate > 100 || input.heartRate < 60) {
    score += 10;
    explanations.push({ factor: "Heart Rate", impact: "medium", detail: `${input.heartRate} bpm is outside normal range (60–100)` });
  }

  // Blood pressure
  if (input.systolicBP > 180 || input.systolicBP < 90) {
    score += 20;
    explanations.push({ factor: "Blood Pressure", impact: "high", detail: `${input.systolicBP}/${input.diastolicBP} mmHg indicates hypertensive crisis or hypotension` });
  } else if (input.systolicBP > 140 || input.systolicBP < 100) {
    score += 10;
    explanations.push({ factor: "Blood Pressure", impact: "medium", detail: `${input.systolicBP}/${input.diastolicBP} mmHg is elevated` });
  }

  // Oxygen level
  if (input.oxygenLevel < 90) {
    score += 25;
    explanations.push({ factor: "Oxygen Saturation", impact: "high", detail: `SpO₂ ${input.oxygenLevel}% is critically low (normal: ≥95%)` });
  } else if (input.oxygenLevel < 95) {
    score += 12;
    explanations.push({ factor: "Oxygen Saturation", impact: "medium", detail: `SpO₂ ${input.oxygenLevel}% is below normal (≥95%)` });
  }

  // Temperature
  if (input.temperature >= 39.5 || input.temperature <= 35) {
    score += 18;
    explanations.push({ factor: "Temperature", impact: "high", detail: `${input.temperature}°C indicates ${input.temperature >= 39.5 ? "high fever" : "hypothermia"}` });
  } else if (input.temperature >= 38 || input.temperature <= 36) {
    score += 8;
    explanations.push({ factor: "Temperature", impact: "medium", detail: `${input.temperature}°C is outside normal range (36.1–37.2°C)` });
  }

  return { score: Math.min(score, 40), explanations };
}

function scoreSymptoms(text: string): { score: number; conditions: string[]; explanations: ExplanationFactor[] } {
  const lower = text.toLowerCase();
  let score = 0;
  const conditions = new Set<string>();
  const explanations: ExplanationFactor[] = [];

  for (const entry of SYMPTOM_DB) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        score += entry.severity;
        entry.conditions.forEach(c => conditions.add(c));
        const impact = entry.severity >= 20 ? "high" : entry.severity >= 10 ? "medium" : "low";
        explanations.push({ factor: "Symptom", impact, detail: `"${kw}" detected — associated with ${entry.conditions.join(", ")}` });
        break; // only match once per entry
      }
    }
  }

  return { score: Math.min(score, 35), conditions: Array.from(conditions), explanations };
}

function scoreAge(age: number): { score: number; explanations: ExplanationFactor[] } {
  const explanations: ExplanationFactor[] = [];
  let score = 0;
  if (age >= 75) {
    score = 12;
    explanations.push({ factor: "Age", impact: "high", detail: `Age ${age} — elderly patients are at higher risk for complications` });
  } else if (age >= 65) {
    score = 8;
    explanations.push({ factor: "Age", impact: "medium", detail: `Age ${age} — senior patients have elevated risk` });
  } else if (age <= 2) {
    score = 10;
    explanations.push({ factor: "Age", impact: "high", detail: `Age ${age} — infants require heightened vigilance` });
  } else if (age <= 5) {
    score = 6;
    explanations.push({ factor: "Age", impact: "medium", detail: `Age ${age} — young children are more vulnerable` });
  }
  return { score, explanations };
}

function scoreHistory(history: string): { score: number; explanations: ExplanationFactor[] } {
  if (!history) return { score: 0, explanations: [] };
  const lower = history.toLowerCase();
  let score = 0;
  const explanations: ExplanationFactor[] = [];

  for (const [key, val] of Object.entries(HISTORY_RISK)) {
    if (lower.includes(key)) {
      score += val;
      explanations.push({ factor: "Medical History", impact: val >= 7 ? "high" : "medium", detail: `History of "${key}" increases risk` });
    }
  }

  return { score: Math.min(score, 15), explanations };
}

// ── Main Triage Function ───────────────────────────────────────

export function runTriage(input: PatientInput): TriageResult {
  const vitals = scoreVitals(input);
  const symptoms = scoreSymptoms(input.symptoms);
  const age = scoreAge(input.age);
  const history = scoreHistory(input.medicalHistory || "");

  // Total raw score (max ~100)
  const rawScore = vitals.score + symptoms.score + age.score + history.score;
  const riskScore = Math.min(Math.max(Math.round(rawScore), 0), 100);

  const allExplanations = [...vitals.explanations, ...symptoms.explanations, ...age.explanations, ...history.explanations];
  // Sort by impact
  allExplanations.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.impact] - order[b.impact];
  });

  let priorityLevel: PriorityLevel;
  let recommendedAction: string;

  if (riskScore >= 75) {
    priorityLevel = "Critical";
    recommendedAction = "Immediate emergency attention required. Activate trauma/resuscitation team. Do not delay treatment.";
  } else if (riskScore >= 50) {
    priorityLevel = "High";
    recommendedAction = "Urgent medical evaluation needed. Prioritize for physician assessment within 15 minutes.";
  } else if (riskScore >= 25) {
    priorityLevel = "Medium";
    recommendedAction = "Semi-urgent. Schedule for physician consultation. Monitor vitals every 30 minutes.";
  } else {
    priorityLevel = "Low";
    recommendedAction = "Non-urgent. Patient can wait for standard consultation. Reassess if symptoms worsen.";
  }

  return {
    priorityLevel,
    riskScore,
    possibleConditions: symptoms.conditions.length > 0 ? symptoms.conditions.slice(0, 5) : ["Further assessment needed"],
    recommendedAction,
    explanations: allExplanations,
  };
}
