// controllers/taxController.js

const taxRepo = require('../repositories/taxRepository');

exports.getAllTaxes = async (req, res) => {
  try {
    const taxes = await taxRepo.getAllTaxes();
    res.status(200).json(taxes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch taxes' });
  }
};

exports.getTaxById = async (req, res) => {
  try {
    const tax = await taxRepo.getTaxById(req.params.id);
    if (!tax) return res.status(404).json({ error: 'Tax not found' });
    res.status(200).json(tax);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving tax' });
  }
};

exports.createTax = async (req, res) => {
  try {
    const newTax = await taxRepo.createTax(req.body);
    res.status(201).json(newTax);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create tax' });
  }
};

exports.updateTax = async (req, res) => {
  try {
    const updated = await taxRepo.updateTax(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update tax' });
  }
};

exports.deleteTax = async (req, res) => {
  try {
    await taxRepo.deleteTax(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete tax' });
  }
};