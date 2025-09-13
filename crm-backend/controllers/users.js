const {
  createUser: createUserRepo,
  getUserByEmail,
  getUserRolesByUserId,
  getAllUsers: getAllUsersRepo,
  getUserById: getUserByIdRepo,
  updateUser: updateUserRepo,
  deleteUser: deleteUserRepo,
  getAllRoles: getAllRolesRepo,
  addUserRole,
  removeAllUserRoles,
  getRoleByName,
} = require('../repositories/users');
const { createJwt } = require('../utilis/jwtHelper');
const { compareWithHashedPassword } = require('../utilis/passwordHelper');

async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  
  try {
    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    // Get role ID if role is provided
    let roleId = null;
    if (role) {
      const roleData = await getRoleByName(role);
      if (roleData) {
        roleId = roleData.id;
      }
    }
    
    const userId = await createUserRepo(name, email, password, roleId);
    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const users = await getUserByEmail(email);
  if (users.length === 0) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const user = users[0];
  const isPasswordValid = compareWithHashedPassword(password, user.password);
  
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Create JWT token
  const token = createJwt(user.id);
  const roles = await getUserRolesByUserId(user.id);

  res.json({ token, roles: roles.map(r => r.name) });
}

async function getAllUsers(req, res) {
  try {
    const users = await getAllUsersRepo();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function getUserById(req, res) {
  try {
    const user = await getUserByIdRepo(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

async function updateUser(req, res) {
  try {
    const { name, email, role } = req.body;
    const userId = req.params.id;
    
    // Update basic user info
    const updated = await updateUserRepo(userId, { name, email });
    
    // Update role if provided
    if (role) {
      const roleData = await getRoleByName(role);
      if (roleData) {
        // Remove all existing roles first
        await removeAllUserRoles(userId);
        // Add new role
        await addUserRole(userId, roleData.id);
      }
    }
    
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

async function getAllRoles(req, res) {
  try {
    const roles = await getAllRolesRepo();
    res.status(200).json(roles);
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
}

async function deleteUser(req, res) {
  try {
    // First remove all user roles
    await removeAllUserRoles(req.params.id);
    // Then delete the user
    await deleteUserRepo(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

module.exports = {
  createUser,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllRoles,
};