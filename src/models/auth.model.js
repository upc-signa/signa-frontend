/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} password
 * @property {string} birthDate
 */

/**
 * @typedef {Object} VerificationEmail
 * @property {string} email
 * @property {string} verificationCode
 */

/**
 * @typedef {Object} ResetPassword
 * @property {string} email
 * @property {string} verificationCode
 * @property {string} newPassword
 */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} email
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} createdAt
 * @property {string} updatedAt
 */