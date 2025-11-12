import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div>
      <nav style={{ 
        padding: '15px', 
        backgroundColor: '#1da1f2', 
        marginBottom: '20px' 
      }}>
        <ul style={{ 
          listStyle: 'none', 
          display: 'flex', 
          gap: '20px', 
          margin: 0, 
          padding: 0 
        }}>
          <li>
            <Link 
              to="/" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                padding: '8px 16px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
            >
              🚀 Alpha Generator
            </Link>
          </li>
          <li>
            <Link 
              to="/users" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                padding: '8px 16px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
            >
              Manage Users
            </Link>
          </li>
          <li>
            <Link 
              to="/fetch-posts" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                padding: '8px 16px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
            >
              Fetch Posts
            </Link>
          </li>
          <li>
            <Link 
              to="/post-selector" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                padding: '8px 16px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
            >
              Post Selector
            </Link>
          </li>
          <li>
            <Link 
              to="/scheduled-posts" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                padding: '8px 16px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
            >
              Scheduled Posts
            </Link>
          </li>
          <li>
            <Link 
              to="/review" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                padding: '8px 16px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
            >
              Review Content
            </Link>
          </li>
          <li>
            <Link 
              to="/settings" 
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                padding: '8px 16px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
            >
              Settings
            </Link>
          </li>
        </ul>
      </nav>
      <Outlet />
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
