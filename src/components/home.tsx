import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeatureGrid from "@/components/home/FeatureGrid";
import CallToAction from "@/components/home/CallToAction";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection
          onPrimaryClick={() => navigate("/register")}
          onSecondaryClick={() => navigate("/about")}
        />
        <FeatureGrid />
        <div className="container mx-auto px-4 py-12">
          <CallToAction
            onPrimaryClick={() => navigate("/register")}
            onSecondaryClick={() => navigate("/dashboard")}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
