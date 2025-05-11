import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTopOnProduct({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/product/")) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return <>{children}</>;
}
