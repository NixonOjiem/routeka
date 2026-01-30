import React from "react";
import {
  Briefcase,
  GraduationCap,
  Home,
  ArrowRight,
  Calendar,
} from "lucide-react";

interface CategoryGridProps {
  onRequestRoute: () => void;
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
    <div className="flex flex-col gap-1 md:gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:gap-8 relative z-10 max-w-360 mx-auto w-full px-2 md:px-0 mt-4 md:mt-0">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className={`
            group relative bg-white/95 md:bg-white rounded-2xl lg:rounded-[2.5rem] 
            shadow-xl lg:shadow-xl shadow-stone-300/40 lg:shadow-stone-200/50 
            hover:shadow-2xl hover:shadow-brand/20 
            transition-all duration-300 transform lg:hover:-translate-y-2 border border-brand 
            flex flex-col
            p-5 lg:p-12 backdrop-blur-sm
            justify-between
            gap-1 lg:gap-6
          `}
        >
          <div className="w-full">
            <div className="flex flex-row lg:flex-col items-center lg:justify-center mb-1 lg:mb-0">
              <div
                className={`
                shrink-0 w-10 h-10 lg:w-16 lg:h-16 bg-stone-50 text-stone-600 rounded-lg lg:rounded-2xl
                flex items-center justify-center 
                mr-3 lg:mr-0 lg:mb-6 
                group-hover:bg-brand group-hover:text-white transition-colors duration-300 shadow-inner
              `}
              >
                <cat.icon
                  className={`w-5 h-5 lg:w-8 lg:h-8 transition-transform duration-300 ${cat.iconAnim}`}
                />
              </div>

              <h3 className="font-display font-bold text-lg lg:text-2xl text-stone-800 group-hover:text-brand transition-colors">
                {cat.title}
              </h3>
            </div>

            <p
              className={`
              text-lg lg:text-base text-stone-700 leading-none tracking-normal lg:tracking-tight lg:leading-relaxed 
              font-futura lg:font-dm-serif font-normal mb-2 lg:mb-8 text-left lg:text-center
              ${cat.id === "neighborhood" ? "lg:font-light" : "lg:font-normal"}
            `}
            >
              {cat.desc}
            </p>
          </div>

          <button
            onClick={onRequestRoute}
            className="
              w-full lg:w-auto
              lg:mt-auto
              px-3 py-3 lg:px-6 lg:py-3 
              bg-stone-100 text-stone-600 
              text-[10px] lg:text-sm font-bold uppercase tracking-wider
              rounded-lg lg:rounded-xl
              group-hover:bg-brand group-hover:text-white group-hover:shadow-lg
              hover:bg-brand-dark
              active:scale-95 active:bg-brand-dark active:text-white
              transition-all duration-300 ease-out
              flex items-center justify-center gap-2
              shrink-0
            "
          >
            <span className="lg:hidden whitespace-nowrap">
              Request/View Route
            </span>
            <span className="hidden lg:inline">Request/View Route</span>
            <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ))}
    </div>
  );
};
