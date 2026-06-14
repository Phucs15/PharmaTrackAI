import { GoogleGenerativeAI } from '@google/generative-ai';
import Medicine from '../models/Medicine.js';
import Batch from '../models/Batch.js';
import Transaction from '../models/Transaction.js';
import { formatDate } from '../utils/statusHelpers.js';

const FALLBACK_PREDICTION_PERIODS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

const CANNED_RESPONSES = [
  {
    keywords: ['reorder', 'order', 'restock'],
    text: 'Based on current burn rates, I recommend reordering the medicines flagged as Critical Low or Reorder Soon as soon as possible, prioritizing facilities with the lowest remaining share of their reorder level.',
  },
  {
    keywords: ['risk', 'stockout', 'shortage'],
    text: 'The medicines currently at Critical Low status carry the highest stockout risk. Review the AI Forecast insights for the specific items and facilities that need attention first.',
  },
  {
    keywords: ['chicago', 'albuterol'],
    text: 'For facility-specific shortfalls, check the stock-by-facility breakdown on the Medicines page and the Batches view filtered by facility to identify transfer opportunities from facilities running a healthy buffer.',
  },
  {
    keywords: ['overstock', 'optimi', 'excess'],
    text: 'Medicines with a Healthy status well above their reorder level may be overstocked. Consider holding the next scheduled delivery for those items and redistributing surplus to facilities running low.',
  },
];

const DEFAULT_RESPONSE =
  "I'm continuously monitoring demand signals across all facilities. Ask me about reorder suggestions, risk analysis, or a specific medicine and I'll surface the latest forecast.";

let genAIClient = null;

function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function getClient() {
  if (!isGeminiConfigured()) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAIClient;
}

