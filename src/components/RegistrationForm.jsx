import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhone, FaEnvelope, FaGraduationCap, FaVenusMars, FaHome, FaBriefcase, FaUser, FaInfoCircle, FaCheckCircle, FaCamera, FaIdCard, FaFileAlt, FaSignature } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { API_BASE, RU } from '../api';
import { useSearchParams } from 'react-router';
import Header from './Header';
import PayDemo from './PayDemo';

const DEGREE_OPTIONS = ['UG', 'PG'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const COMMUNITY_OPTIONS = ['OC', 'BC', 'SC', 'ST', 'MBC'];
const DISTRICT_OPTIONS = ['Dharmapuri', 'Krishnagiri', 'Namakkal', 'Salem'];

// Zod validation schema
const formSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').trim(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  guardian_name: z.string().min(1, 'Guardian name is required').trim(),
  nationality: z.string().min(1, 'Nationality is required').trim(),
  religion: z.string().min(1, 'Religion is required').trim(),
  email: z.string().email('Invalid email format').or(z.literal('')),
  mobile_number: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
  place_of_birth: z.string().min(1, 'Place of birth is required'),
  community: z.string().min(1, 'Community is required'),
  mother_tongue: z.string().min(1, 'Mother tongue is required').trim(),
  applicant_photo: z.instanceof(FileList).refine((files) => files?.length > 0, 'Applicant photo is required'),
  aadhar_number: z.string().regex(/^\d{12}$/, 'Aadhar number must be 12 digits'),
  aadhar_copy: z.instanceof(FileList).refine((files) => files?.length > 0, 'Aadhar copy is required'),
  residence_certificate: z.instanceof(FileList).refine((files) => files?.length > 0, 'Residence certificate is required'),
  degree_name: z.string().min(1, 'Degree name is required').trim(),
  university_name: z.string().min(1, 'University name is required').trim(),
  degree_pattern: z.string().min(1, 'Degree pattern is required').trim(),
  convocation_year: z.string().min(1, 'Convocation year is required').trim(),
  degree_certificate: z.instanceof(FileList).refine((files) => files?.length > 0, 'Degree certificate is required'),
  is_registered_graduate: z.preprocess((val) => {
    if (typeof val === 'string') return parseInt(val, 10);
    if (typeof val === 'number') return val;
    return undefined;
  }, z.number().int().min(0).max(1)),
  other_university_certificate: z.union([
    z.instanceof(FileList),
    z.undefined()
  ]).superRefine((val, ctx) => {
    const formData = ctx.parent;
    const isRegisteredGraduate = formData &&
      (formData.is_registered_graduate === 1 || formData.is_registered_graduate === '1');

    if (isRegisteredGraduate && (!val || val.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Other university certificate is required when registered with another university"
      });
    }
  }),
  occupation: z.string().min(1, 'Occupation is required').trim(),
  address: z.string().min(1, 'Address is required').trim(),
  signature: z.instanceof(FileList).refine((files) => files?.length > 0, 'Signature is required'),
  declaration: z.boolean().refine((val) => val === true, 'You must accept the declaration'),
});

