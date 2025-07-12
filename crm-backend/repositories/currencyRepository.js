// repositories/currencyRepository.js

const pool = require('../config/db');
const queries = require('../queries/currencyQueries');

exports.getAllCurrencies = async () => {
  const result = await pool.query(queries.getAllCurrencies);
  return result.rows;
};

exports.getCurrencyById = async (id) => {
  const result = await pool.query(queries.getCurrencyById, [id]);
  return result.rows[0];
};

exports.createCurrency = async (currency) => {
  const { currency_code, symbol, status } = currency;
  const result = await pool.query(queries.createCurrency, [currency_code, symbol, status]);
  return result.rows[0];
};

exports.updateCurrency = async (id, currency) => {
  const { currency_code, symbol, status } = currency;
  const result = await pool.query(queries.updateCurrency, [currency_code, symbol, status, id]);
  return result.rows[0];
};

exports.deleteCurrency = async (id) => {
  await pool.query(queries.deleteCurrency, [id]);
  return true;
};