import { motion } from 'framer-motion';
import { FaLeaf, FaUserGraduate } from 'react-icons/fa';
import logo from '../../public/logo.png'
function Header() {
  const logoVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: { scale: 1, opacity: 1 },
    hover: {
      scale: 1.15,
      rotate: 8,
      boxShadow: '0 0 45px rgba(16, 185, 129, 0.85)',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=Poppins:wght@300;400;500;600&display=swap');
          .font-inter { font-family: 'Inter', sans-serif; }
          .font-poppins { font-family: 'Poppins', sans-serif; }
        `}
      </style>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-r from-emerald-700 to-teal-600 shadow-[0_8px_35px_rgba(16,185,129,0.35)] z-50 flex items-center justify-between px-6 lg:px-20 relative overflow-hidden"
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1920 96"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: '#34D399', stopOpacity: 0.5 }} />
            </linearGradient>
          </defs>
          <g>
            <path
              d="M0,96 C200,48 400,72 600,48 C800,24 1000,72 1200,48 C1400,24 1600,72 1920,48"
              fill="url(#headerGradient)"
              opacity="0.3"
            />
            <path
              d="M300,84 Q400,36 500,84 T700,84 Q800,36 900,84 T1100,84 Q1200,36 1300,84 T1500,84"
              fill="none"
              stroke="url(#headerGradient)"
              strokeWidth="8"
              opacity="0.4"
            />
            <path
              d="M50,72 Q150,24 250,72 T450,72 Q550,24 650,72 T850,72"
              fill="none"
              stroke="url(#headerGradient)"
              strokeWidth="6"
              opacity="0.35"
            />
          </g>
        </svg>
        <div className="flex items-center space-x-6 relative z-10">
          <motion.img
            src={logo}
            alt="Periyar University Logo"
            className="w-16 h-16 rounded-full border-2 border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.65)] object-cover"
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
              className="text-xl lg:text-2xl font-inter font-extrabold text-white tracking-tight"
            >
              Periyar University
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
              className="text-base lg:text-xs font-poppins font-medium text-emerald-100 leading-tight"
            >
              NAAC 'A++' Grade | NIRF Rank 56
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="text-base lg:text-xs font-poppins font-medium text-emerald-100"
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
            className="relative text-base lg:text-lg font-semibold font-poppins text-white px-7 py-3 rounded-full bg-emerald-800 shadow-[0_0_25px_rgba(16,185,129,0.75)] hover:shadow-[0_0_35px_rgba(16,185,129,0.95)] transition-all duration-400 overflow-hidden group"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-emerald-900 opacity-0 group-hover:opacity-50 transition-opacity duration-400"
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
            whileHover={{ scale: 1.1 }}
          >
            <div className="w-14 h-14 rounded-full bg-emerald-800 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.75)]">
              <FaUserGraduate className="text-2xl text-white" />
            </div>
          </motion.div>
        </div>
      </motion.header>
    </>
  );
}

export default Header;