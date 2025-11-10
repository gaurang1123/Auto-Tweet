import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function SettingsPage() {
  const [keys, setKeys] = useState({ twitter: {}, gemini: '' });

  useEffect(() => {
    axios.get(`${API_URL}/keys`)
      .then(response => {
        setKeys(response.data);
      })
      .catch(error => {
        console.error('Error fetching keys:', error);
      });
  }, []);

  const handleTwitterChange = (e) => {
    setKeys({
      ...keys,
      twitter: {
        ...keys.twitter,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleGeminiChange = (e) => {
    setKeys({
      ...keys,
      gemini: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_URL}/keys`, keys)
      .then(response => {
        alert('Keys updated successfully!');
      })
      .catch(error => {
        console.error('Error updating keys:', error);
        alert('Error updating keys.');
      });
  };

  return (
    <div>
      <h1>Settings</h1>
      <form onSubmit={handleSubmit}>
        <h2>Twitter API Keys</h2>
        <input name="appKey" value={keys.twitter.appKey || ''} onChange={handleTwitterChange} placeholder="App Key" />
        <input name="appSecret" value={keys.twitter.appSecret || ''} onChange={handleTwitterChange} placeholder="App Secret" />
        <input name="accessToken" value={keys.twitter.accessToken || ''} onChange={handleTwitterChange} placeholder="Access Token" />
        <input name="accessSecret" value={keys.twitter.accessSecret || ''} onChange={handleTwitterChange} placeholder="Access Secret" />

        <h2>Google Gemini API Key</h2>
        <input value={keys.gemini || ''} onChange={handleGeminiChange} placeholder="Gemini API Key" />

        <button type="submit">Save Keys</button>
      </form>
    </div>
  );
}

export default SettingsPage;
