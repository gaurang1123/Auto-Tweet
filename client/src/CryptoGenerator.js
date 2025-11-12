import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api';

function CryptoGenerator() {
  const [promptTypes, setPromptTypes] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [customContext, setCustomContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [useContext, setUseContext] = useState(true);
  const [importedPosts, setImportedPosts] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [availablePosts, setAvailablePosts] = useState([]);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');

  const loadPromptTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/crypto/prompt-types`);
      setPromptTypes(response.data.promptTypes);
    } catch (error) {
      console.error('Error loading prompt types:', error);
      toast.error('Error loading prompt types');
    }
  };

  const buildFinalPrompt = async () => {
    if (!selectedPrompt) {
      toast.warning('Please select a prompt type');
      return;
    }

    try {
      let contextData = '';
      
      // Get combined context if requested
      if (useContext) {
        try {
          const contextResponse = await axios.get(`${API_URL}/combined-context?niche=crypto`);
          if (contextResponse.data.success) {
            contextData = contextResponse.data.combinedPrompt;
          }
        } catch (error) {
          console.error('Context fetch error:', error);
          toast.error('Failed to fetch context data');
          return;
        }
      }

      // Add custom context if provided
      if (customContext) {
        contextData += `\n\nCustom Context:\n${customContext}`;
      }

      // Get the prompt template from server
      const promptResponse = await axios.get(`${API_URL}/crypto/prompt-types`);
      const promptData = promptResponse.data.promptTypes.find(p => p.id === selectedPrompt.id);
      
      if (promptData) {
        // Build the final prompt by replacing placeholder
        const builtPrompt = promptData.prompt?.replace('{contextData}', contextData) || 
          `Generate a ${selectedPrompt.title} crypto post.\n\nContext:\n${contextData}`;
        
        setFinalPrompt(builtPrompt);
        setShowPromptEditor(true);
      }
    } catch (error) {
      console.error('Error building prompt:', error);
      toast.error('Error building prompt');
    }
  };

  const generateFromPrompt = async () => {
    if (!finalPrompt.trim()) {
      toast.warning('Prompt is empty');
      return;
    }

    setLoading(true);
    try {
      // Send the edited prompt directly to Gemini
      const response = await axios.post(`${API_URL}/generate-enhanced`, {
        niche: 'crypto',
        subCategory: selectedPrompt.title,
        userInfo: finalPrompt,
        useContext: false // Using custom prompt
      });
      
      setGeneratedContent(response.data.content);
      setShowPromptEditor(false);
      toast.success(`Generated ${selectedPrompt.title} thread successfully`);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(error.response?.data?.error || 'Error generating content');
    }
    setLoading(false);
  };

  const loadAvailablePosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/analyze-tweets?limit=50`);
      setAvailablePosts(response.data.tweets);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Error loading posts');
    }
  };

  const importSelectedPosts = () => {
    const postsContext = importedPosts.map(post => 
      `${post.author} (${post.tag}):\n"${post.text}"\nKey Info: ${JSON.stringify(post.extracted)}\n`
    ).join('\n');
    
    setCustomContext(prev => prev + '\n\nImported Posts Context:\n' + postsContext);
    setShowImportModal(false);
    toast.success(`Imported ${importedPosts.length} posts as context`);
  };

  const togglePostImport = (post) => {
    setImportedPosts(prev => {
      const isSelected = prev.find(p => p.id === post.id);
      if (isSelected) {
        return prev.filter(p => p.id !== post.id);
      } else {
        return [...prev, post];
      }
    });
  };

  const generateContent = async () => {
    if (!selectedPrompt) {
      toast.warning('Please select a prompt type');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/crypto/generate-crypto`, {
        promptType: selectedPrompt.id,
        customContext,
        useContext
      });
      
      setGeneratedContent(response.data.content);
      toast.success(`Generated ${response.data.promptType} thread successfully`);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error(error.response?.data?.error || 'Error generating content');
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
        context: `Prompt Type: ${selectedPrompt.title}\nCustom Context: ${customContext}`,
        createdAt: new Date().toISOString()
      });
      
      toast.success('Thread saved to schedule');
      setGeneratedContent('');
      setCustomContext('');
    } catch (error) {
      console.error('Error saving to schedule:', error);
      toast.error('Error saving to schedule');
    }
  };

  useEffect(() => {
    loadPromptTypes();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🚀 High-Alpha Crypto Thread Generator</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Generate high-value crypto threads with insider knowledge and actionable alpha
      </p>

      {/* Prompt Type Selection Cards */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Select Thread Type</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          {promptTypes.map(prompt => (
            <div 
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt)}
              style={{
                border: selectedPrompt?.id === prompt.id ? '3px solid #1da1f2' : '2px solid #ddd',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                backgroundColor: selectedPrompt?.id === prompt.id ? '#f0f8ff' : '#fff',
                transition: 'all 0.3s ease',
                boxShadow: selectedPrompt?.id === prompt.id ? '0 4px 12px rgba(29,161,242,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <h4 style={{ 
                margin: '0 0 10px 0', 
                color: selectedPrompt?.id === prompt.id ? '#1da1f2' : '#333',
                fontSize: '18px'
              }}>
                {prompt.title}
              </h4>
              <p style={{ 
                margin: 0, 
                color: '#666', 
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {prompt.description}
              </p>
              {selectedPrompt?.id === prompt.id && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  backgroundColor: '#1da1f2',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  ✓ Selected
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Options */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '30px',
        marginBottom: '30px'
      }}>
        <div>
          <h3>Configuration</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <input 
                type="checkbox"
                checked={useContext}
                onChange={(e) => setUseContext(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontWeight: 'bold' }}>Use Real-Time Context</span>
            </label>
            <small style={{ color: '#666' }}>
              Include latest tweets, market data, and trending topics for more relevant content
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Custom Context (Optional):
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <button
                onClick={() => {
                  setShowImportModal(true);
                  loadAvailablePosts();
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                📥 Import Posts Context
              </button>
              {importedPosts.length > 0 && (
                <span style={{
                  padding: '8px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {importedPosts.length} posts imported
                </span>
              )}
            </div>
            <textarea 
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="Add specific project names, recent events, or focus areas..."
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '6px', 
                border: '1px solid #ddd',
                minHeight: '120px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={buildFinalPrompt}
              disabled={!selectedPrompt}
              style={{
                flex: 1,
                padding: '15px',
                backgroundColor: !selectedPrompt ? '#6c757d' : '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: !selectedPrompt ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease'
              }}
            >
              👁️ Preview & Edit Prompt
            </button>
            
            <button 
              onClick={generateContent}
              disabled={loading || !selectedPrompt}
              style={{
                flex: 1,
                padding: '15px',
                backgroundColor: loading || !selectedPrompt ? '#6c757d' : '#1da1f2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading || !selectedPrompt ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease'
              }}
            >
              {loading ? '🔄 Generating...' : '🚀 Quick Generate'}
            </button>
          </div>
        </div>

        <div>
          <h3>Generated Thread</h3>
          <div style={{
            minHeight: '300px',
            padding: '20px',
            border: '2px solid #1da1f2',
            borderRadius: '12px',
            backgroundColor: '#f8f9fa',
            whiteSpace: 'pre-wrap',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            {generatedContent || 'Your high-alpha crypto thread will appear here...'}
          </div>
          
          {generatedContent && (
            <div style={{ marginTop: '15px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                <strong>Thread Length:</strong> {generatedContent.split('\n\n').length} tweets
              </div>
              <button 
                onClick={saveToSchedule}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📅 Save Thread to Schedule
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Style Guide */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h4>🎯 High-Alpha Thread Style Guide</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <strong>Format:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
              <li>Thread format with 🧵 emoji</li>
              <li>Bold hook qualifying readers</li>
              <li>Numbered/bulleted steps</li>
              <li>Clear CTA and NFA disclaimer</li>
            </ul>
          </div>
          <div>
            <strong>Language:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
              <li>Crypto vernacular (Alpha, DYOR, NFA)</li>
              <li>Assertive, energetic tone</li>
              <li>Insider knowledge perspective</li>
              <li>Bold key numbers and tokens</li>
            </ul>
          </div>
          <div>
            <strong>Content:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px' }}>
              <li>Actionable, step-by-step guides</li>
              <li>Specific data and partnerships</li>
              <li>High-value financial opportunities</li>
              <li>Technical breakdowns simplified</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Prompt Editor Modal */}
      {showPromptEditor && (
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
            borderRadius: '12px',
            maxWidth: '900px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Edit Final Prompt - {selectedPrompt?.title}</h3>
              <button
                onClick={() => setShowPromptEditor(false)}
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Final Prompt (Edit as needed):
              </label>
              <textarea
                value={finalPrompt}
                onChange={(e) => setFinalPrompt(e.target.value)}
                style={{
                  width: '100%',
                  height: '400px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
                placeholder="Your final prompt will appear here..."
              />
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                Edit the prompt above to fine-tune the generation. All context and instructions are included.
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={generateFromPrompt}
                disabled={loading || !finalPrompt.trim()}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: loading || !finalPrompt.trim() ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading || !finalPrompt.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '🔄 Generating...' : '🚀 Generate with Edited Prompt'}
              </button>
              
              <button
                onClick={() => setShowPromptEditor(false)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Posts Modal */}
      {showImportModal && (
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
            borderRadius: '12px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Import Posts as Context</h3>
              <button
                onClick={() => setShowImportModal(false)}
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

            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Selected: {importedPosts.length} posts</span>
              <button
                onClick={importSelectedPosts}
                disabled={importedPosts.length === 0}
                style={{
                  padding: '8px 16px',
                  backgroundColor: importedPosts.length === 0 ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: importedPosts.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Import Selected
              </button>
            </div>

            <div style={{ display: 'grid', gap: '10px', maxHeight: '400px', overflow: 'auto' }}>
              {availablePosts.map(post => (
                <div key={post.id} style={{
                  border: importedPosts.find(p => p.id === post.id) ? '2px solid #1da1f2' : '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '12px',
                  backgroundColor: importedPosts.find(p => p.id === post.id) ? '#f0f8ff' : '#fff',
                  cursor: 'pointer'
                }} onClick={() => togglePostImport(post)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
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
                    <div style={{
                      padding: '4px 8px',
                      backgroundColor: importedPosts.find(p => p.id === post.id) ? '#28a745' : '#6c757d',
                      color: 'white',
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}>
                      {importedPosts.find(p => p.id === post.id) ? '✓ Selected' : 'Select'}
                    </div>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                    {post.text.length > 150 ? `${post.text.substring(0, 150)}...` : post.text}
                  </p>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {post.extracted.keywords.length > 0 && (
                      <span>🏷️ {post.extracted.keywords.join(', ')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CryptoGenerator;
