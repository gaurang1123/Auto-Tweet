import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

function UserManager() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState('');
  const [selectedTag, setSelectedTag] = useState('influencer');
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editTag, setEditTag] = useState('influencer');

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error loading users');
    }
  };

  const addUser = async () => {
    if (!newUser.trim()) {
      toast.warning('Please enter a username');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/users`, { 
        username: newUser.replace('@', ''), 
        tag: selectedTag 
      });
      setNewUser('');
      loadUsers();
      toast.success(`Added @${newUser.replace('@', '')} as ${selectedTag}`);
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(error.response?.data?.error || 'Error adding user');
    }
    setLoading(false);
  };

  const updateUser = async () => {
    if (!editUsername.trim()) {
      toast.warning('Please enter a username');
      return;
    }
    
    try {
      await axios.put(`${API_URL}/users/${editingUser.username}`, {
        newUsername: editUsername.replace('@', ''),
        tag: editTag
      });
      setEditingUser(null);
      loadUsers();
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user');
    }
  };

  const removeUser = async (username) => {
    if (!window.confirm(`Are you sure you want to remove @${username}?`)) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/users/${username}`);
      loadUsers();
      toast.success(`Removed @${username}`);
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Error removing user');
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditTag(user.tag);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditUsername('');
    setEditTag('influencer');
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const influencers = users.filter(u => u.tag === 'influencer');
  const companies = users.filter(u => u.tag === 'company');

  const renderUserItem = (user) => {
    if (editingUser && editingUser._id === user._id) {
      return (
        <li key={user._id} style={{ 
          padding: '8px',
          margin: '5px 0',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          border: '1px solid #ffeaa7'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              style={{ padding: '4px', flex: 1 }}
              placeholder="Username"
            />
            <select 
              value={editTag}
              onChange={(e) => setEditTag(e.target.value)}
              style={{ padding: '4px' }}
            >
              <option value="influencer">Influencer</option>
              <option value="company">Company</option>
            </select>
            <button 
              onClick={updateUser}
              style={{ 
                padding: '4px 8px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '3px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
            <button 
              onClick={cancelEdit}
              style={{ 
                padding: '4px 8px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '3px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </li>
      );
    }

    return (
      <li key={user._id} style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '8px',
        margin: '5px 0',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}>
        <span>@{user.username}</span>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            onClick={() => startEdit(user)}
            style={{ 
              padding: '4px 8px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Edit
          </button>
          <button 
            onClick={() => removeUser(user.username)}
            style={{ 
              padding: '4px 8px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </li>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Monitored Users</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Add New User</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            value={newUser} 
            onChange={(e) => setNewUser(e.target.value)}
            placeholder="Enter username (without @)"
            style={{ padding: '8px', flex: 1 }}
            onKeyPress={(e) => e.key === 'Enter' && addUser()}
          />
          <select 
            value={selectedTag} 
            onChange={(e) => setSelectedTag(e.target.value)}
            style={{ padding: '8px' }}
          >
            <option value="influencer">Crypto Influencer</option>
            <option value="company">Crypto Company</option>
          </select>
          <button 
            onClick={addUser} 
            disabled={loading}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: loading ? '#6c757d' : '#1da1f2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Adding...' : 'Add User'}
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#1da1f2' }}>Crypto Influencers ({influencers.length})</h3>
          <div style={{ border: '2px solid #1da1f2', borderRadius: '5px', padding: '10px', minHeight: '200px' }}>
            {influencers.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No influencers added yet</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {influencers.map(renderUserItem)}
              </ul>
            )}
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#28a745' }}>Crypto Companies ({companies.length})</h3>
          <div style={{ border: '2px solid #28a745', borderRadius: '5px', padding: '10px', minHeight: '200px' }}>
            {companies.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No companies added yet</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {companies.map(renderUserItem)}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <small style={{ color: '#666' }}>
          <strong>Tip:</strong> Add crypto influencers for market insights and companies for official updates. 
          Click Edit to modify usernames or tags, Delete to remove users.
        </small>
      </div>
    </div>
  );
}

export default UserManager;
