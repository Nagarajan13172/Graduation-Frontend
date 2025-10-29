import { motion } from 'framer-motion';
import { FaTimesCircle } from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router';
import Header from './Header';

export default function Cancel() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderid');
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
          <FaTimesCircle className="text-6xl text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-inter font-extrabold text-emerald-900 mb-4">Payment Failed</h1>
          <p className="text-lg font-poppins text-gray-800 mb-6">Your payment was cancelled. Please try again.</p>
          <Link
            to={orderId ? `/?orderid=${orderId}` : '/'}
            className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-3 px-6 rounded-xl font-bold font-poppins text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Back to Registration
          </Link>
        </motion.div>
      </div>
    </>
  );
}