import React from "react";
import { motion } from "framer-motion";
import { HeroSection } from "../components/homePageComponent/HeroSection";
import { CategoryGrid } from "../components/homePageComponent/CategoryGrid";
import { ValueProposition } from "../components/homePageComponent/ValueProposition";
import { HeroSectionTwo } from "../components/homePageComponent/HeroSectionTwo";
interface HomePageProps {
  onRequestRoute: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onRequestRoute }) => {
  return (
    // Reduced mobile spacing from space-y-12 to space-y-4
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-4 md:space-y-24 pb-20"
    >
      {/* <HeroSection /> */}
      <HeroSectionTwo />
      <CategoryGrid onRequestRoute={onRequestRoute} />
      <ValueProposition />
    </motion.div>
  );
};
