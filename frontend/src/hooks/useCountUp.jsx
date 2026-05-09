import { useState, useEffect, useRef } from 'react';

export function useCountUp(end, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const startTime = performance.now();
    const startValue = 0;
    const endValue = typeof end === 'string' ? parseFloat(end.replace(/,/g, '')) : end;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOut;
      
      setCount(current);
      
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };

    ref.current = requestAnimationFrame(animate);

    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [end, duration]);

  return typeof end === 'string' && end.includes('%') 
    ? `${count.toFixed(1)}%`
    : typeof end === 'string' && end.includes('/')
    ? `${count.toFixed(1)}/5`
    : Math.round(count).toLocaleString();
}

export default useCountUp;