import React from "react";
import { HeroSection } from "../components/homePageComponent/HeroSection";
import { CategoryGrid } from "../components/homePageComponent/CategoryGrid";
import { ValueProposition } from "../components/homePageComponent/ValueProposition";

interface HomePageProps {
  onRequestRoute: (categoryId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onRequestRoute }) => {
  return (
    <div className="space-y-12 md:space-y-24">
      <HeroSection />
      <CategoryGrid onRequestRoute={onRequestRoute} />
      <ValueProposition />
    </div>
  );
};
