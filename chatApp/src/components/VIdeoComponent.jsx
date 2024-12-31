import React, { useEffect, useRef } from 'react';

const VideoComponent = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Try to play the video programmatically
      video.play().catch((err) => {
        // Handle errors if autoplay with sound is blocked
        console.error("Autoplay failed:", err);
      });
    }
  }, []);

  return (
    <div className="app-wrapper">
      {/* Video Background */}
      <video ref={videoRef} loop className="cloudinary-vid">
        <source src="https://res.cloudinary.com/dritmjkxl/video/upload/v1735657604/eldenRingCinematics_-_Made_with_Clipchamp_1_lrqidl.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoComponent;
