// queries/taxQueries.js

exports.getAllTaxes = `
  SELECT * FROM tax_settings WHERE status = 'Active';
`;

exports.getTaxById = `
  SELECT * FROM tax_settings WHERE id = $1;
`;

exports.createTax = `
  INSERT INTO tax_settings (tax_name, rate, status)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

exports.updateTax = `
  UPDATE tax_settings
  SET tax_name = $1, rate = $2, status = $3
  WHERE id = $4
  RETURNING *;
`;

exports.deleteTax = `
  DELETE FROM tax_settings
  WHERE id = $1;
`;