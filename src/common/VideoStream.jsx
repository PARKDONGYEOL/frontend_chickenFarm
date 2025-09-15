import React from 'react'

const VideoStream = () => {
  return (
    <div>
      VideoStream
      <img 
        src="http://192.168.30.71:5000/video_feed" 
        alt="Live stream"
        width={640}
        height={480}
      />
    </div>
    
  )
}

export default VideoStream