import { useState, useEffect } from 'react';

// Reference: https://medium.com/@josephat94/building-a-simple-react-hook-to-detect-screen-size-404a867fa2d2

// Hook to detect screen size
const ScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return screenSize;
};

export default ScreenSize;