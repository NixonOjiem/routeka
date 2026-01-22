
import React, { useState, useRef } from 'react';
import { ViewState, NotificationType } from './types';
import { Header } from './components/Header';
import { RequestRouteForm } from './components/RequestRouteForm';
import { storageService } from './services/storage';
import { Car, Briefcase, GraduationCap, Home, CheckCircle2, ArrowRight, AlertCircle, Sparkles, TrendingUp, Loader2, Mail, Calendar } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [notification, setNotification] = useState<{type: NotificationType, message: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Interactive Lens State
  const lensRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringLens, setIsHoveringLens] = useState(false);

  const handleRouteRequestSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Process data and dispatch simulated email via storage service
      await storageService.saveRouteRequest(data);
      
      showNotification('success', `Request sent! team@routeka.com has been notified of your route.`);
      setView('home');
    } catch (error) {
      showNotification('error', 'There was an issue sending your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Lens Proximity Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!lensRef.current) return;
    const rect = lensRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const categories = [
    {
      id: 'neighborhood',
      title: 'Neighborhood',
      icon: Home,
      desc: "Join your neighbors in sharing rideshare fares to foster a stronger community and maximize your savings.",
      iconAnim: "group-hover:scale-110"
    },
    {
      id: 'corporate',
      title: 'Corporate',
      icon: Briefcase,
      desc: "Streamline your commute by sharing rideshare expenses with colleagues for an affordable, efficient journey.",
      iconAnim: "group-hover:rotate-6"
    },
    {
      id: 'events',
      title: 'Events',
      icon: Calendar,
      desc: "Coordinate rides to concerts, games, or conferences. Arrive together and split the cost of event-day travel.",
      iconAnim: "group-hover:scale-110"
    },
    {
      id: 'university',
      title: 'University',
      icon: GraduationCap,
      desc: "Ditch the crowded bus! Score safe, affordable rides with fellow students on campus.",
      iconAnim: "group-hover:-rotate-6"
    }
  ];

  const renderContent = () => {
    switch (view) {
      case 'request':
        return (
          <div className="py-10 relative">
            {isSubmitting && (
              <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-stone-100 flex flex-col items-center text-center gap-6 animate-fade-in-up max-w-sm w-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full animate-pulse"></div>
                    <div className="relative bg-brand text-white p-4 rounded-2xl">
                      <Mail className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-bold text-stone-900">Dispatching Request</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      Sending your commute details to <span className="font-semibold text-brand">team@routeka.com</span> for community matching...
                    </p>
                  </div>
                  <Loader2 className="w-6 h-6 text-brand animate-spin" />
                </div>
              </div>
            )}
            <RequestRouteForm 
              onSubmit={handleRouteRequestSubmit} 
              onCancel={() => setView('home')} 
            />
          </div>
        );
      case 'home':
      default:
        return (
          <div className="space-y-12 md:space-y-24">
            <div className="space-y-6 md:space-y-12 pt-2 md:pt-10 pb-4 md:pb-8 relative overflow-visible animate-fade-in-up flex flex-col justify-start md:justify-center min-h-[calc(100dvh-80px)] md:min-h-0">
              <div className="absolute top-10 left-10 md:left-1/4 w-48 h-48 md:w-72 md:h-72 bg-brand-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
              <div className="absolute top-20 right-10 md:right-1/4 w-48 h-48 md:w-72 md:h-72 bg-cyan-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 md:left-1/3 w-48 h-48 md:w-72 md:h-72 bg-blue-100/60 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
              
              <div className="relative z-10 text-center mb-2 md:mb-16 px-2">
                <h1 className="text-3xl md:text-5xl font-display font-medium text-brand tracking-tight leading-tight mb-2 md:mb-4 drop-shadow-sm">
                  The Affordable Express <br/>
                  <span className="italic text-brand-dark relative">
                    Commute is Here!
                    <svg className="absolute w-full h-1.5 md:h-3 -bottom-1 left-0 text-brand-dark/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                      <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                    </svg>
                  </span>
                </h1>
                
                <p className="text-[3.2vw] sm:text-[2.8vw] md:text-2xl text-stone-700 mx-auto font-bold leading-tight font-dm-serif mb-6 md:mb-16 tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis">
                  Regular Commute. Shared Cost. Big Savings (up to 60%)
                </p>

                <p className="text-xl md:text-3xl text-stone-950 max-w-4xl mx-auto font-normal leading-[1.14] mt-6 md:mt-12 font-futura block">
                  Reduce commuting costs by sharing rideshare fares with your professional and local networks. Our service integrates you into a community of commuters to provide an affordable express experience, ensuring you save both time and capital on every journey.
                </p>
                
                <p className="text-sm md:text-xl mt-2 md:mt-4 font-medium text-brand-dark tracking-wide animate-pulse font-sans px-4">
                  WE ARE LAUNCHING SOON!
                </p>
              </div>

              <div className="flex flex-col gap-1 md:gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:gap-8 relative z-10 max-w-[90rem] mx-auto w-full px-2 md:px-0 mt-4 md:mt-0">
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
                        <div className={`
                          shrink-0 w-10 h-10 lg:w-16 lg:h-16 bg-stone-50 text-stone-600 rounded-lg lg:rounded-2xl
                          flex items-center justify-center 
                          mr-3 lg:mr-0 lg:mb-6 
                          group-hover:bg-brand group-hover:text-white transition-colors duration-300 shadow-inner
                        `}>
                          <cat.icon className={`w-5 h-5 lg:w-8 lg:h-8 transition-transform duration-300 ${cat.iconAnim}`} />
                        </div>
                        
                        <h3 className="font-display font-bold text-lg lg:text-2xl text-stone-800 group-hover:text-brand transition-colors">
                          {cat.title}
                        </h3>
                      </div>
                      
                      <p className={`
                        text-lg lg:text-base text-stone-700 leading-none tracking-normal lg:tracking-tight lg:leading-relaxed 
                        font-futura lg:font-dm-serif font-normal mb-2 lg:mb-8 text-left lg:text-center
                        ${cat.id === 'neighborhood' ? 'lg:font-light' : 'lg:font-normal'}
                      `}>
                        {cat.desc}
                      </p>
                    </div>

                    <button 
                      onClick={() => {
                        setView('request');
                      }}
                      className="
                        w-full lg:w-auto
                        lg:mt-auto
                        px-3 py-3 lg:px-6 lg:py-3 
                        bg-stone-100 text-stone-600 
                        text-[10px] lg:text-sm font-bold uppercase tracking-wider
                        rounded-lg lg:rounded-xl
                        group-hover:bg-brand group-hover:text-white group-hover:shadow-lg
                        hover:bg-stone-200
                        active:scale-95 active:bg-brand-dark active:text-white
                        transition-all duration-300 ease-out
                        flex items-center justify-center gap-2
                        shrink-0
                      "
                    >
                      <span className="lg:hidden whitespace-nowrap">Request/View Route</span>
                      <span className="hidden lg:inline">Request/View Route</span>
                      <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Proposition Section - Magnifying Glass Effect */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 relative pb-12 md:pb-24 overflow-hidden md:overflow-visible">
              <h2 className="text-3xl md:text-5xl font-display font-medium text-center text-stone-900 mb-12 animate-fade-in-up">
                Why is Route KA here?
              </h2>
              
              {/* Magnifying Glass Lens Container */}
              <div 
                ref={lensRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHoveringLens(true)}
                onMouseLeave={() => setIsHoveringLens(false)}
                className="group/lens relative rounded-3xl lg:rounded-[3rem] overflow-hidden bg-white/40 lg:bg-white/20 backdrop-blur-lg lg:backdrop-blur-2xl border border-white/60 shadow-xl lg:shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 md:p-10 lg:p-16 lg:animate-breathe transform-gpu cursor-none"
              >
                
                {/* Animated Shimmer Overlay */}
                <div className="absolute inset-0 pointer-events-none z-0">
                  <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
                
                {/* Custom Interactive Magnifier Lens */}
                <div 
                  className={`
                    fixed pointer-events-none z-[60] w-32 h-32 md:w-64 md:h-64 rounded-full 
                    border-[3px] md:border-[6px] border-white/80 shadow-[0_0_50px_rgba(255,255,255,0.4),inset_0_0_20px_rgba(0,0,0,0.1)]
                    backdrop-blur-[1px] backdrop-saturate-[1.8] backdrop-contrast-[1.1]
                    transition-opacity duration-300 ease-out
                    flex items-center justify-center
                    ${isHoveringLens ? 'opacity-100' : 'opacity-0'}
                  `}
                  style={{
                    left: `${mousePos.x}px`,
                    top: `${mousePos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 70%)',
                  }}
                >
                  <div className="w-full h-full rounded-full border border-stone-900/10 opacity-20"></div>
                </div>

                <div className="absolute inset-0 bg-white/5 pointer-events-none z-0 mix-blend-overlay"></div>

                <div className="relative z-10 grid md:grid-cols-3 gap-10 md:gap-12">
                   {/* The Problem */}
                   <div className="text-center group flex flex-col items-center transition-all duration-500 hover:scale-110 hover:z-20">
                      <div className="w-20 h-20 lg:w-16 lg:h-16 rounded-full bg-rose-100/80 text-rose-600 mb-6 shadow-sm flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                        <AlertCircle className="w-10 h-10 lg:w-8 lg:h-8" />
                      </div>
                      <h3 className="text-3xl lg:text-2xl font-display lg:font-cormorant font-bold text-stone-950 mb-4 drop-shadow-sm group-hover:text-rose-700 transition-colors">The Problem</h3>
                      <p className="text-stone-800 font-futura lg:font-eb-garamond font-normal text-xl md:text-2xl lg:text-xl leading-relaxed drop-shadow-sm">
                        Expedited travel shouldn't bankrupt you. Solo express options impose a crushing financial burden on daily commuters who just want to get there on time.
                      </p>
                   </div>

                   {/* The Solution */}
                   <div className="text-center group flex flex-col items-center transition-all duration-500 hover:scale-110 hover:z-20">
                      <div className="w-20 h-20 lg:w-16 lg:h-16 rounded-full bg-brand-100/80 text-brand mb-6 shadow-sm flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all duration-300">
                        <Sparkles className="w-10 h-10 lg:w-8 lg:h-8" />
                      </div>
                      <h3 className="text-3xl lg:text-2xl font-display lg:font-cormorant font-bold text-stone-950 mb-4 drop-shadow-sm group-hover:text-brand-dark transition-colors">The Solution</h3>
                      <p className="text-stone-800 font-futura lg:font-eb-garamond font-normal text-xl md:text-2xl lg:text-xl leading-relaxed drop-shadow-sm">
                        We unlock the express lane for everyone by connecting you with colleagues and neighbors. Share the cost, split the ride, and enjoy a premium commute.
                      </p>
                   </div>

                   {/* Why Choose Us */}
                   <div className="text-center group flex flex-col items-center transition-all duration-500 hover:scale-110 hover:z-20">
                      <div className="w-20 h-20 lg:w-16 lg:h-16 rounded-full bg-emerald-100/80 text-emerald-600 mb-6 shadow-sm flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        <TrendingUp className="w-10 h-10 lg:w-8 lg:h-8" />
                      </div>
                      <h3 className="text-3xl lg:text-2xl font-display lg:font-cormorant font-bold text-stone-900 mb-4 drop-shadow-sm group-hover:text-emerald-700 transition-colors">Why Choose Us</h3>
                      <p className="text-stone-800 font-futura lg:font-eb-garamond font-normal text-xl md:text-2xl lg:text-xl leading-relaxed drop-shadow-sm">
                        We help slash your rideshare costs by up to 60% (or more!!), thereby helping you considerably save both time and money. Stop overpaying today.
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-100 selection:text-brand-dark">
      <Header onViewChange={setView} currentView={view} />
      
      <main className="flex-grow container mx-auto px-4 md:px-6 py-6 max-w-7xl">
        {notification && (
          <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-right z-50 ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}
        
        {renderContent()}
      </main>

      <footer className="bg-white/80 backdrop-blur border-t border-stone-200 py-8 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
             <Car className="w-5 h-5" />
             <span className="font-display font-bold text-lg">Route KA</span>
          </div>
          <p className="text-stone-400 text-sm">© {new Date().getFullYear()} Route KA. Strengthening communities, one ride at a time.</p>
        </div>
      </footer>
    </div>
  );
}
