import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Add CSS for blob animation
const blobAnimation = `
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`;

const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log('🏠 HomePage - Komponent załadowany');
    console.log('👤 User:', user);
    setIsVisible(true);
  }, [user]);

  const handleStartDrawing = () => {
    // Przewijanie do góry strony
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Nawigacja do generatora po krótkim opóźnieniu
    setTimeout(() => {
      navigate('/generator');
    }, 800);
  };

    // Animacja machającej ręki
  const WaveHand = () => (
    <motion.div
      className="inline-block text-12xl sm:text-13xl md:text-14xl lg:text-15xl mr-4 sm:mr-6 md:mr-8 text-yellow-400"
      animate={{
        rotate: [0, 30, -25, 30, 0],
        y: [0, -12, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 0.3,
        ease: "easeInOut"
      }}
    >
      ✋
    </motion.div>
  );

  return (
    <>
      <style>{blobAnimation}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-[75vw] px-4 py-8"
          >
            {/* Sekcja Hero */}
            <motion.section
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center py-16 md:py-24 w-full flex flex-col items-center"
            >
              {/* Powitanie z animowaną ręką */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <div className="flex items-center justify-center flex-wrap gap-2">
                  <WaveHand />
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg text-center">
                    Witaj, {user?.displayName || user?.email?.split('@')[0] || 'Użytkowniku'}!
                  </h2>
                </div>
              </motion.div>

              {/* Główny nagłówek */}
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-8 leading-tight drop-shadow-2xl px-4 w-full text-center"
              >
                Inteligentny Generator Lotto 🤖
              </motion.h1>

                             {/* Podtytuł */}
               <motion.p
                 initial={{ y: 30, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ duration: 0.8, delay: 0.8 }}
                                   className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white mb-20 w-full text-center leading-relaxed drop-shadow-lg px-4 font-bold"
               >
                 Wykorzystaj prawa matematyczne i sztuczną inteligencję, aby losować liczby w sposób nowoczesny i przejrzysty.
               </motion.p>

                             {/* Przyciski CTA */}
               <div className="flex flex-col gap-4 sm:gap-6 justify-center items-center w-full">
                 <motion.button
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   whileHover={{ 
                     scale: 1.05,
                     boxShadow: "0 20px 40px rgba(6, 182, 212, 0.4)"
                   }}
                   whileTap={{ scale: 0.95 }}
                   transition={{ duration: 0.3, delay: 0.8 }}
                   onClick={() => navigate('/my-lucky-numbers')}
                   className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-full shadow-2xl transform transition-all duration-300 relative overflow-hidden group w-full max-w-lg h-12 sm:h-16 md:h-20 flex items-center justify-center"
                 >
                   <motion.div
                     className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     initial={{ x: "-100%" }}
                     whileHover={{ x: "100%" }}
                     transition={{ duration: 0.6 }}
                   />
                   <span className="relative z-10">
                     <span className="hidden sm:inline">🍀 Twoje szczęśliwe liczby na dziś</span>
                     <span className="sm:hidden">🍀 Szczęśliwe liczby</span>
                   </span>
                 </motion.button>
                 
                 <motion.button
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   whileHover={{ 
                     scale: 1.05,
                     boxShadow: "0 20px 40px rgba(255, 193, 7, 0.4)"
                   }}
                   whileTap={{ scale: 0.95 }}
                   transition={{ duration: 0.3, delay: 1 }}
                   onClick={handleStartDrawing}
                   className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-full shadow-2xl transform transition-all duration-300 relative overflow-hidden group w-full max-w-lg h-12 sm:h-16 md:h-20 flex items-center justify-center"
                 >
                   <motion.div
                     className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     initial={{ x: "-100%" }}
                     whileHover={{ x: "100%" }}
                     transition={{ duration: 0.6 }}
                   />
                   <span className="relative z-10">🚀 Rozpocznij losowanie</span>
                 </motion.button>
                
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(147, 51, 234, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3, delay: 1.2 }}
                  onClick={() => navigate('/gry')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-full shadow-2xl transform transition-all duration-300 relative overflow-hidden group w-full max-w-2xl h-12 sm:h-16 md:h-20 flex items-center justify-center"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">🎰 Gry i zabawy</span>
                </motion.button>
                
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3, delay: 1.4 }}
                  onClick={() => navigate('/systems')}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-full shadow-2xl transform transition-all duration-300 relative overflow-hidden group w-full max-w-lg h-12 sm:h-16 md:h-20 flex items-center justify-center"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                                      <span className="relative z-10">🧮 Systemy Skrócone</span>
                </motion.button>
                
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3, delay: 1.6 }}
                  onClick={() => navigate('/ai-ultra-pro')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-full shadow-2xl transform transition-all duration-300 relative overflow-hidden group w-full max-w-lg h-12 sm:h-16 md:h-20 flex items-center justify-center"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">🤖 AI Ultra Pro</span>
                </motion.button>
              </div>
            </motion.section>

            {/* Sekcja informacyjna */}
            <motion.section
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="max-w-4xl mx-auto mb-16"
            >
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
                className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-200"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    Dlaczego warto?
                  </h3>
                </div>

                <div className="space-y-4 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-800 font-semibold text-left max-w-3xl mx-auto">
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    className="leading-tight text-center"
                  >
                    <span>Nasz system opiera się na prawach matematycznych oraz strategiach tworzonych przez sztuczną inteligencję.</span>
                  </motion.div>

                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                    className="leading-tight text-center"
                  >
                    <span>Celem jest ograniczanie budżetu i wsparcie odpowiedzialnej gry.</span>
                  </motion.div>

                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.8 }}
                    className="leading-tight text-center"
                  >
                    <span>Żaden system nie gwarantuje wygranej – traktuj to jako zabawę i inspirację.</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.section>

            {/* Call to action na dole */}
            <motion.section
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 2 }}
              className="text-center py-8"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-2xl"
              >
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Skorzystaj z generatorów już teraz!
                </p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-800 leading-tight font-semibold max-w-2xl mx-auto">
                  Kliknij menu w prawym górnym rogu, aby rozpocząć przygodę z inteligentnym losowaniem.
                </p>
              </motion.div>
            </motion.section>

            {/* Dekoracyjne elementy tła */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{
                  x: [0, 100, 0],
                  y: [0, -50, 0],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"
              />
              <motion.div
                animate={{
                  x: [0, -80, 0],
                  y: [0, 60, 0],
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"
              />
              <motion.div
                animate={{
                  x: [0, 60, 0],
                  y: [0, -80, 0],
                }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"
              />
              
              {/* Dodatkowe elementy dekoracyjne */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-1/3 right-1/4 w-16 h-16 bg-yellow-400/20 rounded-full blur-lg"
              />
              
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 40,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-lg"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};

export default HomePage;
