import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaEnvelope, FaGraduationCap, FaVenusMars, FaHome, FaBriefcase, FaUtensils, FaUser, FaInfoCircle, FaCheckCircle, FaCamera, FaIdCard, FaFileAlt, FaSignature } from 'react-icons/fa';
import { API_BASE } from '../api';
import Header from './Header';

const DEGREE_OPTIONS = ['UG', 'PG'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const LUNCH_OPTIONS = ['VEG', 'NON-VEG'];
const COMMUNITY_OPTIONS = ['OC', 'BC', 'SC', 'ST', 'MBC'];
const DISTRICT_OPTIONS = ['Dharmapuri', 'Krishnagiri', 'Namakkal', 'Salem'];
const COMPANION_OPTIONS = ['1 Veg', '1 Non veg', '2 Veg', '2 Non Veg', '1 Veg and 1 Non veg'];

export default function GraduationRegistrationForm() {
  const initialFormData = {
    full_name: '',
    date_of_birth: '',
    gender: '',
    guardian_name: '',
    nationality: '',
    religion: '',
    email: '',
    mobile_number: '',
    place_of_birth: '',
    community: '',
    mother_tongue: '',
    applicant_photo: null,
    aadhar_number: '',
    aadhar_copy: null,
    residence_certificate: null,
    degree_name: '',
    university_name: '',
    degree_pattern: '',
    convocation_year: '',
    degree_certificate: null,
    is_registered_graduate: 0,
    other_university_certificate: null,
    occupation: '',
    address: '',
    signature: null,
    declaration: false,
    lunch_required: '',
    companion_option: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [particles, setParticles] = useState([]);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const formRef = useRef(null);

  const isFormValid = Object.entries(formData).every(([key, val]) => {
    if (['email', 'address', 'other_university_certificate'].includes(key)) return true;
    if (key === 'is_registered_graduate') return [0, 1].includes(val);
    if (key === 'declaration') return val === true;
    if (['applicant_photo', 'aadhar_copy', 'residence_certificate', 'degree_certificate', 'signature'].includes(key)) return val instanceof File;
    return String(val).trim();
  });

  useEffect(() => {
    const savedFormData = localStorage.getItem('graduationFormData');
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      setFormData({
        ...parsedData,
        is_registered_graduate: parsedData.is_registered_graduate === 'Yes' ? 1 : 0,
        declaration: parsedData.declaration === 'true' || parsedData.declaration === true
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
    if (!formData.full_name.trim()) newErrors.full_name = 'Full Name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of Birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.guardian_name.trim()) newErrors.guardian_name = 'Guardian Name is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!formData.religion.trim()) newErrors.religion = 'Religion is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.mobile_number || !/^\d{10}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Mobile number must be exactly 10 digits';
    }
    if (!formData.place_of_birth) newErrors.place_of_birth = 'Place of Birth is required';
    if (!formData.community) newErrors.community = 'Community is required';
    if (!formData.mother_tongue.trim()) newErrors.mother_tongue = 'Mother Tongue is required';
    if (!formData.applicant_photo) newErrors.applicant_photo = 'Applicant Photo is required';
    if (!formData.aadhar_number || !/^\d{12}$/.test(formData.aadhar_number)) {
      newErrors.aadhar_number = 'Aadhar Number must be exactly 12 digits';
    }
    if (!formData.aadhar_copy) newErrors.aadhar_copy = 'Aadhar Copy is required';
    if (!formData.residence_certificate) newErrors.residence_certificate = 'Residence Certificate is required';
    if (!formData.degree_name.trim()) newErrors.degree_name = 'Degree Name is required';
    if (!formData.university_name.trim()) newErrors.university_name = 'University Name is required';
    if (!formData.degree_pattern.trim()) newErrors.degree_pattern = 'Degree Pattern is required';
    if (!formData.convocation_year.trim()) newErrors.convocation_year = 'Convocation Year is required';
    if (!formData.degree_certificate) newErrors.degree_certificate = 'Degree Certificate is required';
    if (formData.is_registered_graduate === 1 && !formData.other_university_certificate) {
      newErrors.other_university_certificate = 'Other University Certificate is required';
    }
    if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.signature) newErrors.signature = 'Signature is required';
    if (!formData.declaration) newErrors.declaration = 'You must agree to the declaration';
    if (!formData.lunch_required) newErrors.lunch_required = 'Lunch Preference is required';
    if (!formData.companion_option) newErrors.companion_option = 'Companion Option is required';

    // File size validations
    if (formData.applicant_photo && formData.applicant_photo.size > 2 * 1024 * 1024) {
      newErrors.applicant_photo = 'Applicant Photo must be less than 2MB';
    }
    if (formData.aadhar_copy && formData.aadhar_copy.size > 2 * 1024 * 1024) {
      newErrors.aadhar_copy = 'Aadhar Copy must be less than 2MB';
    }
    if (formData.residence_certificate && formData.residence_certificate.size > 5 * 1024 * 1024) {
      newErrors.residence_certificate = 'Residence Certificate must be less than 5MB';
    }
    if (formData.degree_certificate && formData.degree_certificate.size > 5 * 1024 * 1024) {
      newErrors.degree_certificate = 'Degree Certificate must be less than 5MB';
    }
    if (formData.other_university_certificate && formData.other_university_certificate.size > 5 * 1024 * 1024) {
      newErrors.other_university_certificate = 'Other University Certificate must be less than 5MB';
    }
    if (formData.signature && formData.signature.size > 5 * 1024 * 1024) {
      newErrors.signature = 'Signature must be less than 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : (name === 'is_registered_graduate' ? (value === 'Yes' ? 1 : 0) : value)
      };
      localStorage.setItem('graduationFormData', JSON.stringify({
        ...updatedData,
        applicant_photo: null,
        aadhar_copy: null,
        residence_certificate: null,
        degree_certificate: null,
        other_university_certificate: null,
        signature: null
      }));
      return updatedData;
    });
    if ((type !== 'file' && value.trim()) || type === 'file' || type === 'checkbox') {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setIsValidated(false);
  };

  const handleSubmit = async () => {
    if (!isValidated) {
      toast.error('Please validate details before submitting', { id: 'submit-not-validated-error' });
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, value);
        }
      });

      const response = await axios.post(`${API_BASE}/register`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Registration successful! ID: ' + response.data.id, { id: 'register-success' });
      setFormData(initialFormData);
      setErrors({});
      setIsValidated(false);
      localStorage.removeItem('graduationFormData');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.error || 'Registration failed', { id: 'register-error' });
    }
  };

  const handleValidateDetails = async () => {
    if (!(await validateFields())) {
      toast.error('Please fix the errors in the form', { id: 'validate-fields-error' });
      return;
    }

    try {
      const isEmailValid = formData.email ? await checkEmailUnique(formData.email) : true;
      if (!isEmailValid) {
        setErrors((prev) => ({ ...prev, email: 'Email is already registered' }));
        toast.error('Email is already registered', { id: 'email-duplicate-error' });
        return;
      }

      setIsValidated(true);
      toast.success('Details validated successfully! You can now submit the form.', { id: 'validate-success' });
    } catch (err) {
      console.error('Validation error:', err);
      toast.error('Failed to validate details', { id: 'validate-error' });
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
        {isValidated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 text-2xl font-poppins text-green-600 font-semibold"
          >
            Details Validated! You can now submit the form.
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
                    Full Name (As in Degree Certificate)
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter full name"
                    required
                  />
                  {errors.full_name && <p className="text-red-600 text-sm mt-1">{errors.full_name}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                    required
                  />
                  {errors.date_of_birth && <p className="text-red-600 text-sm mt-1">{errors.date_of_birth}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaVenusMars className="text-blue-600 text-2xl" />
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
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
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaUser className="text-blue-600 text-2xl" />
                    Name of Father/Husband/Mother/Wife
                  </label>
                  <input
                    type="text"
                    name="guardian_name"
                    value={formData.guardian_name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter guardian name"
                    required
                  />
                  {errors.guardian_name && <p className="text-red-600 text-sm mt-1">{errors.guardian_name}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaUser className="text-blue-600 text-2xl" />
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter nationality"
                    required
                  />
                  {errors.nationality && <p className="text-red-600 text-sm mt-1">{errors.nationality}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaUser className="text-blue-600 text-2xl" />
                    Religion
                  </label>
                  <input
                    type="text"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter religion"
                    required
                  />
                  {errors.religion && <p className="text-red-600 text-sm mt-1">{errors.religion}</p>}
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
                    <FaPhone className="text-blue-600 text-2xl" />
                    Mobile Number (10 digits)
                  </label>
                  <input
                    type="tel"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter 10-digit mobile number"
                    required
                    maxLength="10"
                    pattern="\d{10}"
                  />
                  {errors.mobile_number && <p className="text-red-600 text-sm mt-1">{errors.mobile_number}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.3 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaHome className="text-blue-600 text-2xl" />
                    Place of Birth (District)
                  </label>
                  <select
                    name="place_of_birth"
                    value={formData.place_of_birth}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                    required
                  >
                    <option value="">-- Select District --</option>
                    {DISTRICT_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.place_of_birth && <p className="text-red-600 text-sm mt-1">{errors.place_of_birth}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaUser className="text-blue-600 text-2xl" />
                    Community
                  </label>
                  <select
                    name="community"
                    value={formData.community}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                    required
                  >
                    <option value="">-- Select Community --</option>
                    {COMMUNITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.community && <p className="text-red-600 text-sm mt-1">{errors.community}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.5 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaUser className="text-blue-600 text-2xl" />
                    Mother Tongue
                  </label>
                  <input
                    type="text"
                    name="mother_tongue"
                    value={formData.mother_tongue}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter mother tongue"
                    required
                  />
                  {errors.mother_tongue && <p className="text-red-600 text-sm mt-1">{errors.mother_tongue}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.6 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaCamera className="text-blue-600 text-2xl" />
                    Applicant Photo (Max 2MB)
                  </label>
                  <input
                    type="file"
                    name="applicant_photo"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                    required
                  />
                  {errors.applicant_photo && <p className="text-red-600 text-sm mt-1">{errors.applicant_photo}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.7 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaIdCard className="text-blue-600 text-2xl" />
                    Aadhar Number (12 digits)
                  </label>
                  <input
                    type="text"
                    name="aadhar_number"
                    value={formData.aadhar_number}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter 12-digit Aadhar number"
                    required
                    maxLength="12"
                    pattern="\d{12}"
                  />
                  {errors.aadhar_number && <p className="text-red-600 text-sm mt-1">{errors.aadhar_number}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.8 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaFileAlt className="text-blue-600 text-2xl" />
                    Aadhar Copy (Max 2MB)
                  </label>
                  <input
                    type="file"
                    name="aadhar_copy"
                    accept="image/*,application/pdf"
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                    required
                  />
                  {errors.aadhar_copy && <p className="text-red-600 text-sm mt-1">{errors.aadhar_copy}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.9 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaFileAlt className="text-blue-600 text-2xl" />
                    Residence/Nativity Certificate (Max 5MB)
                  </label>
                  <input
                    type="file"
                    name="residence_certificate"
                    accept="image/*,application/pdf"
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                    required
                  />
                  {errors.residence_certificate && <p className="text-red-600 text-sm mt-1">{errors.residence_certificate}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.0 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                    Name of Degree/Degrees
                  </label>
                  <input
                    type="text"
                    name="degree_name"
                    value={formData.degree_name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter degree name(s)"
                    required
                  />
                  {errors.degree_name && <p className="text-red-600 text-sm mt-1">{errors.degree_name}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.1 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                    University Name
                  </label>
                  <input
                    type="text"
                    name="university_name"
                    value={formData.university_name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter university name"
                    required
                  />
                  {errors.university_name && <p className="text-red-600 text-sm mt-1">{errors.university_name}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.2 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                    Degree Pattern (e.g., 10+2+3)
                  </label>
                  <input
                    type="text"
                    name="degree_pattern"
                    value={formData.degree_pattern}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter degree pattern"
                    required
                  />
                  {errors.degree_pattern && <p className="text-red-600 text-sm mt-1">{errors.degree_pattern}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.3 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                    Convocation Year
                  </label>
                  <input
                    type="text"
                    name="convocation_year"
                    value={formData.convocation_year}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter convocation year"
                    required
                  />
                  {errors.convocation_year && <p className="text-red-600 text-sm mt-1">{errors.convocation_year}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.4 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaFileAlt className="text-blue-600 text-2xl" />
                    Degree Certificate (Max 5MB)
                  </label>
                  <input
                    type="file"
                    name="degree_certificate"
                    accept="image/*,application/pdf"
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                    required
                  />
                  {errors.degree_certificate && <p className="text-red-600 text-sm mt-1">{errors.degree_certificate}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.5 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-2xl" />
                    Registered Graduate of Other University
                  </label>
                  <div className="flex gap-4">
                    {['Yes', 'No'].map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="is_registered_graduate"
                          value={option}
                          checked={formData.is_registered_graduate === (option === 'Yes' ? 1 : 0)}
                          onChange={handleChange}
                          className="h-5 w-5 text-blue-600 border-blue-200 focus:ring-blue-400"
                        />
                        <span className="font-poppins text-blue-900">{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.is_registered_graduate && <p className="text-red-600 text-sm mt-1">{errors.is_registered_graduate}</p>}
                </motion.div>
                {formData.is_registered_graduate === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 2.6 }}
                  >
                    <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                      <FaFileAlt className="text-blue-600 text-2xl" />
                      Other University Certificate (Max 5MB)
                    </label>
                    <input
                      type="file"
                      name="other_university_certificate"
                      accept="image/*,application/pdf"
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                      required
                    />
                    {errors.other_university_certificate && <p className="text-red-600 text-sm mt-1">{errors.other_university_certificate}</p>}
                  </motion.div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.7 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaBriefcase className="text-blue-600 text-2xl" />
                    Present Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter current occupation"
                    required
                  />
                  {errors.occupation && <p className="text-red-600 text-sm mt-1">{errors.occupation}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.8 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaHome className="text-blue-600 text-2xl" />
                    Address for Communication
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-blue-400/60"
                    placeholder="Enter address"
                    rows="4"
                    required
                  />
                  {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 2.9 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaSignature className="text-blue-600 text-2xl" />
                    Signature (Max 5MB)
                  </label>
                  <input
                    type="file"
                    name="signature"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                    required
                  />
                  {errors.signature && <p className="text-red-600 text-sm mt-1">{errors.signature}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 3.0 }}
                >
                  <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                    <FaUtensils className="text-blue-600 text-2xl" />
                    Lunch Preference
                  </label>
                  <select
                    name="lunch_required"
                    value={formData.lunch_required}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
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
                transition={{ duration: 0.5, delay: 3.1 }}
              >
                <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaUser className="text-blue-600 text-2xl" />
                  Companion Option
                </label>
                <select
                  name="companion_option"
                  value={formData.companion_option}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                  required
                >
                  <option value="">-- Select Companion Option --</option>
                  {COMPANION_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.companion_option && <p className="text-red-600 text-sm mt-1">{errors.companion_option}</p>}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 3.2 }}
              >
                <label className="block text-blue-800 font-semibold mb-2 flex items-center gap-3 text-lg font-poppins">
                  <FaCheckCircle className="text-blue-600 text-2xl" />
                  Declaration
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="declaration"
                    checked={formData.declaration}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 border-blue-200 focus:ring-blue-400"
                    required
                  />
                  <span className="font-poppins text-blue-900 text-lg">
                    I declare the above information is true to the best of my knowledge and if it is found to be untrue, my claim may be considered invalid.
                  </span>
                </label>
                {errors.declaration && <p className="text-red-600 text-sm mt-1">{errors.declaration}</p>}
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
                      <li>Enter your full name as it appears in the degree certificate.</li>
                      <li>Provide your date of birth and select your gender.</li>
                      <li>Enter the name of your father/husband/mother/wife, nationality, and religion.</li>
                      <li>Provide a unique email (optional) and a 10-digit mobile number.</li>
                      <li>Select your place of birth (district), community, and mother tongue.</li>
                      <li>Upload a passport-size photo (max 2MB), Aadhar card (max 2MB), and residence certificate (max 5MB).</li>
                      <li>Enter degree name(s), university name, degree pattern (e.g., 10+2+3), and convocation year.</li>
                      <li>Upload a self-attested degree certificate (max 5MB).</li>
                      <li>Indicate if you are a registered graduate of another university; if yes, upload the certificate (max 5MB).</li>
                      <li>Provide your current occupation and address for communication.</li>
                      <li>Upload your signature (max 5MB).</li>
                      <li>Select lunch preference and companion option.</li>
                      <li>Agree to the declaration.</li>
                      <li>Click "Validate Details" to verify your details.</li>
                      <li>After successful validation, submit the form to finalize registration.</li>
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