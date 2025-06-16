import { useRef, useState, useEffect, useCallback } from 'react';
import styles from './IntroVideo.module.css';

const IntroVideo = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); 
  const [showOverlay, setShowOverlay] = useState(true); 


  const videoSource = '/videos/zeelevate-intro.mp4';
  // const videoPoster = '/images/zeelevate-video-thumbnail.jpg'; 

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true; 
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsMuted(true);
          setShowOverlay(false); 
        })
        .catch(error => {
         
          console.warn("Autoplay was prevented:", error);
          setIsPlaying(false);
          setIsMuted(true); 
          setShowOverlay(true); 
        });
    }
  }, []); 

 
  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowOverlay(true);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        setShowOverlay(false); 
      }
    }
  }, [isPlaying]);


  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }, []);


  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    setShowOverlay(true); 
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
    setShowOverlay(true);
  }, []);

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
    setShowOverlay(false);
  }, []);


  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        className={styles.introVideoPlayer}
        controls={false}
        preload="metadata" 
        // poster={videoPoster}
        disablePictureInPicture 
  
        onEnded={handleVideoEnded}
        onPause={handleVideoPause}
        onPlay={handleVideoPlay}
      >
        <source src={videoSource} type="video/mp4" />
       
        Your browser does not support the video tag. Please update your browser to view this content.
      </video>

   
      {showOverlay && ( 
        <div className={styles.videoOverlay} onClick={handlePlayPause}>
          <button className={styles.playPauseButton} aria-label={isPlaying ? "Pause video" : "Play video"}>
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z"/>
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Mute/Unmute Control (always visible for user control) */}
      <button className={styles.muteToggleButton} onClick={handleMuteToggle} aria-label={isMuted ? "Unmute video" : "Mute video"}>
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.818.324L4.381 10.H3a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1.381L6.182 3.676a.5.5 0 0 1 .535-.126zM10.748 6.642a.5.5 0 0 0-.647-.077 4.996 4.996 0 0 0-1.745 2.183.5.5 0 0 0 .811.534 3.997 3.997 0 0 1 1.498-1.889.5.5 0 0 0 .083-.751zm3.636-2.006a.5.5 0 0 0-.75-.015 8.007 8.007 0 0 0-2.313 4.673c-.012.18.15.341.332.341a.5.5 0 0 0 .3-.117 7.002 7.002 0 0 1 2.113-4.148.5.5 0 0 0 .318-.046zm.937-2.781a.5.5 0 0 0-.916.135 10.979 10.979 0 0 0-2.822 6.7.5.5 0 0 0 .538.514.5.5 0 0 0 .373-.207 9.976 9.976 0 0 1 2.585-6.143.5.5 0 0 0 .242-.999z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.536 14.01c.812-.52 1.488-1.283 1.956-2.2H14l.012.002h.001l.006.002a.862.862 0 0 0 .15.048.862.862 0 0 0 .044.015.862.862 0 0 0 .046.01.862.862 0 0 0 .034.004.862.862 0 0 0 .007.001.862.862 0 0 0 .007.002h.001a.862.862 0 0 0 .002.001.862.862 0 0 0 .003.001H15v-.004a.862.862 0 0 0 .007-.002h.001a.862.862 0 0 0 .007-.002.862.862 0 0 0 .034-.004.862.862 0 0 0 .046-.01.862.862 0 0 0 .044-.015.862.862 0 0 0 .15-.048l.006-.002h.001L16 11.8H9.364l2.172 2.172z"/>
            <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.818.324L4.381 10.H3a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1.381L6.182 3.676a.5.5 0 0 1 .535-.126z"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default IntroVideo;