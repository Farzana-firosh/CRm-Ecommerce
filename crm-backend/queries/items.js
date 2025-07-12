const addItem = `
  INSERT INTO items (name, item_type, description, unit_of_measure, default_rate, tax_rate, status)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *;
`;

const getAllItems = "SELECT * FROM items ORDER BY id DESC;";

const getItemById = "SELECT * FROM items WHERE id = $1;";

const updateItem = `
  UPDATE items
  SET name = $1, item_type = $2, description = $3, unit_of_measure = $4, default_rate = $5, tax_rate = $6, status = $7
  WHERE id = $8
  RETURNING *;
`;

const deleteItem = "DELETE FROM items WHERE id = $1;";

module.exports = {
  addItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
};