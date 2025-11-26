import React, { useEffect, useRef } from 'react';
import { useClinic } from '../context/ClinicContext';

export const AudioAlert: React.FC = () => {
  const { isEmergencyRinging } = useClinic();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isEmergencyRinging) {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play blocked by browser interaction policy", e));
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [isEmergencyRinging]);

  return (
    <audio 
        ref={audioRef} 
        src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" 
        loop 
        style={{ display: 'none' }} 
    />
  );
};