import  { useRef, useState, useEffect, useCallback } from 'react';
import styles from './IntroVideo.module.css';

const IntroVideo = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);

  const videoSource = '/videos/zeelevate-intro.mp4';
  const videoPoster = '/images/zeelevate-video-thumbnail.jpg';

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
        poster={videoPoster}
        disablePictureInPicture
        onEnded={handleVideoEnded}
        onPause={handleVideoPause}
        onPlay={handleVideoPlay}
      >
        <source src={videoSource} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {showOverlay && (
        <div className={styles.videoOverlay} onClick={handlePlayPause}>
          <button className={styles.playPauseButton} aria-label={isPlaying ? "Pause video" : "Play video"}>
            {isPlaying ? (
              // Pause Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
              </svg>
            ) : (
              // Play Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" />
              </svg>
            )}
          </button>
        </div>
      )}

      <button className={styles.muteToggleButton} onClick={handleMuteToggle} aria-label={isMuted ? "Unmute video" : "Mute video"}>
        {isMuted ? (
          // Mute Icon
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.717 3.55A.5.5 0 0 1 10 4v8a.5.5 0 0 1-.818.324L6.825 10H5.5a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h1.325l2.357-2.324a.5.5 0 0 1 .535-.126z"/>
          </svg>
        ) : (
          // Unmute Icon
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.536 14.01a.5.5 0 0 1-.707-.708A6.995 6.995 0 0 0 13 8a6.995 6.995 0 0 0-2.17-5.302.5.5 0 1 1 .707-.707A7.995 7.995 0 0 1 14 8a7.995 7.995 0 0 1-2.464 6.01z"/>
            <path d="M12.07 11.536a.5.5 0 0 1-.707-.707 3.992 3.992 0 0 0 0-5.657.5.5 0 1 1 .707-.707 4.992 4.992 0 0 1 0 7.071z"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.818.39L5.825 10H4.5A.5.5 0 0 1 4 9.5v-3a.5.5 0 0 1 .5-.5h1.325l1.857-1.89A.5.5 0 0 1 8 4z"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default IntroVideo;
