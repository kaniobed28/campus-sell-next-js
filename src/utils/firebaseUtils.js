// utils/firebaseUtils.js
/**
 * Clean array values to remove undefined/null entries before using in Firestore queries
 * @param {Array} arr - Array to clean
 * @returns {Array} - Cleaned array with only valid values
 */
export const cleanQueryArray = (arr) => {
  return arr.filter(value => value !== undefined && value !== null);
};

/**
 * Check if a value is valid for use in Firestore queries
 * @param {*} value - Value to check
 * @returns {boolean} - True if value is valid for Firestore queries
 */
export const isValidQueryValue = (value) => {
  return value !== undefined && value !== null;
};

/**
 * Safe query builder to prevent undefined/null values from being passed to Firestore
 */
export class SafeQueryBuilder {
  constructor(baseQuery) {
    this.query = baseQuery;
  }

  /**
   * Add a where condition to the query if the value is valid
   * @param {string} field - Field name
   * @param {string} operator - Comparison operator
   * @param {*} value - Value to compare
   * @returns {SafeQueryBuilder} - This query builder instance
   */
  where(field, operator, value) {
    if (isValidQueryValue(value)) {
      this.query = query(this.query, where(field, operator, value));
    }
    return this;
  }

  /**
   * Add a where 'in' condition to the query with cleaned array values
   * @param {string} field - Field name
   * @param {Array} values - Array of values to check
   * @returns {SafeQueryBuilder} - This query builder instance
   */
  whereIn(field, values) {
    const cleanValues = cleanQueryArray(values);
    if (cleanValues.length > 0) {
      this.query = query(this.query, where(field, 'in', cleanValues));
    }
    return this;
  }

  /**
   * Add an orderBy clause to the query
   * @param {string} field - Field name
   * @param {string} direction - Sort direction ('asc' or 'desc')
   * @returns {SafeQueryBuilder} - This query builder instance
   */
  orderBy(field, direction = 'asc') {
    this.query = query(this.query, orderBy(field, direction));
    return this;
  }

  /**
   * Add a limit clause to the query
   * @param {number} count - Number of documents to limit
   * @returns {SafeQueryBuilder} - This query builder instance
   */
  limit(count) {
    if (isValidQueryValue(count)) {
      this.query = query(this.query, limit(count));
    }
    return this;
  }

  /**
   * Get the final query object
   * @returns {Query} - The constructed Firestore query
   */
  build() {
    return this.query;
  }
}

export default { cleanQueryArray, isValidQueryValue, SafeQueryBuilder };