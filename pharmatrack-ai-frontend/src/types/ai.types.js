/**
 * @typedef {Object} AIInsight
 * @property {'risk'|'optimization'} type
 * @property {string} title
 * @property {string} description
 * @property {string} action
 */

/**
 * @typedef {import('./report.types').SeriesPoint} SeriesPoint
 */

/**
 * @typedef {Object} ForecastResult
 * @property {number} confidenceScore
 * @property {number} suggestedReorder
 * @property {SeriesPoint[]} predictionVsReality
 * @property {AIInsight[]} insights
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {'user'|'ai'} sender
 * @property {string} text
 */

export {};
