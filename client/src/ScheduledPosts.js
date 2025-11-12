import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

function ScheduledPosts() {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingPost, setViewingPost] = useState(null);

  const loadScheduledPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/scheduled-posts`);
      setScheduledPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
      toast.error('Error loading scheduled posts');
    }
    setLoading(false);
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this scheduled post?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/scheduled-posts/${postId}`);
      toast.success('Post deleted successfully');
      loadScheduledPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post');
    }
  };

  const postNow = async (post) => {
    if (!window.confirm('Post this content immediately?')) {
      return;
    }

    try {
      // Here you would integrate with your Twitter posting system
      toast.success('Post would be sent to Twitter (integration needed)');
      // Optionally delete from schedule after posting
      // await deletePost(post._id);
    } catch (error) {
      console.error('Error posting:', error);
      toast.error('Error posting to Twitter');
    }
  };

  useEffect(() => {
    loadScheduledPosts();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Scheduled Posts</h2>
        <button 
          onClick={loadScheduledPosts}
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

      <div style={{ display: 'grid', gap: '20px' }}>
        {scheduledPosts.map(post => (
          <div key={post._id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>Generated Content</h4>
                <small style={{ color: '#666' }}>
                  Created: {new Date(post.createdAt).toLocaleString()}
                </small>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setViewingPost(post)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  View Details
                </button>
                <button
                  onClick={() => postNow(post)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#1da1f2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  Post Now
                </button>
                <button
                  onClick={() => deletePost(post._id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            <div style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              borderLeft: '4px solid #1da1f2',
              marginBottom: '10px'
            }}>
              <p style={{ margin: 0, lineHeight: '1.5' }}>{post.content}</p>
            </div>

            <div style={{ fontSize: '14px', color: '#666' }}>
              <span>Character count: {post.content.length}/280</span>
              {post.selectedPostIds && (
                <span style={{ marginLeft: '15px' }}>
                  Based on {post.selectedPostIds.length} selected posts
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Post Details Modal */}
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
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Post Details</h3>
              <button
                onClick={() => setViewingPost(null)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Close
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4>Generated Content:</h4>
              <div style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                borderLeft: '4px solid #1da1f2'
              }}>
                {viewingPost.content}
              </div>
              <small style={{ color: '#666' }}>
                {viewingPost.content.length}/280 characters
              </small>
            </div>

            {viewingPost.context && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Context Used:</h4>
                <pre style={{
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  maxHeight: '300px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {viewingPost.context}
                </pre>
              </div>
            )}

            <div style={{ fontSize: '14px', color: '#666' }}>
              <div><strong>Created:</strong> {new Date(viewingPost.createdAt).toLocaleString()}</div>
              {viewingPost.selectedPostIds && (
                <div><strong>Based on:</strong> {viewingPost.selectedPostIds.length} selected posts</div>
              )}
            </div>
          </div>
        </div>
      )}

      {scheduledPosts.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No scheduled posts yet. Create some using the Post Selector.</p>
        </div>
      )}
    </div>
  );
}

export default ScheduledPosts;
