const repo = require('../repositories/quotationRepository');
const asyncHandler = require('../middlewares/asyncHandler');

exports.createQuotation = asyncHandler(async (req, res) => {
  try {
    console.log('📝 Creating quotation with data:', req.body);
    
    // Validate required fields
    const { quotation_id, version_number, status, created_by, total_amount } = req.body;
    
    if (!quotation_id) {
      return res.status(400).json({ error: 'quotation_id is required' });
    }
    if (!created_by) {
      return res.status(400).json({ error: 'created_by is required' });
    }
    
    console.log(' Validation passed, calling repository...');
    const newQuote = await repo.createQuotation(req.body);
    console.log('Quotation created:', newQuote);
    res.status(201).json(newQuote);
  } catch (error) {
    console.error('Controller Error in createQuotation:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ 
      error: 'Failed to create quotation', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

exports.getQuotations = asyncHandler(async (req, res) => {
  try {
    console.log('📋 Fetching all quotations...');
    const quotes = await repo.getAllQuotations();
    console.log('✅ Quotations fetched, count:', quotes.length);
    res.status(200).json(quotes);
  } catch (error) {
    console.error('❌ Controller Error in getQuotations:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch quotations', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

exports.updateQuotationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(`🔄 Updating quotation ${id} status to:`, status);
  const updatedQuote = await repo.updateQuotationStatus(id, status);
  console.log('✅ Quotation status updated:', updatedQuote);
  res.status(200).json(updatedQuote);
});

exports.deleteQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Deleting quotation:`, id);
  await repo.deleteQuotation(id);
  console.log('✅ Quotation deleted successfully');
  res.status(200).json({ message: 'Quotation deleted successfully' });
});