// controllers/invoiceController.js
const invoiceRepository = require('../repositories/invoiceRepository');

exports.createInvoice = async (req, res) => {
  try {
    const invoiceId = await invoiceRepository.createInvoice(req.body);
    res.status(201).json({ message: 'Invoice created successfully', invoiceId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await invoiceRepository.getAllInvoices();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await invoiceRepository.getInvoiceById(req.params.id);
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    await invoiceRepository.updatePaymentStatus(req.params.id, req.body);
    res.json({ message: 'Payment status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};