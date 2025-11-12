import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

function MainPage() {
  const [niche, setNiche] = useState('crypto');
  const [subCategory, setSubCategory] = useState('news');
  const [userInfo, setUserInfo] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [usageStats, setUsageStats] = useState(null);

  const loadUsageStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/usage-stats`);
      setUsageStats(response.data);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const generateContent = async () => {
    if (!niche || !subCategory) {
      toast.warning('Please select niche and sub-category');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/generate-enhanced`, {
        niche,
        subCategory,
        userInfo,
        useContext: true
      });
      
      setGeneratedContent(response.data.content);
      
      if (response.data.contextUsed) {
        toast.success(`Generated with context from ${response.data.contextTweets} recent tweets`);
      } else {
        toast.success('Content generated successfully');
      }
      
      loadUsageStats();
    } catch (error) {
      console.error('Error generating content:', error);
      if (error.response?.status === 429) {
        toast.error(`Rate limit exceeded. Try again in ${error.response.data.retryAfter} seconds`);
      } else {
        toast.error('Error generating content');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsageStats();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🚀 Enhanced Tweet Generator</h1>
      
      {/* Usage Stats */}
      {usageStats && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: usageStats.remainingRequests > 5 ? '#d4edda' : '#fff3cd',
          borderRadius: '5px',
          border: '1px solid #c3e6cb'
        }}>
          <h4>⚡ API Usage (Context-Optimized)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div><strong>Remaining:</strong> {usageStats.remainingRequests}/{usageStats.maxPerMinute}</div>
            <div><strong>Reset in:</strong> {usageStats.resetIn}s</div>
            <div><strong>Context Tweets:</strong> {usageStats.unusedTweetsAvailable}</div>
            <div><strong>Status:</strong> {usageStats.contextOptimized ? '✅ Optimized' : '⚠️ Basic'}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <h3>Content Settings</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Niche:
            </label>
            <select 
              value={niche} 
              onChange={(e) => setNiche(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="crypto">Cryptocurrency</option>
              <option value="tech">Technology</option>
              <option value="business">Business</option>
              <option value="finance">Finance</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Sub-category:
            </label>
            <select 
              value={subCategory} 
              onChange={(e) => setSubCategory(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="news">News & Updates</option>
              <option value="analysis">Market Analysis</option>
              <option value="tips">Tips & Advice</option>
              <option value="trends">Trends & Insights</option>
              <option value="airdrops">Airdrops & Opportunities</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Additional Context (Optional):
            </label>
            <textarea 
              value={userInfo}
              onChange={(e) => setUserInfo(e.target.value)}
              placeholder="Add specific details, keywords, or focus areas..."
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>

          <button 
            onClick={generateContent}
            disabled={loading || (usageStats && usageStats.remainingRequests <= 0)}
            style={{ 
              width: '100%',
              padding: '12px', 
              backgroundColor: loading || (usageStats && usageStats.remainingRequests <= 0) ? '#6c757d' : '#1da1f2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading || (usageStats && usageStats.remainingRequests <= 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '🔄 Generating...' : '✨ Generate Enhanced Content'}
          </button>
        </div>

        <div>
          <h3>Generated Content</h3>
          <div style={{ 
            minHeight: '200px',
            padding: '15px',
            border: '2px solid #1da1f2',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            whiteSpace: 'pre-wrap'
          }}>
            {generatedContent || 'Generated content will appear here...'}
          </div>
          
          {generatedContent && (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              <strong>Character count:</strong> {generatedContent.length}/280
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h4>🧠 Enhanced Features</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>Context-Aware:</strong> Uses recent tweets from your monitored users for trending topics</li>
          <li><strong>Rate Limited:</strong> Smart usage tracking to avoid API limits</li>
          <li><strong>Optimized Prompts:</strong> Concise prompts to reduce token usage</li>
          <li><strong>Fallback System:</strong> Automatic fallback if context limits are hit</li>
        </ul>
      </div>
    </div>
  );
}

export default MainPage;
