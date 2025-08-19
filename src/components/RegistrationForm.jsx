import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaEnvelope, FaGraduationCap, FaVenusMars, FaHome, FaBriefcase, FaUtensils, FaUser, FaCreditCard, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { API_BASE } from '../api';
import Header from './Header';

const DEGREE_OPTIONS = ['UG', 'PG'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const LUNCH_OPTIONS = ['VEG', 'NON-VEG'];
const COMPANION_OPTIONS = ['1 Veg', '1 Non veg', '2 Veg', '2 Non Veg', '1 Veg and 1 Non veg'];
const COURSE_OPTIONS = [
  'B.A. English', 'B.A. Tamil', 'B.A. History', 'B.A. Economics', 'B.A. Political Science', 'B.A. Sociology',
  'B.A. Journalism and Mass Communication', 'B.Sc. Mathematics', 'B.Sc. Physics', 'B.Sc. Chemistry',
  'B.Sc. Computer Science', 'B.Sc. Information Technology', 'B.Sc. Biotechnology', 'B.Sc. Microbiology',
  'B.Sc. Botany', 'B.Sc. Zoology', 'B.Sc. Statistics', 'B.Sc. Electronics', 'B.Sc. Biochemistry',
  'B.Sc. Environmental Science', 'B.Com.', 'B.Com. (Computer Applications)', 'B.Com. (Accounting and Finance)',
  'BBA', 'BCA', 'M.A. English', 'M.A. Tamil', 'M.A. History', 'M.A. Economics', 'M.A. Political Science',
  'M.A. Sociology', 'M.A. Journalism and Mass Communication', 'M.Sc. Mathematics', 'M.Sc. Physics',
  'M.Sc. Chemistry', 'M.Sc. Computer Science', 'M.Sc. Information Technology', 'M.Sc. Biotechnology',
  'M.Sc. Microbiology', 'M.Sc. Botany', 'M.Sc. Zoology', 'M.Sc. Statistics', 'M.Sc. Electronics',
  'M.Sc. Biochemistry', 'M.Sc. Environmental Science', 'M.Com.', 'MCA', 'MBA'
];

export default function GraduationRegistrationForm() {
  const initialFormData = {
    name: '',
    university_register_no: '',
    college_roll_no: '',
    degree: '',
    course: '',
    whatsapp_number: '',
    email: '',
    gender: '',
    address: '',
    pursuing_higher_studies: 0,
    hs_course_name: '',
    hs_institution_name: '',
    employed: 0,
    lunch_required: '',
    companion_option: ''
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [particles, setParticles] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const formRef = useRef(null);

  const isFormValid = Object.entries(formData).every(([key, val]) => {
    if (['college_roll_no', 'email', 'address', 'hs_course_name', 'hs_institution_name'].includes(key)) return true;
    if (key === 'pursuing_higher_studies' || key === 'employed') return [0, 1].includes(val);
    return String(val).trim();
  });

  useEffect(() => {
    const savedFormData = localStorage.getItem('graduationFormData');
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      setFormData({
        ...parsedData,
        pursuing_higher_studies: parsedData.pursuing_higher_studies === 'Yes' ? 1 : 0,
        employed: parsedData.employed === 'Yes' ? 1 : 0
      });
    }

    const generateParticles = () => {
      const newParticles = Array.from({ length: 50 }, () => ({
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 12 + 6,
        speedX: (Math.random() - 0.5) * 3,
        speedY: (Math.random() - 0.5) * 3,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 80%)`,
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => {
          let newX = p.x + p.speedX;
          let newY = p.y + p.speedY;
          if (newX < 0 || newX > window.innerWidth) p.speedX *= -1;
          if (newY < 0 || newY > window.innerHeight) p.speedY *= -1;
          return {
            ...p,
            x: newX,
            y: newY,
            size: p.size + (Math.random() - 0.5) * 0.3,
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  };

  const verifyPayment = async (order_id, payment_id, signature) => {
    try {
      const response = await axios.post(`${API_BASE}/verify-payment`, {
        order_id,
        payment_id,
        signature,
      });
      if (response.data.status === 'paid') {
        setPaymentStatus('completed');
        setPaymentDetails({ order_id, payment_id, signature });
        toast.success('Payment successful! Please submit the form to complete registration.', { id: 'payment-success' });
      } else {
        setPaymentStatus('failed');
        toast.error('Payment not completed. Please try again.', { id: 'payment-failed' });
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setPaymentStatus('failed');
      toast.error('Failed to verify payment', { id: 'payment-error' });
    }
  };

  const checkEmailUnique = async (email) => {
    if (!email) return true;
    try {
      const response = await axios.get(`${API_BASE}/check-email`, { params: { email } });
      return !response.data.exists;
    } catch (err) {
      console.error('Email check error:', err);
      return false;
    }
  };

  const checkRegisterNoUnique = async (registerNo) => {
    try {
      const response = await axios.get(`${API_BASE}/check-register-no`, { params: { university_register_no: registerNo } });
      return response.data.exists === false;
    } catch (err) {
      console.error('Register number check error:', err);
      toast.error('Failed to verify register number', { id: 'register-no-error' });
      return false;
    }
  };

  const validateFields = async () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.university_register_no.trim()) newErrors.university_register_no = 'University Register Number is required';
    if (!formData.degree) newErrors.degree = 'Degree is required';
    if (!formData.course) newErrors.course = 'Course is required';
    if (!formData.whatsapp_number || !/^\d{10}$/.test(formData.whatsapp_number)) {
      newErrors.whatsapp_number = 'WhatsApp number must be exactly 10 digits';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (![0, 1].includes(formData.pursuing_higher_studies)) {
      newErrors.pursuing_higher_studies = 'Pursuing higher studies must be Yes or No';
    }
    if (formData.pursuing_higher_studies === 1 && !formData.hs_course_name.trim()) {
      newErrors.hs_course_name = 'Course name is required when pursuing higher studies';
    }
    if (formData.pursuing_higher_studies === 1 && !formData.hs_institution_name.trim()) {
      newErrors.hs_institution_name = 'Institution name is required when pursuing higher studies';
    }
    if (![0, 1].includes(formData.employed)) {
      newErrors.employed = 'Employed status must be Yes or No';
    }
    if (!formData.lunch_required) newErrors.lunch_required = 'Lunch preference is required';
    if (!formData.companion_option) newErrors.companion_option = 'Companion option is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidateDetails = async () => {
    if (!(await validateFields())) {
      toast.error('Please fix the errors in the form', { id: 'validate-fields-error' });
      return;
    }

    try {
      const isEmailValid = formData.email ? await checkEmailUnique(formData.email) : true;
      const isRegisterNoValid = await checkRegisterNoUnique(formData.university_register_no);

      if (!isEmailValid) {
        setErrors((prev) => ({ ...prev, email: 'Email is already registered' }));
        toast.error('Email is already registered', { id: 'email-duplicate-error' });
        return;
      }

      if (!isRegisterNoValid) {
        setErrors((prev) => ({ ...prev, university_register_no: 'University Register Number is already registered' }));
        toast.error('University Register Number is already registered', { id: 'register-no-duplicate-error' });
        return;
      }

      setIsValidated(true);
      toast.success('Details validated successfully! You can now proceed to payment.', { id: 'validate-success' });
    } catch (err) {
      console.error('Validation error:', err);
      toast.error('Failed to validate details', { id: 'validate-error' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: name === 'pursuing_higher_studies' || name === 'employed' ? (value === 'Yes' ? 1 : 0) : value
      };
      localStorage.setItem('graduationFormData', JSON.stringify(updatedData));
      return updatedData;
    });
    if (value.trim() || ['college_roll_no', 'email', 'address'].includes(name)) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setIsValidated(false); // Reset validation on change
  };

  const handlePayment = async () => {
    if (!isValidated) {
      toast.error('Please validate details before proceeding to payment', { id: 'payment-not-validated-error' });
      return;
    }

    try {
      await loadRazorpayScript();
      const response = await axios.post(`${API_BASE}/create-checkout-session`, formData);
      const { id: order_id, key_id } = response.data;

      const options = {
        key: key_id,
        amount: 50000,
        currency: 'INR',
        name: 'Graduation Registration',
        description: 'Graduation Registration Fee',
        order_id: order_id,
        handler: function (response) {
          verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
          name: formData.name,
          email: formData.email || '',
          contact: formData.whatsapp_number,
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment initiation error:', err);
      toast.error(err.message || err.response?.data?.error || 'Failed to initiate payment', { id: 'payment-initiation-error' });
    }
  };

  const handleSubmit = async () => {
    if (paymentStatus !== 'completed') {
      toast.error('Please complete the payment before submitting the form', { id: 'submit-not-paid-error' });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/register`, {
        ...formData,
        order_id: paymentDetails.order_id,
        payment_id: paymentDetails.payment_id,
        signature: paymentDetails.signature,
      });
      toast.success('Registration successful! ID: ' + response.data.id, { id: 'register-success' });
      setFormData(initialFormData);
      setErrors({});
      setPaymentStatus(null);
      setPaymentDetails(null);
      setIsValidated(false);
      localStorage.removeItem('graduationFormData');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.error || 'Registration failed', { id: 'register-error' });
    }
  };

  return (
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#3B82F6',
              color: '#FFFFFF',
              fontWeight: '700',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '18px',
              padding: '16px 24px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.5)',
              border: '2px solid #1E40AF',
              maxWidth: '400px',
              textAlign: 'center',
            },
            iconTheme: {
              primary: '#FFFFFF',
              secondary: '#3B82F6',
            },
            duration: 5000,
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#FFFFFF',
              fontWeight: '700',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '18px',
              padding: '16px 24px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(239, 68, 68, 0.5)',
              border: '2px solid #B91C1C',
              maxWidth: '400px',
              textAlign: 'center',
            },
            iconTheme: {
              primary: '#FFFFFF',
              secondary: '#EF4444',
            },
            duration: 5000,
          },
        }}
      />
      <Header />
      <div className="min-h-screen bg-white relative overflow-hidden pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap');
            .font-inter { font-family: 'Inter', sans-serif; }
            .font-poppins { font-family: 'Poppins', sans-serif; }
            .shadow-text { text-shadow: 0 3px 8px rgba(0, 0, 0, 0.3); }
            .card-modern {
              position: relative;
              overflow: hidden;
              transition: all 0.4s ease;
              box-shadow: 0 12px 40px rgba(59, 130, 246, 0.15);
              border-radius: 32px;
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(12px);
            }
            .card-modern:hover {
              transform: translateY(-10px);
              box-shadow: 0 16px 60px rgba(59, 130, 246, 0.25);
            }
            .card-glow::before {
              content: '';
              position: absolute;
              inset: -4px;
              border-radius: 36px;
              filter: blur(12px);
              opacity: 0.25;
              z-index: -1;
              transition: opacity 0.4s ease;
            }
            .card-modern:hover .card-glow::before {
              opacity: 0.5;
            }
            .card-border-blue {
              border: 4px solid transparent;
              background: linear-gradient(white, white) padding-box, linear-gradient(45deg, #3B82F6, #60A5FA) border-box;
            }
            .card-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              border-radius: 32px;
              background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
              pointer-events: none;
            }
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.6);
              backdrop-filter: blur(8px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .modal-content {
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(12px);
              border-radius: 24px;
              box-shadow: 0 12px 40px rgba(59, 130, 246, 0.3);
              border: 4px solid transparent;
              background: linear-gradient(white, white) padding-box, linear-gradient(45deg, #3B82F6, #60A5FA) border-box;
              max-width: 600px;
              width: 90%;
              max-height: 80vh;
              overflow-y: auto;
              position: relative;
            }
            .modal-close {
              position: absolute;
              top: 16px;
              right: 16px;
              background: #EF4444;
              color: white;
              border-radius: 50%;
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s ease;
            }
            .modal-close:hover {
              background: #DC2626;
              transform: rotate(90deg);
            }
          `}
        </style>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1E3A8A', stopOpacity: 0.7 }} />
              <stop offset="50%" style={{ stopColor: '#3B82F6', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#60A5FA', stopOpacity: 0.5 }} />
            </linearGradient>
            <radialGradient id="radialGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: '#93C5FD', stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: '#1E3A8A', stopOpacity: 0.2 }} />
            </radialGradient>
          </defs>
          <g>
            <rect x="0" y="0" width="1920" height="1080" fill="url(#modernGradient)" opacity="0.2" />
            <circle cx="300" cy="200" r="250" fill="url(#radialGradient)" opacity="0.3" />
            <circle cx="1600" cy="800" r="300" fill="url(#radialGradient)" opacity="0.25" />
            <path
              d="M0,600 C400,400 800,600 1200,400 C1600,200 2000,400 1920,600"
              fill="none"
              stroke="url(#modernGradient)"
              strokeWidth="50"
              opacity="0.35"
            />
            <rect x="900" y="300" width="500" height="250" rx="50" fill="url(#radialGradient)" opacity="0.2" transform="rotate(45 1150 425)" />
            <path
              d="M100,900 C500,700 900,900 1300,700 C1700,500 2100,700 1920,900"
              fill="none"
              stroke="url(#modernGradient)"
              strokeWidth="40"
              opacity="0.3"
            />
            <circle cx="1100" cy="150" r="150" fill="url(#radialGradient)" opacity="0.25" />
            <path
              d="M200,100 C600,300 1000,100 1400,300 C1800,500 2200,300 1920,100"
              fill="none"
              stroke="url(#modernGradient)"
              strokeWidth="30"
              opacity="0.3"
            />
          </g>
        </svg>
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 0.6, scale: 0 }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  scale: particle.size / 8,
                  opacity: 0.7,
                }}
                transition={{ duration: 0.04, ease: 'linear' }}
                className="absolute rounded-full blur-sm"
                style={{
                  width: particle.size,
                  height: particle.size,
                  background: particle.color,
                  boxShadow: '0 0 25px rgba(59, 130, 246, 0.7)',
                }}
              />
            ))}
          </AnimatePresence>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl font-inter font-extrabold text-blue-900 text-center mb-12 tracking-tight shadow-text"
        >
          Graduation Registration Form
        </motion.h1>
        {paymentStatus === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 text-2xl font-poppins text-blue-800 font-semibold"
          >
            Payment Completed! Please submit the form to finalize registration.
          </motion.div>
        )}
        {paymentStatus === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 text-2xl font-poppins text-red-600 font-semibold"
          >
            Payment Failed. Please try again.
          </motion.div>
        )}
        {isValidated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 text-2xl font-poppins text-green-600 font-semibold"
          >
            Details Validated! You can now proceed to payment.
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="max-w-7xl mx-auto relative z-10"
        >
          <motion.div
            className="card-modern card-glow card-border-blue p-10 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="card-overlay" />
            <motion.button
              onClick={() => setShowGuidelines(true)}
              whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(59,130,246,0.8)' }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-6 right-6 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FaInfoCircle className="text-xl" />
            </motion.button>
            <motion.h2
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl font-inter font-extrabold text-blue-900 mb-8 flex items-center gap-4"
            >
              <FaGraduationCap className="text-blue-600 text-3xl" />
              Registration Details
            </motion.h2>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaUser className="text-blue-600 text-2xl" />
                    Full Name (Uppercase)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter full name"
                    required
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                    University Register Number
                  </label>
                  <input
                    type="text"
                    name="university_register_no"
                    value={formData.university_register_no}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter university register number"
                    required
                  />
                  {errors.university_register_no && <p className="text-red-600 text-sm mt-1">{errors.university_register_no}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                    College Roll Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="college_roll_no"
                    value={formData.college_roll_no}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter college roll number"
                  />
                  {errors.college_roll_no && <p className="text-red-600 text-sm mt-1">{errors.college_roll_no}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                    Degree
                  </label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    required
                  >
                    <option value="">-- Select Degree --</option>
                    {DEGREE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.degree && <p className="text-red-600 text-sm mt-1">{errors.degree}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                    Course
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    required
                  >
                    <option value="">-- Select Course --</option>
                    {COURSE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.course && <p className="text-red-600 text-sm mt-1">{errors.course}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaPhone className="text-blue-600 text-2xl" />
                    WhatsApp Number (10 digits)
                  </label>
                  <input
                    type="tel"
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter 10-digit WhatsApp number"
                    required
                    maxLength="10"
                    pattern="\d{10}"
                  />
                  {errors.whatsapp_number && <p className="text-red-600 text-sm mt-1">{errors.whatsapp_number}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaEnvelope className="text-blue-600 text-2xl" />
                    Email (Optional, must be unique)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter unique email address"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaVenusMars className="text-blue-600 text-2xl" />
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    required
                  >
                    <option value="">-- Select Gender --</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaHome className="text-blue-600 text-2xl" />
                  Address (Optional)
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                  placeholder="Enter address"
                  rows="4"
                />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                    Pursuing Higher Studies
                  </label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="pursuing_higher_studies"
                          value={option}
                          checked={formData.pursuing_higher_studies === (option === 'Yes' ? 1 : 0)}
                          onChange={handleChange}
                          className="h-5 w-5 text-blue-600 border-blue-200 focus:ring-blue-400"
                        />
                        <span className="font-poppins text-blue-900">{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.pursuing_higher_studies && <p className="text-red-600 text-sm mt-1">{errors.pursuing_higher_studies}</p>}
                </motion.div>
                {formData.pursuing_higher_studies === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                  >
                    <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                      <FaGraduationCap className="text-blue-600 text-2xl" />
                      Higher Studies Course Name
                    </label>
                    <input
                      type="text"
                      name="hs_course_name"
                      value={formData.hs_course_name}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                      placeholder="Enter course name"
                      required
                    />
                    {errors.hs_course_name && <p className="text-red-600 text-sm mt-1">{errors.hs_course_name}</p>}
                  </motion.div>
                )}
              </div>
              {formData.pursuing_higher_studies === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.6 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                    Higher Studies Institution Name
                  </label>
                  <input
                    type="text"
                    name="hs_institution_name"
                    value={formData.hs_institution_name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter institution name"
                    required
                  />
                  {errors.hs_institution_name && <p className="text-red-600 text-sm mt-1">{errors.hs_institution_name}</p>}
                </motion.div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.7 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaBriefcase className="text-blue-600 text-2xl" />
                    Employed
                  </label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="employed"
                          value={option}
                          checked={formData.employed === (option === 'Yes' ? 1 : 0)}
                          onChange={handleChange}
                          className="h-5 w-5 text-blue-600 border-blue-200 focus:ring-blue-400"
                        />
                        <span className="font-poppins text-blue-900">{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.employed && <p className="text-red-600 text-sm mt-1">{errors.employed}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.8 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaUtensils className="text-blue-600 text-2xl" />
                    Lunch Preference
                  </label>
                  <select
                    name="lunch_required"
                    value={formData.lunch_required}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    required
                  >
                    <option value="">-- Select Lunch Preference --</option>
                    {LUNCH_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.lunch_required && <p className="text-red-600 text-sm mt-1">{errors.lunch_required}</p>}
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.9 }}
              >
                <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaUser className="text-blue-600 text-2xl" />
                  Companion Option
                </label>
                <select
                  name="companion_option"
                  value={formData.companion_option}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                  required
                >
                  <option value="">-- Select Companion Option --</option>
                  {COMPANION_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.companion_option && <p className="text-red-600 text-sm mt-1">{errors.companion_option}</p>}
              </motion.div>
              <motion.button
                type="button"
                onClick={handleValidateDetails}
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(59,130,246,0.8)' }}
                whileTap={{ scale: 0.97 }}
                disabled={!isFormValid || isValidated}
                className={`w-full bg-gradient-to-r from-green-600 to-green-400 text-white py-4 rounded-xl font-bold font-poppins text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${!isFormValid || isValidated ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaCheckCircle className="text-2xl" />
                Validate Details
              </motion.button>
              {isValidated && (
                <motion.button
                  type="button"
                  onClick={handlePayment}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(59,130,246,0.8)' }}
                  whileTap={{ scale: 0.97 }}
                  disabled={paymentStatus === 'completed'}
                  className={`w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-4 rounded-xl font-bold font-poppins text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mt-4 ${paymentStatus === 'completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FaCreditCard className="text-2xl" />
                  Proceed to Payment (₹500)
                </motion.button>
              )}
              {paymentStatus === 'completed' && (
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(59,130,246,0.8)' }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-4 rounded-xl font-bold font-poppins text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mt-4"
                >
                  <FaGraduationCap className="text-2xl" />
                  Submit Registration
                </motion.button>
              )}
            </div>
          </motion.div>
          <AnimatePresence>
            {showGuidelines && (
              <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="modal-content p-8 relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
                >
                  <motion.div
                    className="modal-close"
                    onClick={() => setShowGuidelines(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.div>
                  <h3 className="text-3xl font-inter font-extrabold text-blue-900 mb-6 flex items-center gap-4">
                    <FaGraduationCap className="text-blue-600 text-3xl" />
                    Guidelines for Graduation Registration
                  </h3>
                  <div className="space-y-6 text-blue-800 font-poppins text-lg">
                    <h4 className="text-xl font-semibold text-blue-800">Step-by-Step Form Filling Instructions:</h4>
                    <ol className="list-decimal ml-6 space-y-4">
                      <li>Enter your full name in uppercase letters.</li>
                      <li>Provide your university register number and college roll number (if applicable).</li>
                      <li>Select your degree (UG or PG) and choose your course from the dropdown.</li>
                      <li>Enter a 10-digit WhatsApp number and a unique email (email is optional).</li>
                      <li>Select your gender and provide your address (address is optional).</li>
                      <li>Indicate if you are pursuing higher studies; if yes, provide course and institution names.</li>
                      <li>Specify employment status and select lunch preference (VEG or NON-VEG).</li>
                      <li>Choose a companion option for lunch.</li>
                      <li>Click "Validate Details" to verify your details are unique.</li>
                      <li>After successful validation, proceed to payment of ₹500 via Razorpay.</li>
                      <li>After successful payment, submit the form to finalize registration.</li>
                    </ol>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}