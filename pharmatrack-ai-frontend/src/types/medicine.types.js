/**
 * @typedef {Object} StockByFacility
 * @property {string} facility
 * @property {number} stock
 * @property {string} status
 */

/**
 * @typedef {Object} Medicine
 * @property {string} id
 * @property {string} code
 * @property {string} name
 * @property {string} category
 * @property {string} manufacturer
 * @property {string} unitType
 * @property {number} [unitPrice]
 * @property {number} totalStock
 * @property {number} reorderLevel
 * @property {string} status
 * @property {string} [storageNotes]
 * @property {StockByFacility[]} [stockByFacility]
 * @property {string} createdAt
 */

export {};