export default function GraduationRegistrationForm() {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const formRef = useRef(null);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderid');

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
      aadhar_number: '',
      degree_name: '',
      university_name: '',
      degree_pattern: '',
      convocation_year: '',
      is_registered_graduate: '0',
      occupation: '',
      address: '',
      declaration: false,
    },
  });

  const isRegisteredGraduate = watch('is_registered_graduate');

  // Fetch student data when orderId is present
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!orderId) return;

      try {
        const response = await axios.get(`${RU}/api/payment/student/${orderId}`);
        if (response.data.success) {
          setStudentData(response.data.data);

          // Pre-fill the form with the fetched data
          const data = response.data.data;
          reset({
            full_name: data.full_name,
            date_of_birth: data.date_of_birth,
            gender: data.gender,
            guardian_name: data.guardian_name,
            nationality: data.nationality,
            religion: data.religion,
            email: data.email,
            mobile_number: data.mobile_number,
            place_of_birth: data.place_of_birth,
            community: data.community,
            mother_tongue: data.mother_tongue,
            aadhar_number: data.aadhar_number,
            degree_name: data.degree_name,
            university_name: data.university_name,
            degree_pattern: data.degree_pattern,
            convocation_year: data.convocation_year,
            is_registered_graduate: String(data.is_registered_graduate),
            occupation: data.occupation,
            address: data.address,
            declaration: Boolean(data.declaration)
          });

          // Show payment status toast
          if (data.payment_status === 'failed') {
            toast.error(
              `Payment failed: ${data.payment_error_desc || 'Unknown error'}. Please try again.`,
              { duration: 5000 }
            );
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        toast.error('Failed to load previous registration data');
      }
    };

    fetchStudentData();
  }, [orderId, reset]);

  // Debug: Watch form values
  useEffect(() => {
    const subscription = watch((value) => {
      console.log('📝 Form values updated:', value);
      window.debugFormData = value;
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data) => {
    console.log('🚀 Form submitted with data:', data);

    try {
      const formData = new FormData();

      // Append text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof FileList) {
          // Append file fields
          if (value.length > 0) {
            formData.append(key, value[0]);
          }
        } else if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      // Debug: Log what's being sent
      console.log('📤 FormData being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
      }

      // First save the registration data
      const registerResponse = await axios.post(`${API_BASE}/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const registrationId = registerResponse.data.id;

      // Use existing orderid if available (from failed payment)
      const orderid = studentData?.orderid || orderId || ((typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID().replace(/-/g, '').toUpperCase()
        : 'PU' + Math.random().toString(36).slice(2, 12).toUpperCase());

      const paymentResponse = await fetch(`${API_BASE}/billdesk/orders`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orderid,
          amount: "50.00",
          currency: "356", // INR
          ru: `${RU}` + "/api/payment/callback",
          itemcode: "DIRECT",
          additional_info: {
            purpose: "Application Fee",
            registrationId: registrationId // Pass the registration ID to link payment
          }
        })
      });

      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok) throw new Error(paymentData?.error || "Payment initiation failed");

      const bdorderid = paymentData.bdorderid || paymentData.orderid || paymentData?.data?.bdorderid;
      const rdataFromLinksArray = Array.isArray(paymentData?.links)
        ? (paymentData.links.find(l => l?.parameters?.rdata)?.parameters?.rdata)
        : undefined;
      const rdata = paymentData?.rdata || rdataFromLinksArray;

      if (!bdorderid || !rdata) throw new Error("Missing bdorderid/rdata in response");

      // Redirect to payment
      const params = new URLSearchParams({ bdorderid, rdata });
      window.location.href = `${API_BASE}/billdesk/launch?${params.toString()}`;

    } catch (err) {
      console.error('❌ Registration/Payment error:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.error || 'Registration/Payment process failed', { id: 'register-error' });
    }
  };

  const onError = (errors) => {
    console.log('❌ Form validation errors:', errors);
    toast.error('Please fill in all required fields correctly', { id: 'validation-error' });

    // Scroll to first error
    const firstErrorField = Object.keys(errors)[0];
    const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      errorElement.focus();
    }
  };

  return (
    <div>
      {studentData && studentData.payment_status === 'failed' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your previous payment was unsuccessful. You can retry the payment with your existing registration information.
                {studentData.payment_error_desc && (
                  <span className="block mt-1">
                    Error: {studentData.payment_error_desc}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
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
      <div className="min-h-screen bg-gray-200 relative overflow-hidden pt-24 sm:pt-28 md:pt-32 lg:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap');
            .font-inter { font-family: 'Inter', sans-serif; }
            .font-poppins { font-family: 'Poppins', sans-serif; }
            .shadow-text { text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
            .card-modern {
              position: relative;
              overflow: hidden;
              transition: all 0.3s ease;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border-radius: 16px;
              background: #ffffff;
            }
            @media (max-width: 640px) {
              .card-modern {
                border-radius: 12px;
              }
            }
            .card-modern:hover {
              box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            }
            .card-border-blue {
              border: 2px solid #E5E7EB;
            }
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
            }
            .modal-content {
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
              border: 2px solid #E5E7EB;
              max-width: 600px;
              width: 90%;
              max-height: 80vh;
              overflow-y: auto;
              position: relative;
              padding: 1.5rem;
            }
            @media (min-width: 640px) {
              .modal-content {
                border-radius: 16px;
                padding: 2rem;
              }
            }
            .modal-close {
              position: absolute;
              top: 12px;
              right: 12px;
              background: #EF4444;
              color: white;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            @media (min-width: 640px) {
              .modal-close {
                top: 16px;
                right: 16px;
                width: 36px;
                height: 36px;
              }
            }
            .modal-close:hover {
              background: #DC2626;
            }
          `}
        </style>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-inter font-extrabold text-blue-900 text-center mb-6 sm:mb-8 lg:mb-12 tracking-tight shadow-text px-4"
        >
          Graduate Registration Form
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="max-w-7xl mx-auto relative z-10"
        >
          <motion.div
            className="card-modern card-border-blue p-4 sm:p-6 lg:p-10 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.button
              onClick={() => setShowGuidelines(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-blue-600 text-white rounded-full p-2 sm:p-3 shadow-md hover:shadow-lg hover:bg-blue-700 transition-all duration-200 z-10"
            >
              <FaInfoCircle className="text-lg sm:text-xl" />
            </motion.button>
            <motion.h2
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl sm:text-2xl lg:text-3xl font-inter font-extrabold text-blue-900 mb-6 sm:mb-8 flex items-center gap-2 sm:gap-4"
            >
              <FaGraduationCap className="text-blue-600 text-2xl sm:text-3xl" />
              Registration Details
            </motion.h2>
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <label className="flex items-center gap-2 sm:gap-3 text-blue-800 font-semibold mb-2 text-base sm:text-lg font-poppins">
                    <FaUser className="text-blue-600 text-lg sm:text-2xl flex-shrink-0" />
                    <span>Full Name (As in Degree Certificate)</span>
                  </label>
                  <input
                    type="text"
                    {...register('full_name')}
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-base sm:text-lg placeholder-gray-400/60"
                    placeholder="Enter full name"
                  />
                  {errors.full_name && <p className="text-red-600 text-sm mt-1">{errors.full_name.message}</p>}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <label className="flex items-center gap-2 sm:gap-3 text-blue-800 font-semibold mb-2 text-base sm:text-lg font-poppins">
                    <FaGraduationCap className="text-blue-600 text-lg sm:text-2xl flex-shrink-0" />
                    <span>Date of Birth</span>
                  </label>
                  <input
                    type="date"
                    {...register('date_of_birth')}
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-base sm:text-lg"
                  />
                  {errors.date_of_birth && <p className="text-red-600 text-sm mt-1">{errors.date_of_birth.message}</p>}
                </motion.div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <label className="flex items-center gap-2 sm:gap-3 text-blue-800 font-semibold mb-2 text-base sm:text-lg font-poppins">
                    <FaVenusMars className="text-blue-600 text-lg sm:text-2xl flex-shrink-0" />
                    <span>Gender</span>
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-base sm:text-lg"
                  >
                    <option value="">-- Select Gender --</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender.message}</p>}
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
                    {...register('guardian_name')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter guardian name"
                  />
                  {errors.guardian_name && <p className="text-red-600 text-sm mt-1">{errors.guardian_name.message}</p>}
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
                    {...register('nationality')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter nationality"
                  />
                  {errors.nationality && <p className="text-red-600 text-sm mt-1">{errors.nationality.message}</p>}
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
                    {...register('religion')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter religion"
                  />
                  {errors.religion && <p className="text-red-600 text-sm mt-1">{errors.religion.message}</p>}
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
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
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
                    {...register('mobile_number')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                  />
                  {errors.mobile_number && <p className="text-red-600 text-sm mt-1">{errors.mobile_number.message}</p>}
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
                    {...register('place_of_birth')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                  >
                    <option value="">-- Select District --</option>
                    {DISTRICT_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.place_of_birth && <p className="text-red-600 text-sm mt-1">{errors.place_of_birth.message}</p>}
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
                    {...register('community')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                  >
                    <option value="">-- Select Community --</option>
                    {COMMUNITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.community && <p className="text-red-600 text-sm mt-1">{errors.community.message}</p>}
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
                    {...register('mother_tongue')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter mother tongue"
                  />
                  {errors.mother_tongue && <p className="text-red-600 text-sm mt-1">{errors.mother_tongue.message}</p>}
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
                    {...register('applicant_photo')}
                    accept="image/*"
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                  />
                  {errors.applicant_photo && <p className="text-red-600 text-sm mt-1">{errors.applicant_photo.message}</p>}
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
                    {...register('aadhar_number')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter 12-digit Aadhar number"
                    maxLength="12"
                  />
                  {errors.aadhar_number && <p className="text-red-600 text-sm mt-1">{errors.aadhar_number.message}</p>}
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
                    {...register('aadhar_copy')}
                    accept="image/*,application/pdf"
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                  />
                  {errors.aadhar_copy && <p className="text-red-600 text-sm mt-1">{errors.aadhar_copy.message}</p>}
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
                    {...register('residence_certificate')}
                    accept="image/*,application/pdf"
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                  />
                  {errors.residence_certificate && <p className="text-red-600 text-sm mt-1">{errors.residence_certificate.message}</p>}
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
                    {...register('degree_name')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter degree name(s)"
                  />
                  {errors.degree_name && <p className="text-red-600 text-sm mt-1">{errors.degree_name.message}</p>}
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
                    {...register('university_name')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter university name"
                  />
                  {errors.university_name && <p className="text-red-600 text-sm mt-1">{errors.university_name.message}</p>}
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
                    {...register('degree_pattern')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter degree pattern"
                  />
                  {errors.degree_pattern && <p className="text-red-600 text-sm mt-1">{errors.degree_pattern.message}</p>}
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
                    {...register('convocation_year')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter convocation year"
                  />
                  {errors.convocation_year && <p className="text-red-600 text-sm mt-1">{errors.convocation_year.message}</p>}
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
                    {...register('degree_certificate')}
                    accept="image/*,application/pdf"
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                  />
                  {errors.degree_certificate && <p className="text-red-600 text-sm mt-1">{errors.degree_certificate.message}</p>}
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
                          {...register('is_registered_graduate')}
                          value={option === 'Yes' ? '1' : '0'}
                          className="h-5 w-5 text-blue-600 border-blue-200 focus:ring-blue-400"
                        />
                        <span className="font-poppins text-blue-900">{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.is_registered_graduate && <p className="text-red-600 text-sm mt-1">{errors.is_registered_graduate.message}</p>}
                </motion.div>
                {(isRegisteredGraduate === 1 || isRegisteredGraduate === '1') && (
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
                      {...register('other_university_certificate')}
                      accept="image/*,application/pdf"
                      className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                    />
                    {errors.other_university_certificate && <p className="text-red-600 text-sm mt-1">{errors.other_university_certificate.message}</p>}
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
                    {...register('occupation')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter current occupation"
                  />
                  {errors.occupation && <p className="text-red-600 text-sm mt-1">{errors.occupation.message}</p>}
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
                    {...register('address')}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg placeholder-gray-400/60"
                    placeholder="Enter address"
                    rows="4"
                  />
                  {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>}
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
                    {...register('signature')}
                    accept="image/*"
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border border-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-all duration-300 font-poppins text-blue-900 text-lg"
                  />
                  {errors.signature && <p className="text-red-600 text-sm mt-1">{errors.signature.message}</p>}
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 3.2 }}
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('declaration')}
                    className="h-5 w-5 text-blue-600 border-blue-200 focus:ring-blue-400"
                  />
                  <span className="font-poppins text-blue-900 text-lg">
                    I declare the above information is true to the best of my knowledge and if it is found to be untrue, my claim may be considered invalid.
                  </span>
                </label>
                {errors.declaration && <p className="text-red-600 text-sm mt-1">{errors.declaration.message}</p>}
              </motion.div>
              <PayDemo />
              <motion.button
                type="submit"
                onClick={handleSubmit(onSubmit, onError)}
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                className={`w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 sm:py-4 rounded-xl font-bold font-poppins text-base sm:text-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                <FaGraduationCap className="text-xl sm:text-2xl" />
                <span>{isSubmitting ? 'Processing...' : 'Pay and Proceed'}</span>
              </motion.button>
            </div>
          </motion.div>
          <AnimatePresence>
            {showGuidelines && (
              <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="modal-content p-8 relative"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="modal-close"
                    onClick={() => setShowGuidelines(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✕
                  </motion.div>
                  <h3 className="text-2xl sm:text-3xl font-inter font-extrabold text-blue-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-4">
                    <FaGraduationCap className="text-blue-600 text-2xl sm:text-3xl" />
                    <span>Guidelines for Graduation Registration</span>
                  </h3>
                  <div className="space-y-4 sm:space-y-6 text-blue-800 font-poppins text-sm sm:text-base lg:text-lg">
                    <h4 className="text-lg sm:text-xl font-semibold text-blue-800">Step-by-Step Form Filling Instructions:</h4>
                    <ol className="list-decimal ml-4 sm:ml-6 space-y-2 sm:space-y-4">
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