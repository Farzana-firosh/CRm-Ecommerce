const pool = require('../config/db');
const organizationQueries = require('../queries/organizationQueries');

exports.getOrganizationInfo = async () => {
  return new Promise((resolve, reject) => {
    pool.query(organizationQueries.getOrganizationInfo, (error, results) => {
      if (error) {
        reject(new Error('Error fetching organization info: ' + error.message));
      } else {
        resolve(results.rows[0] || null);
      }
    });
  });
};

exports.updateOrganizationInfo = async (id, data) => {
  const { name, address, contact_info, logo_url, currency_id, default_tax_id } = data;
  return new Promise((resolve, reject) => {
    pool.query(
      organizationQueries.updateOrganizationInfo,
      [name, address, contact_info, logo_url, currency_id, default_tax_id, id],
      (error, results) => {
        if (error) {
          reject(new Error('Error updating organization info: ' + error.message));
        } else {
          resolve(results.rows[0]);
        }
      }
    );
  });
};

exports.createOrganizationInfo = async (data) => {
  const { name, address, contact_info, logo_url, currency_id, default_tax_id } = data;
  return new Promise((resolve, reject) => {
    pool.query(
      organizationQueries.createOrganizationInfo,
      [name, address, contact_info, logo_url, currency_id, default_tax_id],
      (error, results) => {
        if (error) {
          reject(new Error('Error creating organization info: ' + error.message));
        } else {
          resolve(results.rows[0]);
        }
      }
    );
  });
};