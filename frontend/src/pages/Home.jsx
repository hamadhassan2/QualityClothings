import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
// import NewsletterBox from "../components/NewsletterBox";

// Import a more beautiful loader from react-loader-spinner
import { MutatingDots } from "react-loader-spinner";

const Home = () => {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Scroll to the top when the component mounts
    window.scrollTo(0, 0);
    // Remove the loading indicator after 3 seconds
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {showAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <MutatingDots
            height="120"
            width="120"
            color="#32cd32"
            secondaryColor="#2ecc71"
            radius="12.5"
            ariaLabel="mutating-dots-loading"
            visible={true}
          />
        </div>
      )}
      <Hero />
      <LatestCollection />
      <BestSeller />
      <OurPolicy />
      {/* <NewsletterBox /> */}
    </div>
  );
};

export default Home;
