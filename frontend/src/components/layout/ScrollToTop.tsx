import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant", // Using instant ensures the page is scrolled up before it mounts/renders visually
    });
  }, [pathname]);

  return null;
};
