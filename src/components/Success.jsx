import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import Header from './Header';

export default function Success() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-emerald-200 to-teal-200 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border-4 border-emerald-500/75 text-center"
        >
          <FaCheckCircle className="text-6xl text-emerald-600 mx-auto mb-4" />
          <h1 className="text-3xl font-inter font-extrabold text-emerald-900 mb-4">Payment Successful!</h1>
          <p className="text-lg font-poppins text-gray-800">Your registration has been completed. You will receive a confirmation soon.</p>
        </motion.div>
      </div>
    </>
  );
}