const pool = require('../config/db');
const itemQueries = require('../queries/items');

const createItem = (item) => {
  const { name, item_type, description, unit_of_measure, default_rate, tax_rate, status } = item;

  return new Promise((resolve, reject) => {
    pool.query(
      itemQueries.addItem,
      [name, item_type, description, unit_of_measure, default_rate, tax_rate, status],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows[0]);
      }
    );
  });
};

const getAllItems = () => {
  return new Promise((resolve, reject) => {
    pool.query(itemQueries.getAllItems, (err, result) => {
      if (err) reject(err);
      else resolve(result.rows);
    });
  });
};

const getItemById = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(itemQueries.getItemById, [id], (err, result) => {
      if (err) reject(err);
      else resolve(result.rows[0]);
    });
  });
};

const updateItem = (id, item) => {
  const { name, item_type, description, unit_of_measure, default_rate, tax_rate, status } = item;

  return new Promise((resolve, reject) => {
    pool.query(
      itemQueries.updateItem,
      [name, item_type, description, unit_of_measure, default_rate, tax_rate, status, id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows[0]);
      }
    );
  });
};

const deleteItem = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(itemQueries.deleteItem, [id], (err, result) => {
      if (err) reject(err);
      else resolve({ success: true });
    });
  });
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
};