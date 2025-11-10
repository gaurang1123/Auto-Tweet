import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function MainPage() {
  const [niche, setNiche] = useState('crypto');
  const [subCategory, setSubCategory] = useState('news');
  const [userInfo, setUserInfo] = useState('');
  const [generatedTweet, setGeneratedTweet] = useState('');

  const handleGenerateTweet = () => {
    axios.post(`${API_URL}/tweet`, { niche, subCategory, userInfo })
      .then(response => {
        setGeneratedTweet(response.data.tweet);
      })
      .catch(error => {
        console.error('Error generating tweet:', error);
        alert('Error generating tweet.');
      });
  };

  const handlePostTweet = () => {
    axios.post(`${API_URL}/post-tweet`, { tweet: generatedTweet })
      .then(response => {
        alert('Tweet posted successfully!');
      })
      .catch(error => {
        console.error('Error posting tweet:', error);
        alert('Error posting tweet.');
      });
  };

  return (
    <div>
      <h1>Generate a Tweet</h1>
      <div>
        <label>Niche:</label>
        <select value={niche} onChange={(e) => setNiche(e.target.value)}>
          <option value="crypto">Crypto</option>
        </select>
      </div>
      <div>
        <label>Sub-category:</label>
        <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
          <option value="news">News</option>
          <option value="airdrops">Airdrops</option>
          <option value="upcomings">Upcomings</option>
        </select>
      </div>
      <div>
        <label>Additional Info:</label>
        <textarea value={userInfo} onChange={(e) => setUserInfo(e.target.value)} />
      </div>
      <button onClick={handleGenerateTweet}>Generate Tweet</button>

      {generatedTweet && (
        <div>
          <h2>Generated Tweet</h2>
          <p>{generatedTweet}</p>
          <button onClick={handlePostTweet}>Post Tweet</button>
        </div>
      )}
    </div>
  );
}

export default MainPage;
