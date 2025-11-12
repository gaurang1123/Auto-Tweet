import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import CryptoGenerator from './CryptoGenerator';
import UserManager from './UserManager';
import FetchPosts from './FetchPosts';
import PostSelector from './PostSelector';
import ScheduledPosts from './ScheduledPosts';
import ContentReview from './ContentReview';
import SettingsPage from './SettingsPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<CryptoGenerator />} />
          <Route path="users" element={<UserManager />} />
          <Route path="fetch-posts" element={<FetchPosts />} />
          <Route path="post-selector" element={<PostSelector />} />
          <Route path="scheduled-posts" element={<ScheduledPosts />} />
          <Route path="review" element={<ContentReview />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
