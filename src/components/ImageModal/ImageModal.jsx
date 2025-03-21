import React from 'react';

const ImageModal = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content">
        <img src={imageUrl} alt="Zoomed question" className="zoomed-image" />
        <button className="modal-close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default ImageModal;
