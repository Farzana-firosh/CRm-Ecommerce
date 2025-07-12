// controllers/currencyController.js

const currencyRepo = require('../repositories/currencyRepository');

exports.getAllCurrencies = async (req, res) => {
  try {
    const currencies = await currencyRepo.getAllCurrencies();
    res.status(200).json(currencies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
};

exports.getCurrencyById = async (req, res) => {
  try {
    const currency = await currencyRepo.getCurrencyById(req.params.id);
    if (!currency) return res.status(404).json({ error: 'Currency not found' });
    res.status(200).json(currency);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving currency' });
  }
};

exports.createCurrency = async (req, res) => {
  try {
    const newCurrency = await currencyRepo.createCurrency(req.body);
    res.status(201).json(newCurrency);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create currency' });
  }
};

exports.updateCurrency = async (req, res) => {
  try {
    const updated = await currencyRepo.updateCurrency(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update currency' });
  }
};

exports.deleteCurrency = async (req, res) => {
  try {
    await currencyRepo.deleteCurrency(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete currency' });
  }
};