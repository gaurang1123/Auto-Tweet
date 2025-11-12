import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

function PostSelector() {
  const [posts, setPosts] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingPost, setViewingPost] = useState(null);
  const [contextEditor, setContextEditor] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/analyze-tweets?limit=50`);
      setPosts(response.data.tweets);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Error loading posts');
    }
    setLoading(false);
  };

  const togglePostSelection = (post) => {
    setSelectedPosts(prev => {
      const isSelected = prev.find(p => p.id === post.id);
      if (isSelected) {
        return prev.filter(p => p.id !== post.id);
      } else {
        return [...prev, post];
      }
    });
  };

  const openEditor = () => {
    const contextText = selectedPosts.map(post => 
      `${post.author} (${post.tag}):\n"${post.text}"\nKey Info: ${JSON.stringify(post.extracted)}\n\n`
    ).join('');
    
    setContextEditor(contextText);
    setShowEditor(true);
  };

  const generateFromContext = async () => {
    if (!contextEditor.trim()) {
      toast.warning('Please add some context');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/generate-enhanced`, {
        niche: 'crypto',
        subCategory: 'news',
        userInfo: contextEditor,
        useContext: false // Using custom context
      });
      
      setGeneratedContent(response.data.content);
      toast.success('Content generated successfully');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Error generating content');
    }
    setLoading(false);
  };

  const saveToSchedule = async () => {
    if (!generatedContent.trim()) {
      toast.warning('No content to save');
      return;
    }

    try {
      await axios.post(`${API_URL}/scheduled-posts`, {
        content: generatedContent,
        context: contextEditor,
        selectedPostIds: selectedPosts.map(p => p.id),
        createdAt: new Date().toISOString()
      });
      
      toast.success('Post saved to schedule');
      setGeneratedContent('');
      setContextEditor('');
      setSelectedPosts([]);
      setShowEditor(false);
    } catch (error) {
      console.error('Error saving to schedule:', error);
      toast.error('Error saving to schedule');
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  if (showEditor) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Context Editor</h2>
          <button 
            onClick={() => setShowEditor(false)}
            style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            ← Back to Selection
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '70vh' }}>
          <div>
            <h4>Edit Context (Remove unnecessary parts)</h4>
            <textarea
              value={contextEditor}
              onChange={(e) => setContextEditor(e.target.value)}
              style={{
                width: '100%',
                height: '400px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
              placeholder="Edit your context here..."
            />
            <button 
              onClick={generateFromContext}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                marginTop: '10px',
                fontSize: '16px'
              }}
            >
              {loading ? 'Generating...' : '✨ Generate Content'}
            </button>
          </div>

          <div>
            <h4>Generated Content</h4>
            <div style={{
              height: '400px',
              padding: '15px',
              border: '2px solid #1da1f2',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa',
              whiteSpace: 'pre-wrap',
              overflow: 'auto'
            }}>
              {generatedContent || 'Generated content will appear here...'}
            </div>
            
            {generatedContent && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  Character count: {generatedContent.length}/280
                </div>
                <button 
                  onClick={saveToSchedule}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1da1f2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                >
                  📅 Save to Schedule
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Select Posts for Context</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ padding: '8px 12px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
            Selected: {selectedPosts.length}
          </span>
          {selectedPosts.length > 0 && (
            <button 
              onClick={openEditor}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1da1f2',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Open Editor →
            </button>
          )}
          <button 
            onClick={loadPosts}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {posts.map(post => (
          <div key={post.id} style={{
            border: selectedPosts.find(p => p.id === post.id) ? '2px solid #1da1f2' : '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: selectedPosts.find(p => p.id === post.id) ? '#f0f8ff' : '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <strong>@{post.author}</strong> ({post.tag})
                <span style={{ 
                  marginLeft: '10px',
                  padding: '2px 6px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}>
                  Score: {post.relevanceScore}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setViewingPost(post)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}
                >
                  View Full
                </button>
                <button
                  onClick={() => togglePostSelection(post)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: selectedPosts.find(p => p.id === post.id) ? '#dc3545' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}
                >
                  {selectedPosts.find(p => p.id === post.id) ? 'Remove' : 'Select'}
                </button>
              </div>
            </div>

            <p style={{ margin: '0 0 10px 0', color: '#333' }}>
              {post.text.length > 200 ? `${post.text.substring(0, 200)}...` : post.text}
            </p>

            <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '15px' }}>
              <span>❤️ {post.metrics.like_count}</span>
              <span>🔄 {post.metrics.retweet_count}</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              {post.extracted.keywords.length > 0 && (
                <span>🏷️ {post.extracted.keywords.join(', ')}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Post Modal */}
      {viewingPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>@{viewingPost.author} ({viewingPost.tag})</h3>
              <button
                onClick={() => setViewingPost(null)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px'
                }}
              >
                Close
              </button>
            </div>
            
            <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>{viewingPost.text}</p>
            
            <div style={{ marginBottom: '15px' }}>
              <strong>Extracted Data:</strong>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto'
              }}>
                {JSON.stringify(viewingPost.extracted, null, 2)}
              </pre>
            </div>
            
            <div style={{ fontSize: '14px', color: '#666' }}>
              <div>❤️ {viewingPost.metrics.like_count} likes</div>
              <div>🔄 {viewingPost.metrics.retweet_count} retweets</div>
              <div>💬 {viewingPost.metrics.reply_count} replies</div>
              <div>📅 {new Date(viewingPost.created_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No posts available. Fetch some posts first from the Fetch Posts page.</p>
        </div>
      )}
    </div>
  );
}

export default PostSelector;
