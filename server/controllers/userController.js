const { User } = require('../models/User');

const userController = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().sort({ addedAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  // Add new user
  addUser: async (req, res) => {
    try {
      const { username, tag } = req.body;
      const existingUser = await User.findOne({ username });
      
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      const user = new User({ username, tag });
      await user.save();
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add user' });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { username } = req.params;
      const { newUsername, tag } = req.body;
      
      const user = await User.findOneAndUpdate(
        { username },
        { username: newUsername || username, tag },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findOneAndDelete({ username });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
};

module.exports = userController;
