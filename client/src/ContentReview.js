import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

function ContentReview() {
  const [posts, setPosts] = useState([]);
  const [rewrittenPost, setRewrittenPost] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [postedHistory, setPostedHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [posting, setPosting] = useState(false);

  const scanPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/scan`);
      setPosts(response.data.posts);
      
      // Load posted history
      const historyResponse = await axios.get(`${API_URL}/posted-history`);
      setPostedHistory(historyResponse.data);
      
      if (response.data.posts.length === 0) {
        toast.info('No new crypto posts found in the last 2 days');
      } else {
        toast.success(`Found ${response.data.posts.length} crypto posts!`);
      }
    } catch (error) {
      console.error('Error scanning posts:', error);
      if (error.response?.status === 400) {
        toast.error('API configuration error. Check if users are added and API keys are configured.');
      } else {
        toast.error('Error scanning posts. Please try again.');
      }
    }
    setLoading(false);
  };

  const rewritePost = async (post) => {
    setRewriting(true);
    try {
      const response = await axios.post(`${API_URL}/rewrite`, {
        originalText: post.text,
        author: post.author,
        tag: post.tag
      });
      setRewrittenPost(response.data.rewrittenText);
      setSelectedPost(post);
      toast.success('Content rewritten successfully!');
    } catch (error) {
      console.error('Error rewriting post:', error);
      if (error.response?.status === 400) {
        toast.error('Gemini API key not configured. Please add valid GEMINI_API_KEY to .env file.');
      } else {
        toast.error('Error rewriting post. Please check your API configuration.');
      }
    }
    setRewriting(false);
  };

  const postTweet = async () => {
    setPosting(true);
    try {
      await axios.post(`${API_URL}/post-tweet`, { 
        tweet: rewrittenPost,
        originalTweetId: selectedPost.id,
        originalAuthor: selectedPost.author
      });
      toast.success('Tweet posted successfully!');
      setRewrittenPost('');
      setSelectedPost(null);
      scanPosts(); // Refresh to update duplicate status
    } catch (error) {
      console.error('Error posting tweet:', error);
      if (error.response?.status === 400) {
        toast.error('Twitter API keys not configured properly.');
      } else {
        toast.error('Error posting tweet. Please try again.');
      }
    }
    setPosting(false);
  };

  const influencerPosts = posts.filter(p => p.tag === 'influencer');
  const companyPosts = posts.filter(p => p.tag === 'company');

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Airdrop Content Review (Last 2 Days)</h2>
        <button 
          onClick={scanPosts} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: loading ? '#6c757d' : '#1da1f2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Scanning...' : 'Scan All Users'}
        </button>
      </div>
      
      {posts.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px' }}>
          <strong>Found {posts.length} crypto posts</strong> - {influencerPosts.length} from influencers, {companyPosts.length} from companies
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#1da1f2' }}>Influencer Posts ({influencerPosts.length})</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {influencerPosts.map(post => (
              <div key={post.id} style={{
                border: '2px solid #1da1f2', 
                margin: '10px 0', 
                padding: '15px',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
              }}>
                <p><strong>@{post.author}</strong></p>
                <p style={{ margin: '10px 0', lineHeight: '1.4' }}>{post.text}</p>
                <small style={{ color: '#666' }}>
                  Posted: {new Date(post.createdAt).toLocaleString()}
                </small>
                <br />
                <button 
                  onClick={() => rewritePost(post)}
                  disabled={rewriting}
                  style={{ 
                    marginTop: '10px',
                    padding: '8px 16px', 
                    backgroundColor: rewriting ? '#6c757d' : '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: rewriting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {rewriting ? 'Rewriting...' : 'Rewrite for Airdrop Hunters'}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#28a745' }}>Company Posts ({companyPosts.length})</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {companyPosts.map(post => (
              <div key={post.id} style={{
                border: '2px solid #28a745', 
                margin: '10px 0', 
                padding: '15px',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
              }}>
                <p><strong>@{post.author}</strong></p>
                <p style={{ margin: '10px 0', lineHeight: '1.4' }}>{post.text}</p>
                <small style={{ color: '#666' }}>
                  Posted: {new Date(post.createdAt).toLocaleString()}
                </small>
                <br />
                <button 
                  onClick={() => rewritePost(post)}
                  disabled={rewriting}
                  style={{ 
                    marginTop: '10px',
                    padding: '8px 16px', 
                    backgroundColor: rewriting ? '#6c757d' : '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: rewriting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {rewriting ? 'Rewriting...' : 'Rewrite for Opportunities'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {rewrittenPost && (
        <div style={{
          background: '#fff3cd', 
          border: '2px solid #ffc107',
          padding: '20px', 
          margin: '20px 0',
          borderRadius: '8px'
        }}>
          <h3>🚀 AI Enhanced for Airdrop Leaderboard ({selectedPost?.tag})</h3>
          <div style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            marginBottom: '15px'
          }}>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.4' }}>{rewrittenPost}</p>
            <small style={{ color: '#666', marginTop: '10px', display: 'block' }}>
              Characters: {rewrittenPost.length}/280
            </small>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => navigator.clipboard.writeText(rewrittenPost)}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📋 Copy to Clipboard
            </button>
            <button 
              onClick={() => {
                setRewrittenPost('');
                setSelectedPost(null);
              }}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {postedHistory.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Recent Posts ({postedHistory.length})</h3>
          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto',
            border: '1px solid #ddd',
            borderRadius: '5px',
            padding: '10px'
          }}>
            {postedHistory.map((posted, index) => (
              <div key={index} style={{ 
                fontSize: '14px', 
                color: '#666',
                padding: '5px 0',
                borderBottom: '1px solid #eee'
              }}>
                <strong>From @{posted.originalAuthor}</strong> - {new Date(posted.postedAt).toLocaleString()}
                <br />
                <span style={{ fontSize: '12px' }}>{posted.rewrittenContent.substring(0, 100)}...</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentReview;
