const organizationRepository = require('../repositories/organizationRepository');

// GET: Fetch organization info
exports.getOrganizationInfo = async (req, res) => {
  try {
    const data = await organizationRepository.getOrganizationInfo();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching org info:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// POST: Create organization info (if not exists)
exports.createOrganizationInfo = async (req, res) => {
  try {
    const newOrg = await organizationRepository.createOrganizationInfo(req.body);
    res.status(201).json(newOrg);
  } catch (error) {
    console.error('Error creating org info:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// PUT: Update organization info
exports.updateOrganizationInfo = async (req, res) => {
  try {
    const orgId = req.params.id;
    const updatedOrg = await organizationRepository.updateOrganizationInfo(orgId, req.body);
    res.status(200).json(updatedOrg);
  } catch (error) {
    console.error('Error updating org info:', error.message);
    res.status(500).json({ error: error.message });
  }
};