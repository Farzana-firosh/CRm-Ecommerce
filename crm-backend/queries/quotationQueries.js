const createQuotation = `
  INSERT INTO quotations 
    (customer_name, reference_no, created_by, status, total_amount)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`;

const createQuotationVersion = `
  INSERT INTO quotation_versions 
    (quotation_id, version_number, status, quotation_date, validity_date, contact_info, remarks, terms_conditions)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *;
`;

const getAllQuotations = `
  SELECT 
    q.id as quotation_id,
    q.customer_name,
    q.reference_no,
    q.created_by,
    q.status as quotation_status,
    q.created_at,
    q.total_amount,
    qv.id as version_id,
    qv.version_number,
    qv.status as version_status,
    qv.quotation_date,
    qv.validity_date,
    qv.remarks
  FROM quotations q
  LEFT JOIN quotation_versions qv ON q.id = qv.quotation_id
  ORDER BY q.created_at DESC, qv.version_number DESC;
`;

const updateQuotationStatus = `
  UPDATE quotations 
  SET status = $2 
  WHERE reference_no = $1 
  RETURNING *;
`;

const deleteQuotation = `
  DELETE FROM quotations 
  WHERE reference_no = $1;
`;

const deleteQuotationVersions = `
  DELETE FROM quotation_versions 
  WHERE quotation_id = (SELECT id FROM quotations WHERE reference_no = $1);
`;

module.exports = {
  createQuotation,
  createQuotationVersion,
  getAllQuotations,
  updateQuotationStatus,
  deleteQuotation,
  deleteQuotationVersions
};