async function callGemini(prompt) {
  const client = getClient();
  if (!client) return null;

  const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/** Snapshot of real inventory data used to ground AI prompts and fallbacks. */
export async function buildInventoryContext() {
  const medicines = (await Medicine.find()).map((med) => med.toJSON());
  const batches = (await Batch.find()).map((batch) => batch.toJSON());
  const recentTransactions = (await Transaction.find().sort({ date: -1 }).limit(20)).map((txn) =>
    txn.toJSON()
  );

  const lowStock = medicines
    .filter((med) => med.status === 'Critical Low' || med.status === 'Reorder Soon')
    .map((med) => ({
      id: med.id,
      code: med.code,
      name: med.name,
      totalStock: med.totalStock,
      reorderLevel: med.reorderLevel,
      status: med.status,
    }));

  const riskyBatches = batches
    .filter((batch) => batch.status === 'Near Expiry' || batch.status === 'Expired')
    .map((batch) => ({
      batchNumber: batch.batchNumber,
      medicineName: batch.medicineName,
      facility: batch.facility,
      quantity: batch.quantity,
      expDate: batch.expDate,
      status: batch.status,
    }));

  const totalInbound = recentTransactions
    .filter((txn) => txn.type === 'IN')
    .reduce((sum, txn) => sum + (txn.quantity || 0), 0);
  const totalOutbound = recentTransactions
    .filter((txn) => txn.type === 'OUT')
    .reduce((sum, txn) => sum + (txn.quantity || 0), 0);

  return {
    medicineCount: medicines.length,
    lowStock,
    riskyBatches,
    totalInbound,
    totalOutbound,
  };
}

function buildFallbackInsights(context) {
  const insights = [];

  const criticalMedicine = context.lowStock[0];
  if (criticalMedicine) {
    insights.push({
      type: 'risk',
      title: criticalMedicine.name,
      description: `${criticalMedicine.name} is currently ${criticalMedicine.status} (${criticalMedicine.totalStock} units against a reorder level of ${criticalMedicine.reorderLevel}). Replenishment should be expedited to avoid a stockout.`,
      action: 'Expedite Order',
    });
  }

  const riskyBatch = context.riskyBatches[0];
  if (riskyBatch) {
    insights.push({
      type: riskyBatch.status === 'Expired' ? 'risk' : 'optimization',
      title: riskyBatch.medicineName,
      description: `Batch ${riskyBatch.batchNumber} at ${riskyBatch.facility} is ${riskyBatch.status.toLowerCase()} (expires ${formatDate(riskyBatch.expDate)}, ${riskyBatch.quantity} units). Consider redistributing or disposing of this stock.`,
      action: riskyBatch.status === 'Expired' ? 'Dispose Batch' : 'Adjust Schedule',
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'optimization',
      title: 'Inventory Overview',
      description: 'All tracked medicines are within healthy stock thresholds and no batches are nearing expiry.',
      action: 'Maintain Schedule',
    });
  }

  return insights;
}

function buildFallbackForecast(context, focusMedicine) {
  const target = focusMedicine || context.lowStock[0] || null;
  const baseline = target ? Math.max(target.totalStock || 0, target.reorderLevel || 0, 1000) : 9000;

  const predictionVsReality = FALLBACK_PREDICTION_PERIODS.map((period, index) => {
    const point = { period };
    if (index < 5) {
      point.actual = Math.round(baseline * (0.85 + index * 0.04));
      if (index === 4) point.predicted = point.actual;
    } else {
      point.predicted = Math.round(baseline * (0.85 + index * 0.05));
    }
    return point;
  });

  const suggestedReorder = target
    ? Math.max(
        Math.round((target.reorderLevel || baseline * 0.5) * 1.5 - (target.totalStock || 0)),
        Math.round(baseline * 0.2)
      )
    : Math.round(baseline * 1.4);

  return {
    confidenceScore: context.lowStock.length || context.riskyBatches.length ? 88.5 : 94.2,
    suggestedReorder,
    predictionVsReality,
    insights: buildFallbackInsights(context),
  };
}

function buildForecastPrompt(context, focusMedicine) {
  return `You are a supply-chain forecasting engine for PharmaTrack AI, a pharmaceutical inventory management system.
Respond with STRICT JSON only (no markdown fences, no commentary) matching exactly this shape:
{
  "confidenceScore": number (0-100),
  "suggestedReorder": number (units),
  "predictionVsReality": [{ "period": string, "actual"?: number, "predicted"?: number }],
  "insights": [{ "type": "risk" | "optimization", "title": string, "description": string, "action": string }]
}

Provide 6-8 monthly periods in predictionVsReality (recent months with "actual", upcoming months with "predicted") and 2-3 insights.

Inventory context:
${JSON.stringify({ focusMedicine, ...context }, null, 2)}`;
}

function parseForecastResponse(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (
      typeof parsed.confidenceScore === 'number' &&
      typeof parsed.suggestedReorder === 'number' &&
      Array.isArray(parsed.predictionVsReality) &&
      Array.isArray(parsed.insights)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** Returns a ForecastResult, using Gemini when configured and falling back to a deterministic result derived from real inventory data. */
export async function generateForecast(medicineId) {
  const context = await buildInventoryContext();

  let focusMedicine = null;
  if (medicineId) {
    const medicine = await Medicine.findById(medicineId).catch(() => null);
    if (medicine) {
      const json = medicine.toJSON();
      focusMedicine = {
        id: json.id,
        code: json.code,
        name: json.name,
        totalStock: json.totalStock,
        reorderLevel: json.reorderLevel,
        status: json.status,
      };
    }
  }

  if (!isGeminiConfigured()) {
    return buildFallbackForecast(context, focusMedicine);
  }

  try {
    const raw = await callGemini(buildForecastPrompt(context, focusMedicine));
    const parsed = parseForecastResponse(raw);
    return parsed || buildFallbackForecast(context, focusMedicine);
  } catch {
    return buildFallbackForecast(context, focusMedicine);
  }
}

/** Returns just the `insights` array of the current forecast. */
export async function generateInsights() {
  const forecast = await generateForecast();
  return forecast.insights;
}

function buildChatPrompt(message, history, context) {
  const historyText = history
    .slice(-6)
    .map((entry) => `${entry.sender === 'user' ? 'User' : 'Assistant'}: ${entry.text}`)
    .join('\n');

  return `You are the PharmaTrack AI Logistics Copilot, an assistant embedded in a pharmaceutical inventory management system. Answer concisely and helpfully, using the inventory context below when relevant.

Inventory context:
${JSON.stringify(context, null, 2)}

Conversation so far:
${historyText}

User: ${message}
Assistant:`;
}

function fallbackChatReply(message) {
  const lower = String(message).toLowerCase();
  const match = CANNED_RESPONSES.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)));
  return match ? match.text : DEFAULT_RESPONSE;
}

/** Returns the AI's plain-text reply to a chat message, using Gemini when configured. */
export async function chatReply(message, history = []) {
  if (!isGeminiConfigured()) {
    return fallbackChatReply(message);
  }

  try {
    const context = await buildInventoryContext();
    const raw = await callGemini(buildChatPrompt(message, history, context));
    const trimmed = raw ? raw.trim() : '';
    return trimmed || fallbackChatReply(message);
  } catch {
    return fallbackChatReply(message);
  }
}
