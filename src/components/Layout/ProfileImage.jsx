import React, { useState, useEffect } from 'react';

function ProfileImage({ user }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const defaultAvatar = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#94A3B8"/>
    </svg>
  `)}`;

  useEffect(() => {
    if (!user) {
      setImageUrl(defaultAvatar);
      setIsLoading(false);
      return;
    }

    // Get the highest quality image by modifying the URL
    const photoURL = user.photoURL?.replace('s96-c', 's400-c') || null;

    if (!photoURL) {
      setImageUrl(defaultAvatar);
      setIsLoading(false);
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      setImageUrl(photoURL);
      setIsLoading(false);
    };

    img.onerror = () => {
      // If high quality image fails, try original URL
      if (photoURL !== user.photoURL && user.photoURL) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setImageUrl(user.photoURL);
          setIsLoading(false);
        };
        fallbackImg.onerror = () => {
          setImageUrl(defaultAvatar);
          setIsLoading(false);
        };
        fallbackImg.src = user.photoURL;
      } else {
        setImageUrl(defaultAvatar);
        setIsLoading(false);
      }
    };

    img.src = photoURL;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [user]);

  return (
    <div style={{ position: 'relative', width: '32px', height: '32px' }}>
      <img
        src={imageUrl || defaultAvatar}
        alt={user?.displayName || 'Profile'}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          objectFit: 'cover',
          backgroundColor: '#E2E8F0',
          border: '2px solid #e2e8f0',
          flexShrink: 0,
          opacity: isLoading ? 0.6 : 1,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid #E2E8F0',
              borderTopColor: '#94A3B8',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ProfileImage;
