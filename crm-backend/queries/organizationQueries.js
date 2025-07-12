// queries/organizationQueries.js

exports.getOrganizationInfo = `
  SELECT oi.*, c.currency_code, c.symbol AS currency_symbol, t.tax_name, t.rate AS tax_rate
  FROM organization_info oi
  LEFT JOIN currencies c ON oi.currency_id = c.id
  LEFT JOIN tax_settings t ON oi.default_tax_id = t.id
  LIMIT 1
`;

exports.createOrganizationInfo = `
  INSERT INTO organization_info 
    (name, address, contact_info, logo_url, currency_id, default_tax_id) 
  VALUES 
    ($1, $2, $3, $4, $5, $6)
  RETURNING *
`;

exports.updateOrganizationInfo = `
  UPDATE organization_info SET
    name = $1,
    address = $2,
    contact_info = $3,
    logo_url = $4,
    currency_id = $5,
    default_tax_id = $6,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = $7
  RETURNING *
`;