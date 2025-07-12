const pool = require('../config/db');
const usersQueries = require('../queries/users');
const { hashPassword } = require('../utilis/passwordHelper');

const createUser = async (name, email, password, roleId = null) => {
  const hashedPassword = hashPassword(password);

  return new Promise((resolve, reject) => {
    pool.query(usersQueries.addUser, [name, email, hashedPassword], async (error, results) => {
      if (error) {
        reject(error);
      } else {
        const userId = results.rows[0].id;
        
        // If roleId is provided, assign the role
        if (roleId) {
          try {
            await addUserRole(userId, roleId);
          } catch (roleError) {
            console.error('Error assigning role to user:', roleError);
            // Don't fail user creation if role assignment fails
          }
        }
        
        resolve(userId);
      }
    });
  });
};

const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(usersQueries.getUserByEmail, [email], (error, results) => {
      if (error) reject(error);
      else resolve(results.rows);
    });
  });
};

const getUserRolesByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(usersQueries.getUserRolesByUserId, [userId], (error, results) => {
      if (error) reject(error);
      else resolve(results.rows);
    });
  });
};

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    pool.query(usersQueries.getAllUsers, (error, results) => {
      if (error) reject(error);
      else resolve(results.rows);
    });
  });
};

const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(usersQueries.getUserById, [id], (error, results) => {
      if (error) reject(error);
      else resolve(results.rows[0]);
    });
  });
};

const updateUser = (id, userData) => {
  const { name, email } = userData;
  return new Promise((resolve, reject) => {
    pool.query(usersQueries.updateUser, [name, email, id], (error, results) => {
      if (error) reject(error);
      else resolve(results.rows[0]);
    });
  });
};

const deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(usersQueries.deleteUser, [id], (error, results) => {
      if (error) reject(error);
      else resolve(true);
    });
  });
};

// Role management functions
const getAllRoles = () => {
  return new Promise((resolve, reject) => {
    pool.query(usersQueries.getAllRoles, (error, results) => {
      if (error) reject(error);
      else resolve(results.rows);
    });
  });
};

const addUserRole = (userId, roleId) => {
  return new Promise((resolve, reject) => {
    pool.query(usersQueries.addUserRole, [userId, roleId], (error, results) => {
      if (error) reject(error);
      else resolve(true);
    });
  });
};

const removeUserRole = (userId, roleId) => {
  return new Promise((resolve, reject) => {
    pool.query(usersQueries.removeUserRole, [userId, roleId], (error, results) => {
      if (error) reject(error);
      else resolve(true);
    });
  });
};

const removeAllUserRoles = (userId) => {
  return new Promise((resolve, reject) => {
    pool.query(usersQueries.removeAllUserRoles, [userId], (error, results) => {
      if (error) reject(error);
      else resolve(true);
    });
  });
};

const getRoleByName = (roleName) => {
  return new Promise((resolve, reject) => {
    pool.query(usersQueries.getRoleByName, [roleName], (error, results) => {
      if (error) reject(error);
      else resolve(results.rows[0]);
    });
  });
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserRolesByUserId,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllRoles,
  addUserRole,
  removeUserRole,
  removeAllUserRoles,
  getRoleByName,
};