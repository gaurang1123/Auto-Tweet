import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

function ScheduledPosts() {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingPost, setViewingPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');

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

  const formatThreadContent = (content) => {
    // Remove ** formatting and split into individual tweets
    const cleanContent = content.replace(/\*\*(.*?)\*\*/g, '$1');
    const tweets = cleanContent.split(/Tweet \d+\/\d+:\s*/g).filter(tweet => tweet.trim());
    return tweets;
  };

  const copyToClipboard = (content) => {
    const cleanContent = content.replace(/\*\*(.*?)\*\*/g, '$1');
    navigator.clipboard.writeText(cleanContent).then(() => {
      toast.success('Thread copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const copyTweet = (tweet, index) => {
    const cleanTweet = tweet.replace(/\*\*(.*?)\*\*/g, '$1');
    navigator.clipboard.writeText(cleanTweet).then(() => {
      toast.success(`Tweet ${index + 1} copied to clipboard!`);
    }).catch(() => {
      toast.error('Failed to copy tweet');
    });
  };

  const startEdit = (post) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${API_URL}/scheduled-posts/${editingPost._id}`, {
        content: editContent
      });
      toast.success('Post updated successfully');
      setEditingPost(null);
      setEditContent('');
      loadScheduledPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Error updating post');
    }
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
        {scheduledPosts.map(post => {
          const tweets = formatThreadContent(post.content);
          return (
            <div key={post._id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>Generated Thread ({tweets.length} tweets)</h4>
                  <small style={{ color: '#666' }}>
                    Created: {new Date(post.createdAt).toLocaleString()}
                  </small>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => copyToClipboard(post.content)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    📋 Copy All
                  </button>
                  <button
                    onClick={() => startEdit(post)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ffc107',
                      color: 'black',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    ✏️ Edit
                  </button>
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
                    👁️ View Details
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
                    🚀 Post Now
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
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Individual Tweets Display */}
              <div style={{ marginBottom: '15px' }}>
                {tweets.map((tweet, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    margin: '8px 0',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    borderLeft: '4px solid #1da1f2',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                          Tweet {index + 1}/{tweets.length}
                        </div>
                        <p style={{ margin: 0, lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                          {tweet.replace(/\*\*(.*?)\*\*/g, '$1').trim()}
                        </p>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                          {tweet.replace(/\*\*(.*?)\*\*/g, '$1').trim().length} characters
                        </div>
                      </div>
                      <button
                        onClick={() => copyTweet(tweet, index)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '12px',
                          marginLeft: '10px'
                        }}
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '14px', color: '#666' }}>
                <span>Total characters: {post.content.replace(/\*\*(.*?)\*\*/g, '$1').length}</span>
                {post.selectedPostIds && (
                  <span style={{ marginLeft: '15px' }}>
                    Based on {post.selectedPostIds.length} selected posts
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Post Modal */}
      {editingPost && (
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
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Edit Thread</h3>
              <button
                onClick={() => setEditingPost(null)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Cancel
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Thread Content:
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{
                  width: '100%',
                  height: '300px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}
              />
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                Edit the thread content. Use ** for bold text (will be removed when copying).
              </small>
            </div>

            <button
              onClick={saveEdit}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

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
              <h4>Generated Thread:</h4>
              {formatThreadContent(viewingPost.content).map((tweet, index) => (
                <div key={index} style={{
                  padding: '12px',
                  margin: '8px 0',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  borderLeft: '4px solid #1da1f2'
                }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                    Tweet {index + 1}/{formatThreadContent(viewingPost.content).length}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {tweet.replace(/\*\*(.*?)\*\*/g, '$1').trim()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    {tweet.replace(/\*\*(.*?)\*\*/g, '$1').trim().length} characters
                  </div>
                </div>
              ))}
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
