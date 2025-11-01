import React from 'react';
import { FaWhatsapp, FaEnvelope, FaShare } from 'react-icons/fa';

const ShareModal = ({ isOpen, onClose, productUrl, productTitle, productImage }) => {
  if (!isOpen) return null;

  const shareText = `Check out this amazing product: ${productTitle}`;
  const fullUrl = productUrl || window.location.href;

  // Use native Web Share API if available (especially on mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productTitle || 'Check out this product!',
          text: shareText,
          url: fullUrl,
        });
        onClose();
      } catch (err) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  };

  const handleShare = (platform) => {
    let shareUrl = '';
    const encodedUrl = encodeURIComponent(fullUrl);
    const encodedText = encodeURIComponent(shareText);

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Check out this product!')}&body=${encodedText}%20${encodedUrl}`;
        break;
      default:
        return;
    }

    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400,menubar=no,toolbar=no,resizable=yes,scrollbars=yes');
    }
    
    onClose();
  };

  const shareOptions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      textColor: 'text-white'
    },
    {
      id: 'email',
      name: 'Email',
      icon: FaEnvelope,
      color: 'bg-gray-600',
      hoverColor: 'hover:bg-gray-700',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-lg w-full max-w-md mx-2 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Share Product</h2>
        </div>

        {/* Native Share Button (if available - for mobile) */}
        {navigator.share && (
          <div className="mb-6">
            <button
              onClick={handleNativeShare}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center justify-center gap-2 font-medium mb-2"
            >
              <FaShare />
              Share Using Device Options
            </button>
            <p className="text-xs text-gray-500 text-center">Or choose a platform below</p>
          </div>
        )}

        {/* Share Options */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleShare(option.id)}
                className={`${option.color} ${option.hoverColor} ${option.textColor} p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-md`}
              >
                <Icon className="text-2xl" />
                <span className="text-sm font-medium">{option.name}</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

