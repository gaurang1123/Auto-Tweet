import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function SettingsPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalPosted: 0, todayPosted: 0 });

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Settings & Configuration</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>System Statistics</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ 
            padding: '20px', 
            border: '2px solid #1da1f2', 
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '150px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1da1f2' }}>{stats.totalUsers}</h3>
            <p style={{ margin: 0 }}>Monitored Users</p>
          </div>
          <div style={{ 
            padding: '20px', 
            border: '2px solid #28a745', 
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '150px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>{stats.totalPosted}</h3>
            <p style={{ margin: 0 }}>Total Posts</p>
          </div>
          <div style={{ 
            padding: '20px', 
            border: '2px solid #ffc107', 
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '150px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>{stats.todayPosted}</h3>
            <p style={{ margin: 0 }}>Today's Posts</p>
          </div>
        </div>
      </div>

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h2>API Configuration</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          API keys are now configured via environment variables for security. 
          Update your <code>.env</code> file in the server directory.
        </p>
        
        <div style={{ backgroundColor: '#e9ecef', padding: '15px', borderRadius: '5px', fontFamily: 'monospace' }}>
          <strong>Required Environment Variables:</strong><br />
          TWITTER_APP_KEY=your_twitter_app_key<br />
          TWITTER_APP_SECRET=your_twitter_app_secret<br />
          TWITTER_ACCESS_TOKEN=your_twitter_access_token<br />
          TWITTER_ACCESS_SECRET=your_twitter_access_secret<br />
          GEMINI_API_KEY=your_gemini_api_key<br />
          MONGODB_URI=your_mongodb_atlas_uri
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Setup Instructions:</h3>
          <ol style={{ lineHeight: '1.6' }}>
            <li>Copy <code>.env.example</code> to <code>.env</code> in the server directory</li>
            <li>Get Twitter API keys from <a href="https://developer.twitter.com/apps" target="_blank" rel="noopener noreferrer">Twitter Developer Portal</a></li>
            <li>Get Gemini API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
            <li>Set up MongoDB Atlas and get connection URI</li>
            <li>Restart the server after updating environment variables</li>
          </ol>
        </div>
      </div>

      <div style={{ 
        marginTop: '30px',
        padding: '20px', 
        backgroundColor: '#d1ecf1', 
        borderRadius: '8px',
        border: '1px solid #bee5eb'
      }}>
        <h2>Airdrop Optimization Tips</h2>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Monitor Key Influencers:</strong> Add top crypto influencers who share airdrop alpha</li>
          <li><strong>Track Companies:</strong> Follow projects that announce airdrops and token launches</li>
          <li><strong>Post Timing:</strong> Share content during peak crypto hours (9 AM, 1 PM, 5 PM, 8 PM UTC)</li>
          <li><strong>Engagement Focus:</strong> Use hashtags like #Airdrop #DeFi #Crypto for maximum reach</li>
          <li><strong>Fresh Content:</strong> System only scans last 2 days to keep content relevant</li>
        </ul>
      </div>

      <button 
        onClick={loadStats}
        style={{ 
          marginTop: '20px',
          padding: '10px 20px', 
          backgroundColor: '#1da1f2', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px'
        }}
      >
        Refresh Stats
      </button>
    </div>
  );
}

export default SettingsPage;
