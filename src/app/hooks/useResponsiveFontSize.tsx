import { useEffect, useState } from "react";

export const useResponsiveFontSize = (min = 10, max = 12) => {
  const [fontSize, setFontSize] = useState(10);

  useEffect(() => {

    const handleResize = () => {
      const width = window.innerWidth;
      const size = Math.max(min, Math.min(max, width / 100));

      setFontSize(size);
    };

    handleResize(); // initial
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, [min, max]);

  return fontSize;
};
