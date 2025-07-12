const pool = require('../config/db');
const queries = require('../queries/quotationQueries');

const createQuotation = async (data) => {
  try {
    console.log('Repository: Creating quotation with data:', data);
    
    // Extract and map frontend data to your database schema
    const {
      quotation_id: reference_no,
      created_by,
      status = 'Draft',
      total_amount = 0,
      customer_name = 'Test Customer', // Default for now
      quotation_date = new Date().toISOString().split('T')[0],
      validity_date = data.valid_till,
      remarks = data.remarks || ''
    } = data;

    console.log(' Repository: Mapped data for quotations table:', {
      customer_name, reference_no, created_by, status, total_amount
    });

    // First, create the main quotation record
    const quotationResult = await pool.query(queries.createQuotation, [
      customer_name,
      reference_no,
      created_by,
      status,
      total_amount
    ]);

    console.log(' Repository: Main quotation created:', quotationResult.rows[0]);

    // Then create the quotation version
    const quotation_id = quotationResult.rows[0].id;
    const versionResult = await pool.query(queries.createQuotationVersion, [
      quotation_id,
      1, // version_number
      status,
      quotation_date,
      validity_date,
      '', // contact_info
      remarks,
      '' // terms_conditions
    ]);

    console.log(' Repository: Quotation version created:', versionResult.rows[0]);

    // Return combined data in the format frontend expects
    const result = {
      ...quotationResult.rows[0],
      version_id: versionResult.rows[0].id,
      version_number: versionResult.rows[0].version_number,
      quotation_date: versionResult.rows[0].quotation_date,
      validity_date: versionResult.rows[0].validity_date,
      total_amount: quotationResult.rows[0].total_amount
    };

    return result;
  } catch (error) {
    console.error(' Repository: Error creating quotation:', error);
    throw error;
  }
};

const getAllQuotations = async () => {
  try {
    console.log('Repository: Fetching all quotations...');
    const result = await pool.query(queries.getAllQuotations);
    console.log('Repository: Quotations fetched successfully, count:', result.rows.length);
    return result.rows;
  } catch (error) {
    console.error(' Repository: Error fetching quotations:', error);
    throw error;
  }
};

const updateQuotationStatus = async (identifier, status) => {
  try {
    console.log(' Repository: Updating quotation status:', { identifier, status });
    
    // Determine if identifier is numeric ID or reference number
    let updateQuery, updateParams;
    if (isNaN(identifier)) {
      // It's a reference number like "Q-2025-001"
      updateQuery = 'UPDATE quotations SET status = $2 WHERE reference_no = $1 RETURNING *';
      updateParams = [identifier, status];
    } else {
      // It's a numeric ID
      updateQuery = 'UPDATE quotations SET status = $2 WHERE id = $1 RETURNING *';
      updateParams = [parseInt(identifier), status];
    }
    
    const result = await pool.query(updateQuery, updateParams);
    console.log(' Repository: Status updated successfully:', result.rows[0]);
    
    if (result.rows.length === 0) {
      throw new Error(`Quotation not found with identifier: ${identifier}`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error(' Repository: Error updating quotation status:', error);
    throw error;
  }
};

const deleteQuotation = async (identifier) => {
  try {
    console.log('Repository: Deleting quotation with identifier:', identifier);
    
    // First, check if the quotation exists by ID or reference_no
    let checkQuery, checkParam;
    if (isNaN(identifier)) {
      // It's a reference number like "Q-2025-001"
      checkQuery = 'SELECT id, reference_no FROM quotations WHERE reference_no = $1';
      checkParam = identifier;
    } else {
      // It's a numeric ID
      checkQuery = 'SELECT id, reference_no FROM quotations WHERE id = $1';
      checkParam = parseInt(identifier);
    }
    
    const checkResult = await pool.query(checkQuery, [checkParam]);
    console.log('Repository: Quotation exists check:', checkResult.rows);
    
    if (checkResult.rows.length === 0) {
      console.log('Repository: Quotation not found for identifier:', identifier);
      return false;
    }
    
    const quotationData = checkResult.rows[0];
    const quotationId = quotationData.id;
    const referenceNo = quotationData.reference_no;
    console.log('Repository: Found quotation - ID:', quotationId, 'Reference:', referenceNo);
    
    // First delete quotation versions by quotation ID
    const versionResult = await pool.query('DELETE FROM quotation_versions WHERE quotation_id = $1', [quotationId]);
    console.log('Repository: Deleted quotation versions, affected rows:', versionResult.rowCount);
    
    // Then delete the main quotation by ID
    const quotationResult = await pool.query('DELETE FROM quotations WHERE id = $1', [quotationId]);
    console.log('Repository: Quotation deleted successfully, affected rows:', quotationResult.rowCount);
    
    if (quotationResult.rowCount === 0) {
      console.log(' Repository: No quotation was deleted for ID:', quotationId);
      return false;
    }
    
    return quotationResult.rowCount > 0;
  } catch (error) {
    console.error('Repository: Error deleting quotation:', error);
    console.error('Repository: Error details:', error.message);
    console.error('Repository: Error code:', error.code);
    throw error;
  }
};

module.exports = {
  createQuotation,
  getAllQuotations,
  updateQuotationStatus,
  deleteQuotation
};