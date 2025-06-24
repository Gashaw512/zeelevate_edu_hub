import { useEffect, useRef } from 'react';

const useClickOutside = (callback, active = true) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [callback, active]);

  return ref;
};

export default useClickOutside;
