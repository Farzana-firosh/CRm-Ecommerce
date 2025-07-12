// queries/currencyQueries.js

exports.getAllCurrencies = `
  SELECT * FROM currencies WHERE status = 'Active';
`;

exports.getCurrencyById = `
  SELECT * FROM currencies WHERE id = $1;
`;

exports.createCurrency = `
  INSERT INTO currencies (currency_code, symbol, status)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

exports.updateCurrency = `
  UPDATE currencies
  SET currency_code = $1, symbol = $2, status = $3
  WHERE id = $4
  RETURNING *;
`;

exports.deleteCurrency = `
  DELETE FROM currencies WHERE id = $1;
`;