const addUser = `
  INSERT INTO users(name, email, password)
  VALUES ($1, $2, $3)
  RETURNING id
`;

const getUserByEmail = `
  SELECT id, name, email, password FROM users WHERE email = $1
`;

const getUserRolesByUserId = `
  SELECT r.role_name AS name
  FROM roles r
  INNER JOIN user_roles ur ON ur.role_id = r.id
  WHERE ur.user_id = $1
`;

const getAllUsers = `
  SELECT DISTINCT u.id, u.name, u.email, u.created_at,
         COALESCE(STRING_AGG(r.role_name, ', '), 'No Role') AS roles
  FROM users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  GROUP BY u.id, u.name, u.email, u.created_at
  ORDER BY u.created_at DESC
`;

const getUserById = `
  SELECT DISTINCT u.id, u.name, u.email,
         COALESCE(STRING_AGG(r.role_name, ', '), 'No Role') AS roles
  FROM users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  WHERE u.id = $1
  GROUP BY u.id, u.name, u.email
`;

const updateUser = `
  UPDATE users 
  SET name = $1, email = $2
  WHERE id = $3
  RETURNING id, name, email
`;

const deleteUser = `
  DELETE FROM users 
  WHERE id = $1
`;

// Role-related queries
const getAllRoles = `
  SELECT id, role_name
  FROM roles
  ORDER BY role_name
`;

const addUserRole = `
  INSERT INTO user_roles (user_id, role_id)
  VALUES ($1, $2)
  ON CONFLICT (user_id, role_id) DO NOTHING
`;

const removeUserRole = `
  DELETE FROM user_roles
  WHERE user_id = $1 AND role_id = $2
`;

const removeAllUserRoles = `
  DELETE FROM user_roles
  WHERE user_id = $1
`;

const getRoleByName = `
  SELECT id, role_name FROM roles WHERE role_name = $1
`;

module.exports = {
  addUser,
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