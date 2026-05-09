import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import { X, Check } from 'lucide-react';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '500px', height: '500px', 
        position: 'relative', background: '#000', borderRadius: '16px', overflow: 'hidden'
      }}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteInternal}
          onZoomChange={onZoomChange}
        />
      </div>
      
      <div style={{
        marginTop: '20px', width: '100%', maxWidth: '500px',
        display: 'flex', gap: '15px', alignItems: 'center'
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'white', fontSize: '0.8rem' }}>Zoom</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <button 
          onClick={onCancel}
          style={{ 
            background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', 
            padding: '12px 20px', borderRadius: '10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
          }}
        >
          <X size={18} /> Cancel
        </button>
        <button 
          onClick={handleDone}
          style={{ 
            background: '#2563eb', color: 'white', border: 'none', 
            padding: '12px 25px', borderRadius: '10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
          }}
        >
          <Check size={18} /> Apply Crop
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
