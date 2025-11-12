import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

function FetchPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchStatus, setFetchStatus] = useState([]);
  const [lastFetch, setLastFetch] = useState(null);
  const [apiUsage, setApiUsage] = useState(null);

  const loadFetchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/fetch-status`);
      setFetchStatus(response.data.status);
      setApiUsage(response.data);
    } catch (error) {
      console.error('Error loading fetch status:', error);
    }
  };

  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fetch-all-posts`);
      setPosts(response.data.results);
      setLastFetch(new Date().toLocaleString());
      
      if (response.data.errors.length > 0) {
        response.data.errors.forEach(error => toast.error(error));
      }
      
      toast.success(`Fetched ${response.data.totalNewTweets} tweets, saved ${response.data.totalSavedTweets} to database`);
      loadFetchStatus();
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Error fetching posts');
    }
    setLoading(false);
  };

  const runCleanup = async () => {
    try {
      const response = await axios.post(`${API_URL}/daily-cleanup`);
      toast.success(response.data.message);
      loadFetchStatus();
    } catch (error) {
      console.error('Error running cleanup:', error);
      toast.error('Error running cleanup');
    }
  };

  useEffect(() => {
    loadFetchStatus();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'skipped': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const canFetchAny = fetchStatus.some(user => user.canFetch);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Manual Post Fetch (No Limits)</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {apiUsage?.database?.cleanupNeeded && (
            <button 
              onClick={runCleanup}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#ffc107', 
                color: 'black', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🧹 Cleanup Used Tweets
            </button>
          )}
          <button 
            onClick={fetchAllPosts}
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: loading ? '#6c757d' : '#1da1f2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Fetching...' : 'Fetch All Posts'}
          </button>
        </div>
      </div>

      {/* Database Stats */}
      {apiUsage?.database && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#e9ecef',
          borderRadius: '5px',
          border: '1px solid #dee2e6'
        }}>
          <h4>📊 Database Status</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div><strong>Total Tweets:</strong> {apiUsage.database.totalTweets}</div>
            <div><strong>Unused:</strong> {apiUsage.database.unusedTweets}</div>
            <div><strong>Used:</strong> {apiUsage.database.usedTweets}</div>
            <div>
              <strong>Status:</strong> 
              <span style={{ color: apiUsage.database.cleanupNeeded ? '#dc3545' : '#28a745' }}>
                {apiUsage.database.cleanupNeeded ? ' Cleanup needed' : ' Clean'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* User Status */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h4>User Status (Manual Fetch)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {fetchStatus.map(user => (
            <div key={user.username} style={{ 
              padding: '12px', 
              backgroundColor: '#d4edda',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                @{user.username} ({user.tag})
              </div>
              
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                {user.hasTimestamp ? (
                  <span>📅 Last post: {new Date(user.lastPostTime).toLocaleDateString()}</span>
                ) : (
                  <span>🆕 No timestamp yet (will fetch 2 posts)</span>
                )}
              </div>
              
              <div>
                <span style={{ color: '#155724' }}>✅ Ready to fetch anytime</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lastFetch && (
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Last fetch: {lastFetch}
        </p>
      )}

      {/* Posts Results */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {posts.map(userResult => (
          <div key={userResult.username} style={{ 
            border: `2px solid ${getStatusColor(userResult.status)}`,
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: getStatusColor(userResult.status) }}>
                @{userResult.username} ({userResult.tag})
              </h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {userResult.fetchType && (
                  <span style={{ 
                    padding: '2px 6px', 
                    backgroundColor: userResult.fetchType === 'initial' ? '#6f42c1' : '#17a2b8',
                    color: 'white',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}>
                    {userResult.fetchType === 'initial' ? 'Initial (2 posts)' : 'Incremental'}
                  </span>
                )}
                {userResult.newTweets > 0 && (
                  <span style={{ 
                    padding: '2px 6px', 
                    backgroundColor: '#28a745',
                    color: 'white',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}>
                    {userResult.newTweets} fetched, {userResult.savedTweets} saved
                  </span>
                )}
                <span style={{ 
                  padding: '4px 8px', 
                  backgroundColor: getStatusColor(userResult.status),
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {userResult.status.toUpperCase()}
                </span>
              </div>
            </div>

            {userResult.message && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>{userResult.message}</p>
            )}

            {userResult.lastTimestamp && (
              <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                🕒 Fetching posts after: {new Date(userResult.lastTimestamp).toLocaleString()}
              </p>
            )}

            {userResult.tweets && userResult.tweets.length > 0 && (
              <div>
                <p style={{ margin: '10px 0', fontWeight: 'bold' }}>
                  {userResult.newTweets} posts fetched:
                </p>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {userResult.tweets.map(tweet => (
                    <div key={tweet.id} style={{ 
                      padding: '10px',
                      margin: '5px 0',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      borderLeft: '3px solid #1da1f2'
                    }}>
                      <p style={{ margin: '0 0 8px 0' }}>{tweet.text}</p>
                      <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '15px' }}>
                        <span>❤️ {tweet.metrics.like_count}</span>
                        <span>🔄 {tweet.metrics.retweet_count}</span>
                        <span>💬 {tweet.metrics.reply_count}</span>
                        <span>📅 {new Date(tweet.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userResult.status === 'success' && userResult.newTweets === 0 && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No new posts since last fetch</p>
            )}
          </div>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No posts fetched yet. Click "Daily Fetch" to get started.</p>
          <p style={{ fontSize: '14px' }}>First fetch gets 2 recent posts, daily fetches get all new posts since then.</p>
        </div>
      )}
    </div>
  );
}

export default FetchPosts;
