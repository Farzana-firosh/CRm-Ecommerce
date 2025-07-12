// repositories/taxRepository.js

const pool = require('../config/db');
const queries = require('../queries/taxQueries');

exports.getAllTaxes = async () => {
  const result = await pool.query(queries.getAllTaxes);
  return result.rows;
};

exports.getTaxById = async (id) => {
  const result = await pool.query(queries.getTaxById, [id]);
  return result.rows[0];
};

exports.createTax = async (tax) => {
  const { tax_name, rate, status } = tax;
  const result = await pool.query(queries.createTax, [tax_name, rate, status]);
  return result.rows[0];
};

exports.updateTax = async (id, tax) => {
  const { tax_name, rate, status } = tax;
  const result = await pool.query(queries.updateTax, [tax_name, rate, status, id]);
  return result.rows[0];
};

exports.deleteTax = async (id) => {
  await pool.query(queries.deleteTax, [id]);
  return true;
};