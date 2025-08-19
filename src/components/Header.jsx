import { motion } from 'framer-motion';
import { FaLeaf, FaUserGraduate } from 'react-icons/fa';
import logo from '../../public/logo.png';

function Header() {
  const logoVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: { scale: 1, opacity: 1 },
    hover: {
      scale: 1.2,
      rotate: 10,
      boxShadow: '0 0 50px rgba(59, 130, 246, 0.9)',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap');
          .font-inter { font-family: 'Inter', sans-serif; }
          .font-poppins { font-family: 'Poppins', sans-serif; }
          .shadow-text { text-shadow: 0 3px 8px rgba(0, 0, 0, 0.3); }
          .header-modern {
            box-shadow: 0 10px 40px rgba(59, 130, 246, 0.4);
            border-bottom: 4px solid rgba(59, 130, 246, 0.6);
          }
          .header-glow::before {
            content: '';
            position: absolute;
            inset: -4px;
            background: linear-gradient(45deg, #3B82F6, #60A5FA, #93C5FD, #1E3A8A);
            filter: blur(12px);
            opacity: 0.3;
            z-index: -1;
            transition: opacity 0.4s ease;
          }
          .header-modern:hover .header-glow::before {
            opacity: 0.5;
          }
          .header-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
            pointer-events: none;
          }
        `}
      </style>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-900 to-black header-modern  flex items-center justify-between px-8 lg:px-12 relative overflow-hidden"
      >
        <div className="header-overlay" />
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          viewBox="0 0 1920 96"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#1E3A8A', stopOpacity: 0.7 }} />
              <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0.6 }} />
            </linearGradient>
          </defs>
          <g>
            <path
              d="M0,96 C300,48 600,72 900,48 C1200,24 1500,72 1920,48"
              fill="url(#headerGradient)"
              opacity="0.35"
            />
            <path
              d="M200,84 Q400,36 600,84 T1000,84 Q1200,36 1400,84 T1800,84"
              fill="none"
              stroke="url(#headerGradient)"
              strokeWidth="10"
              opacity="0.4"
            />
            <path
              d="M100,72 Q300,24 500,72 T900,72 Q1100,24 1300,72 T1700,72"
              fill="none"
              stroke="url(#headerGradient)"
              strokeWidth="8"
              opacity="0.3"
            />
            <circle cx="1600" cy="48" r="40" fill="url(#headerGradient)" opacity="0.25" />
          </g>
        </svg>
        <div className="flex items-center space-x-6 relative z-10">
          <motion.img
            src={logo}
            alt="Periyar University Logo"
            className="w-16 h-16 rounded-full border-2 border-blue-300/50 shadow-[0_0_30px_rgba(59,130,246,0.7)] object-cover"
            variants={logoVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          />
          <div className="flex flex-col justify-center">
            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
              className="text-xl lg:text-2xl font-inter font-extrabold text-white tracking-tight shadow-text"
            >
              Periyar University
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
              className="text-sm lg:text-base font-poppins font-medium text-blue-200 leading-tight"
            >
              NAAC 'A++' Grade | NIRF Rank 56
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="text-sm lg:text-base font-poppins font-medium text-blue-200"
            >
              Salem-636011, Tamil Nadu
            </motion.p>
          </div>
        </div>
        <div className="flex items-center space-x-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="relative text-base lg:text-lg font-semibold font-poppins text-white px-7 py-3 rounded-full bg-blue-800   transition-all duration-400 overflow-hidden group"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-blue-900 opacity-0 group-hover:opacity-50 transition-opacity duration-400"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.4 }}
            />
            <motion.div className="relative z-10 flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ duration: 0.3 }}
              >
                <FaLeaf className="text-xl lg:text-2xl" />
              </motion.div>
              <span>Graduation Registration Portal</span>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <div className="w-14 h-14 rounded-full bg-blue-800 flex items-center justify-center">
              <FaUserGraduate className="text-2xl text-white" />
            </div>
          </motion.div>
        </div>
      </motion.header>
    </>
  );
}

export default Header;