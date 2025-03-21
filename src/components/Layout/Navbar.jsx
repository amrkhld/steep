import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import logoAlter from '../../assets/logo.png';
import ProfileImage from './ProfileImage';

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('returnPath');
      navigate('/login');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav className="navbar-animate">
      {user && (
        <div className="navbar-content">
          <div className="navbar-logo">
            <img
              src={logoAlter}
              alt="Logo"
            />
          </div>
          <div className="navbar-user">
            <ProfileImage user={user} />
            <span className="navbar-email">{user.email}</span>
          </div>
          <div className="navbar-actions">
            <button 
              onClick={handleSignOut} 
              className="sign-out-btn"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;