import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaEnvelope, FaGraduationCap, FaVenusMars, FaHome, FaBriefcase, FaUtensils, FaUser, FaCreditCard } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { API_BASE } from '../api';
import Header from './Header';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const DEGREE_OPTIONS = ['UG', 'PG'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const LUNCH_OPTIONS = ['VEG', 'NON-VEG'];
const COMPANION_OPTIONS = ['1 Veg', '1 Non veg', '2 Veg', '2 Non Veg', '1 Veg and 1 Non veg'];
const COURSE_OPTIONS = [
  'B.A. English',
  'B.A. Tamil',
  'B.A. History',
  'B.A. Economics',
  'B.A. Political Science',
  'B.A. Sociology',
  'B.A. Journalism and Mass Communication',
  'B.Sc. Mathematics',
  'B.Sc. Physics',
  'B.Sc. Chemistry',
  'B.Sc. Computer Science',
  'B.Sc. Information Technology',
  'B.Sc. Biotechnology',
  'B.Sc. Microbiology',
  'B.Sc. Botany',
  'B.Sc. Zoology',
  'B.Sc. Statistics',
  'B.Sc. Electronics',
  'B.Sc. Biochemistry',
  'B.Sc. Environmental Science',
  'B.Com.',
  'B.Com. (Computer Applications)',
  'B.Com. (Accounting and Finance)',
  'BBA',
  'BCA',
  'M.A. English',
  'M.A. Tamil',
  'M.A. History',
  'M.A. Economics',
  'M.A. Political Science',
  'M.A. Sociology',
  'M.A. Journalism and Mass Communication',
  'M.Sc. Mathematics',
  'M.Sc. Physics',
  'M.Sc. Chemistry',
  'M.Sc. Computer Science',
  'M.Sc. Information Technology',
  'M.Sc. Biotechnology',
  'M.Sc. Microbiology',
  'M.Sc. Botany',
  'M.Sc. Zoology',
  'M.Sc. Statistics',
  'M.Sc. Electronics',
  'M.Sc. Biochemistry',
  'M.Sc. Environmental Science',
  'M.Com.',
  'MCA',
  'MBA'
];

export default function GraduationRegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    university_register_no: '',
    college_roll_no: '',
    degree: '',
    course: '',
    whatsapp_number: '',
    email: '',
    gender: '',
    address: '',
    pursuing_higher_studies: 'No',
    hs_course_name: '',
    hs_institution_name: '',
    employed: 'No',
    lunch_required: '',
    companion_option: ''
  });
  const [errors, setErrors] = useState({});
  const [particles, setParticles] = useState([]);
  const formRef = useRef(null);

  const isFormValid = Object.entries(formData).every(([key, val]) => {
    if (['college_roll_no', 'email', 'address', 'hs_course_name', 'hs_institution_name'].includes(key)) return true;
    if (key === 'pursuing_higher_studies' || key === 'employed') return ['Yes', 'No'].includes(val);
    return String(val).trim();
  });

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 60 }, () => ({
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 20 + 12,
        speedX: (Math.random() - 0.5) * 6,
        speedY: (Math.random() - 0.5) * 6,
        color: `hsl(${Math.random() * 60 + 120}, 85%, 75%)`,
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
            size: p.size + (Math.random() - 0.5) * 0.6,
          };
        })
      );
    }, 30);

    // Check for session_id in URL after redirect
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      completeRegistration(sessionId);
    }

    return () => clearInterval(interval);
  }, []);

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
    } else if (formData.email && !(await checkEmailUnique(formData.email))) {
      newErrors.email = 'Email is already registered';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!['Yes', 'No'].includes(formData.pursuing_higher_studies)) {
      newErrors.pursuing_higher_studies = 'Pursuing higher studies must be Yes or No';
    }
    if (formData.pursuing_higher_studies === 'Yes' && !formData.hs_course_name.trim()) {
      newErrors.hs_course_name = 'Course name is required when pursuing higher studies';
    }
    if (formData.pursuing_higher_studies === 'Yes' && !formData.hs_institution_name.trim()) {
      newErrors.hs_institution_name = 'Institution name is required when pursuing higher studies';
    }
    if (!['Yes', 'No'].includes(formData.employed)) {
      newErrors.employed = 'Employed status must be Yes or No';
    }
    if (!formData.lunch_required) newErrors.lunch_required = 'Lunch preference is required';
    if (!formData.companion_option) newErrors.companion_option = 'Companion option is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (value.trim() || ['college_roll_no', 'email', 'address'].includes(name)) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePayment = async () => {
    if (!(await validateFields())) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/create-checkout-session`, formData);
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.id,
      });
      if (error) {
        console.error('Stripe redirect error:', error);
        toast.error('Failed to initiate payment');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
    }
  };

  const completeRegistration = async (sessionId) => {
    try {
      const response = await axios.post(`${API_BASE}/register`, { session_id: sessionId });
      toast.success('Registration successful! ID: ' + response.data.id);
      setFormData({
        name: '',
        university_register_no: '',
        college_roll_no: '',
        degree: '',
        course: '',
        whatsapp_number: '',
        email: '',
        gender: '',
        address: '',
        pursuing_higher_studies: 'No',
        hs_course_name: '',
        hs_institution_name: '',
        employed: 'No',
        lunch_required: '',
        companion_option: ''
      });
      setErrors({});
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-emerald-200 to-teal-200 relative overflow-hidden pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap');
            .font-inter { font-family: 'Inter', sans-serif; }
            .font-poppins { font-family: 'Poppins', sans-serif; }
            .shadow-text { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); }
          `}
        </style>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="natureGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 0.55 }} />
              <stop offset="100%" style={{ stopColor: '#34D399', stopOpacity: 0.55 }} />
            </linearGradient>
          </defs>
          <g>
            <path
              d="M0,1080 C150,950 350,900 550,950 C750,1000 950,900 1150,950 C1350,1000 1550,900 1920,950"
              fill="url(#natureGradient)"
              opacity="0.35"
            />
            <path
              d="M100,900 C250,750 450,800 650,750 C850,700 1050,800 1250,750 C1450,700 1650,800 1900,750"
              fill="url(#natureGradient)"
              opacity="0.3"
            />
            <path
              d="M150,250 Q250,150 350,250 T550,250 Q650,150 750,250 T950,250 Q1050,150 1150,250 T1350,250"
              fill="none"
              stroke="url(#natureGradient)"
              strokeWidth="16"
              opacity="0.45"
            />
            <path
              d="M50,450 Q150,350 250,450 T450,450 Q550,350 650,450 T850,450 Q950,350 1050,450 T1250,450"
              fill="none"
              stroke="url(#natureGradient)"
              strokeWidth="14"
              opacity="0.4"
            />
            <path
              d="M250,650 Q350,550 450,650 T650,650 Q750,550 850,650 T1050,650"
              fill="none"
              stroke="url(#natureGradient)"
              strokeWidth="12"
              opacity="0.35"
            />
          </g>
        </svg>
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ opacity: 0.7, scale: 0 }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  scale: particle.size / 10,
                  opacity: 0.65,
                }}
                transition={{ duration: 0.03, ease: 'linear' }}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  background: particle.color,
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.85)',
                }}
              />
            ))}
          </AnimatePresence>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl font-inter font-extrabold text-emerald-900 text-center mb-10 tracking-tight shadow-text"
        >
          Graduation Registration Form
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border-4 border-emerald-500/75 ring-4 ring-emerald-300/55 hover:ring-emerald-400/75 transition-all duration-300"
          >
            <h3 className="text-3xl font-black text-emerald-900 mb-8 font-inter flex items-center gap-4">
              <FaGraduationCap className="text-emerald-800 text-3xl" />
              Guidelines for Graduation Registration
            </h3>
            <div className="space-y-6 text-gray-800 font-poppins text-lg">
              <h4 className="text-xl font-semibold text-emerald-800">Step-by-Step Form Filling Instructions:</h4>
              <ol className="list-decimal ml-6 space-y-4">
                <li>Enter your full name in uppercase letters.</li>
                <li>Provide your university register number and college roll number (if applicable).</li>
                <li>Select your degree (UG or PG) and choose your course from the dropdown.</li>
                <li>Enter a 10-digit WhatsApp number and a unique email (email is optional).</li>
                <li>Select your gender and provide your address (address is optional).</li>
                <li>Indicate if you are pursuing higher studies; if yes, provide course and institution names.</li>
                <li>Specify employment status and select lunch preference (VEG or NON-VEG).</li>
                <li>Choose a companion option for lunch.</li>
                <li>Review all entered data before proceeding to payment.</li>
                <li>Complete the $10 registration fee payment via Stripe to finalize registration.</li>
              </ol>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border-4 border-emerald-500/75 ring-4 ring-emerald-300/55 hover:ring-emerald-400/75 transition-all duration-300"
          >
            <motion.h2
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-3xl font-black text-emerald-900 mb-8 font-inter tracking-tight flex items-center gap-4"
            >
              <FaGraduationCap className="text-3xl text-emerald-800" />
              Graduation Registration Form
            </motion.h2>
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaUser className="text-emerald-800 text-2xl" />
                  Full Name (Uppercase)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  placeholder="Enter full name"
                  required
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaGraduationCap className="text-emerald-800 text-2xl" />
                  University Register Number
                </label>
                <input
                  type="text"
                  name="university_register_no"
                  value={formData.university_register_no}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  placeholder="Enter university register number"
                  required
                />
                {errors.university_register_no && <p className="text-red-600 text-sm mt-1">{errors.university_register_no}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaGraduationCap className="text-emerald-800 text-2xl" />
                  College Roll Number (Optional)
                </label>
                <input
                  type="text"
                  name="college_roll_no"
                  value={formData.college_roll_no}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  placeholder="Enter college roll number"
                />
                {errors.college_roll_no && <p className="text-red-600 text-sm mt-1">{errors.college_roll_no}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaGraduationCap className="text-emerald-800 text-2xl" />
                  Degree
                </label>
                <select
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  required
                >
                  <option value="">-- Select Degree --</option>
                  {DEGREE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.degree && <p className="text-red-600 text-sm mt-1">{errors.degree}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaGraduationCap className="text-emerald-800 text-2xl" />
                  Course
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
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
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaPhone className="text-emerald-800 text-2xl" />
                  WhatsApp Number (10 digits)
                </label>
                <input
                  type="tel"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  placeholder="Enter 10-digit WhatsApp number"
                  required
                  maxLength="10"
                  pattern="\d{10}"
                />
                {errors.whatsapp_number && <p className="text-red-600 text-sm mt-1">{errors.whatsapp_number}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaEnvelope className="text-emerald-800 text-2xl" />
                  Email (Optional, must be unique)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  placeholder="Enter unique email address"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaVenusMars className="text-emerald-800 text-2xl" />
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  required
                >
                  <option value="">-- Select Gender --</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaHome className="text-emerald-800 text-2xl" />
                  Address (Optional)
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  placeholder="Enter address"
                  rows="4"
                />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.5 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaGraduationCap className="text-emerald-800 text-2xl" />
                  Pursuing Higher Studies
                </label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="pursuing_higher_studies"
                        value={option}
                        checked={formData.pursuing_higher_studies === option}
                        onChange={handleChange}
                        className="h-5 w-5 text-emerald-600 border-gray-200 focus:ring-emerald-500"
                      />
                      <span className="font-poppins text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.pursuing_higher_studies && <p className="text-red-600 text-sm mt-1">{errors.pursuing_higher_studies}</p>}
              </motion.div>
              {formData.pursuing_higher_studies === 'Yes' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                  >
                    <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                      <FaGraduationCap className="text-emerald-800 text-2xl" />
                      Higher Studies Course Name
                    </label>
                    <input
                      type="text"
                      name="hs_course_name"
                      value={formData.hs_course_name}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                      placeholder="Enter course name"
                      required
                    />
                    {errors.hs_course_name && <p className="text-red-600 text-sm mt-1">{errors.hs_course_name}</p>}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.7 }}
                  >
                    <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                      <FaGraduationCap className="text-emerald-800 text-2xl" />
                      Higher Studies Institution Name
                    </label>
                    <input
                      type="text"
                      name="hs_institution_name"
                      value={formData.hs_institution_name}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                      placeholder="Enter institution name"
                      required
                    />
                    {errors.hs_institution_name && <p className="text-red-600 text-sm mt-1">{errors.hs_institution_name}</p>}
                  </motion.div>
                </>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.8 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaBriefcase className="text-emerald-800 text-2xl" />
                  Employed
                </label>
                <div className="flex gap-4">
                  {['Yes', 'No'].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="employed"
                        value={option}
                        checked={formData.employed === option}
                        onChange={handleChange}
                        className="h-5 w-5 text-emerald-600 border-gray-200 focus:ring-emerald-500"
                      />
                      <span className="font-poppins text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.employed && <p className="text-red-600 text-sm mt-1">{errors.employed}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.9 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaUtensils className="text-emerald-800 text-2xl" />
                  Lunch Preference
                </label>
                <select
                  name="lunch_required"
                  value={formData.lunch_required}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
                  required
                >
                  <option value="">-- Select Lunch Preference --</option>
                  {LUNCH_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.lunch_required && <p className="text-red-600 text-sm mt-1">{errors.lunch_required}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.0 }}
              >
                <label className="block text-gray-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaUser className="text-emerald-800 text-2xl" />
                  Companion Option
                </label>
                <select
                  name="companion_option"
                  value={formData.companion_option}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/75 transition-all duration-300 font-poppins text-gray-800 text-lg placeholder-gray-400"
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
                onClick={handlePayment}
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(16,185,129,0.75)' }}
                whileTap={{ scale: 0.97 }}
                disabled={!isFormValid}
                className={`w-full bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-4 rounded-xl font-bold font-poppins text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                  !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaCreditCard className="text-2xl" />
                Proceed to Payment ($10)
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}