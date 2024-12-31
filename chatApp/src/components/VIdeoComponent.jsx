import React, { useState, useRef } from 'react';
const VideoComponent = () => {
  const [isPlaying, setIsPlaying] = useState(false); // State to track if the video is playing
  const videoRef = useRef(null); // Reference to the video element

  // Function to handle the click and toggle play/pause
  const handleClick = () => {
    if (isPlaying) {
      videoRef.current.pause(); // Pause the video if it is currently playing
    } else {
      videoRef.current.play(); // Play the video if it is paused
    }
    setIsPlaying(!isPlaying); // Toggle the play/pause state
  };

  return (
    <div>
      <video
        ref={videoRef}
        width="100%" // Adjust the width as needed // Display a poster image while the video is not playing
        onClick={handleClick} // Click handler to toggle play/pause
        style={{ cursor: 'pointer' }} // Make the video area appear clickable
      >
        <source src="https://res.cloudinary.com/dritmjkxl/video/upload/v1735657604/eldenRingCinematics_-_Made_with_Clipchamp_1_lrqidl.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div>
        <p>{isPlaying ? 'Click to Pause' : 'Click to Play'}</p>
      </div>
    </div>
  );
};

export default VideoComponent;
