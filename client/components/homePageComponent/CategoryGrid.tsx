import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  Home,
  ArrowRight,
  Calendar,
} from "lucide-react";

interface CategoryGridProps {
  onRequestRoute: (id: string) => void;
}

export const CategoryGrid = ({ onRequestRoute }: CategoryGridProps) => {
  const categories = [
    {
      id: "neighborhood",
      title: "Neighborhood",
      icon: Home,
      desc: "Join your neighbors in sharing rideshare fares to foster a stronger community and maximize your savings.",
      iconAnim: "group-hover:scale-110",
    },
    {
      id: "corporate",
      title: "Corporate",
      icon: Briefcase,
      desc: "Streamline your commute by sharing rideshare expenses with colleagues for an affordable, efficient journey.",
      iconAnim: "group-hover:rotate-6",
    },
    {
      id: "events",
      title: "Events",
      icon: Calendar,
      desc: "Coordinate rides to concerts, games, or conferences. Arrive together and split the cost of event-day travel.",
      iconAnim: "group-hover:scale-110",
    },
    {
      id: "university",
      title: "University",
      icon: GraduationCap,
      desc: "Ditch the crowded bus! Score safe, affordable rides with fellow students on campus.",
      iconAnim: "group-hover:-rotate-6",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 w-full" id="ride-form">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group bg-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:border-brand/20 transition-all duration-300 flex flex-col h-full"
          >
            <div className="flex items-center gap-4 mb-4 md:flex-col md:items-start">
              <div className="p-3 rounded-2xl bg-stone-50 text-stone-600 group-hover:bg-brand group-hover:text-white transition-colors">
                <cat.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-stone-800">{cat.title}</h3>
            </div>

            <p className="text-stone-600 text-sm md:text-base leading-relaxed mb-6 grow">
              {cat.desc}
            </p>

            <button
              onClick={() => onRequestRoute(cat.id)}
              className="w-full py-3 bg-stone-50 text-stone-700 font-bold rounded-xl group-hover:bg-brand group-hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Request Route <ArrowRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
