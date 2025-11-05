import { motion } from 'framer-motion';
import { FaCheckCircle, FaPrint } from 'react-icons/fa';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router';
import axios from 'axios';
import { API_BASE } from '../api';
import Header from './Header';

export default function Success() {
  const [searchParams] = useSearchParams();
  const [studentData, setStudentData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const formPrintRef = useRef(null);
  const receiptPrintRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderid = searchParams.get('orderid') || searchParams.get('order');

        if (orderid) {
          // Fetch student and payment data using the /orders/:orderid endpoint
          const response = await axios.get(`${API_BASE}/orders/${orderid}`);

          if (response.data && response.data.success) {
            const data = response.data;

            // Map API response to studentData format
            setStudentData({
              id: data.metadata.student_id,
              full_name: data.personal_info.full_name,
              date_of_birth: data.personal_info.date_of_birth,
              gender: data.personal_info.gender,
              guardian_name: data.personal_info.guardian_name,
              nationality: data.personal_info.nationality,
              religion: data.personal_info.religion,
              email: data.personal_info.email,
              mobile_number: data.personal_info.mobile_number,
              place_of_birth: data.personal_info.place_of_birth,
              community: data.personal_info.community,
              mother_tongue: data.personal_info.mother_tongue,
              aadhar_number: data.personal_info.aadhar_number,
              degree_name: data.academic_info.degree_name,
              university_name: data.academic_info.university_name,
              degree_pattern: data.academic_info.degree_pattern,
              convocation_year: data.academic_info.convocation_year,
              is_registered_graduate: data.academic_info.is_registered_graduate,
              occupation: data.additional_info.occupation,
              address: data.additional_info.address,
              lunch_required: data.additional_info.lunch_required,
              companion_option: data.additional_info.companion_option,
              billdesk_order_id: data.transaction_info.bdorderid,
              billdesk_transaction_id: data.transaction_info.transaction_id,
              payment_amount: data.transaction_info.payment_amount,
              payment_status: data.transaction_info.payment_status,
              created_at: data.metadata.created_at
            });

            // Map API response to paymentData format
            setPaymentData({
              orderid: data.orderid,
              transactionid: data.transaction_info.transaction_id,
              amount: data.transaction_info.payment_amount,
              status: data.transaction_info.payment_status,
              transaction_date: data.transaction_info.payment_date || data.metadata.created_at,
              payment_method_type: data.transaction_info.payment_method_type,
              payment_bank_ref: data.transaction_info.payment_bank_ref,
              receipt_number: data.transaction_info.receipt_number,
              bdorderid: data.transaction_info.bdorderid
            });
          }
        } else {
          console.warn('No orderid found in URL parameters');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Unable to fetch registration details. Please contact support with your order ID.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handlePrintForm = () => {
    const printWindow = window.open('', '_blank');
    const content = formPrintRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Registration Form - ${studentData?.full_name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 10px;
              color: #059669;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .field {
              display: flex;
              margin-bottom: 8px;
            }
            .field-label {
              font-weight: bold;
              width: 200px;
              color: #555;
            }
            .field-value {
              flex: 1;
            }
            @media print {
              body { margin: 0; padding: 15px; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    const content = receiptPrintRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${paymentData?.orderid}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: Arial, sans-serif; 
              padding: 15px; 
              line-height: 1.3;
              font-size: 13px;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 15px;
              border: 2px solid #059669;
              padding: 12px;
              background-color: #f0fdf4;
            }
            .receipt-header h1 {
              font-size: 20px;
              margin-bottom: 5px;
            }
            .receipt-header h2 {
              font-size: 16px;
            }
            .receipt-body {
              border: 1px solid #ddd;
              padding: 12px;
            }
            .receipt-field {
              display: flex;
              margin-bottom: 6px;
              padding: 5px;
              border-bottom: 1px solid #eee;
            }
            .receipt-label {
              font-weight: bold;
              width: 160px;
              color: #555;
              font-size: 13px;
            }
            .receipt-value {
              flex: 1;
              color: #000;
              font-size: 13px;
            }
            .amount {
              font-size: 18px;
              font-weight: bold;
              color: #059669;
            }
            .amount-box {
              margin-top: 12px;
              padding: 12px;
              background-color: #f0fdf4;
            }
            .footer {
              margin-top: 15px;
              text-align: center;
              font-size: 11px;
              color: #666;
              line-height: 1.4;
            }
            .footer p {
              margin-bottom: 3px;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 10px; 
              }
              @page {
                size: A4;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-emerald-200 to-teal-200 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border-4 border-emerald-500/75 text-center mb-8"
          >
            <FaCheckCircle className="text-6xl text-emerald-600 mx-auto mb-4" />
            <h1 className="text-3xl font-inter font-extrabold text-emerald-900 mb-4">Payment Successful!</h1>
            <p className="text-lg font-poppins text-gray-800">Your registration has been completed. You will receive a confirmation soon.</p>
          </motion.div>

          {/* Print Buttons */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center text-emerald-900 text-xl font-semibold mb-8"
            >
              Loading your details...
            </motion.div>
          )}

          {!loading && studentData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <button
                onClick={handlePrintForm}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <FaPrint className="text-xl" /> Print Registration Form
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <FaPrint className="text-xl" /> Print Payment Receipt
              </button>
            </motion.div>
          )}

          {!loading && !studentData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg text-center mb-8"
            >
              <p className="font-semibold">Unable to load registration details.</p>
              <p className="text-sm mt-2">Please save your Order ID and contact support if needed.</p>
            </motion.div>
          )}

          {/* Hidden Print Content - Registration Form */}
          {studentData && (
            <div ref={formPrintRef} style={{ display: 'none' }}>
              <div className="header">
                <h1>Graduation Registration Form</h1>
                <p><strong>Application ID:</strong> {studentData.id}</p>
              </div>

              <div className="section">
                <div className="section-title">Personal Information</div>
                <div className="field">
                  <span className="field-label">Full Name:</span>
                  <span className="field-value">{studentData.full_name}</span>
                </div>
                <div className="field">
                  <span className="field-label">Date of Birth:</span>
                  <span className="field-value">{studentData.date_of_birth}</span>
                </div>
                <div className="field">
                  <span className="field-label">Gender:</span>
                  <span className="field-value">{studentData.gender}</span>
                </div>
                <div className="field">
                  <span className="field-label">Guardian Name:</span>
                  <span className="field-value">{studentData.guardian_name}</span>
                </div>
                <div className="field">
                  <span className="field-label">Nationality:</span>
                  <span className="field-value">{studentData.nationality}</span>
                </div>
                <div className="field">
                  <span className="field-label">Religion:</span>
                  <span className="field-value">{studentData.religion}</span>
                </div>
                <div className="field">
                  <span className="field-label">Place of Birth:</span>
                  <span className="field-value">{studentData.place_of_birth}</span>
                </div>
                <div className="field">
                  <span className="field-label">Community:</span>
                  <span className="field-value">{studentData.community}</span>
                </div>
                <div className="field">
                  <span className="field-label">Mother Tongue:</span>
                  <span className="field-value">{studentData.mother_tongue}</span>
                </div>
              </div>

              <div className="section">
                <div className="section-title">Contact Information</div>
                <div className="field">
                  <span className="field-label">Email:</span>
                  <span className="field-value">{studentData.email || 'N/A'}</span>
                </div>
                <div className="field">
                  <span className="field-label">Mobile Number:</span>
                  <span className="field-value">{studentData.mobile_number}</span>
                </div>
                <div className="field">
                  <span className="field-label">Address:</span>
                  <span className="field-value">{studentData.address}</span>
                </div>
              </div>

              <div className="section">
                <div className="section-title">Educational Details</div>
                <div className="field">
                  <span className="field-label">Degree Name:</span>
                  <span className="field-value">{studentData.degree_name}</span>
                </div>
                <div className="field">
                  <span className="field-label">University Name:</span>
                  <span className="field-value">{studentData.university_name}</span>
                </div>
                <div className="field">
                  <span className="field-label">Degree Pattern:</span>
                  <span className="field-value">{studentData.degree_pattern}</span>
                </div>
                <div className="field">
                  <span className="field-label">Convocation Year:</span>
                  <span className="field-value">{studentData.convocation_year}</span>
                </div>
                <div className="field">
                  <span className="field-label">Registered Graduate:</span>
                  <span className="field-value">{studentData.is_registered_graduate ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="section">
                <div className="section-title">Other Details</div>
                <div className="field">
                  <span className="field-label">Aadhar Number:</span>
                  <span className="field-value">{studentData.aadhar_number}</span>
                </div>
                <div className="field">
                  <span className="field-label">Occupation:</span>
                  <span className="field-value">{studentData.occupation}</span>
                </div>
                <div className="field">
                  <span className="field-label">Lunch Preference:</span>
                  <span className="field-value">{studentData.lunch_required}</span>
                </div>
                <div className="field">
                  <span className="field-label">Companion Option:</span>
                  <span className="field-value">{studentData.companion_option}</span>
                </div>
              </div>

              <div className="section">
                <div className="section-title">Registration Date</div>
                <div className="field">
                  <span className="field-label">Registered On:</span>
                  <span className="field-value">{formatDate(studentData.created_at)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Print Content - Payment Receipt */}
          {paymentData && studentData && (
            <div ref={receiptPrintRef} style={{ display: 'none' }}>
              <div className="receipt-header">
                <h1>Payment Receipt</h1>
                <h2>Graduation Registration</h2>
              </div>

              <div className="receipt-body">
                <div className="receipt-field">
                  <span className="receipt-label">Receipt Date:</span>
                  <span className="receipt-value">{formatDate(paymentData.transaction_date)}</span>
                </div>
                <div className="receipt-field">
                  <span className="receipt-label">Student Name:</span>
                  <span className="receipt-value">{studentData.full_name}</span>
                </div>
                <div className="receipt-field">
                  <span className="receipt-label">Application ID:</span>
                  <span className="receipt-value">{studentData.id}</span>
                </div>
                <div className="receipt-field">
                  <span className="receipt-label">Order ID:</span>
                  <span className="receipt-value">{paymentData.orderid}</span>
                </div>
                {paymentData.bdorderid && (
                  <div className="receipt-field">
                    <span className="receipt-label">BillDesk Order ID:</span>
                    <span className="receipt-value">{paymentData.bdorderid}</span>
                  </div>
                )}
                <div className="receipt-field">
                  <span className="receipt-label">Transaction ID:</span>
                  <span className="receipt-value">{paymentData.transactionid || studentData.billdesk_transaction_id || 'N/A'}</span>
                </div>
                {paymentData.payment_bank_ref && (
                  <div className="receipt-field">
                    <span className="receipt-label">Bank Reference:</span>
                    <span className="receipt-value">{paymentData.payment_bank_ref}</span>
                  </div>
                )}
                {paymentData.receipt_number && (
                  <div className="receipt-field">
                    <span className="receipt-label">Receipt Number:</span>
                    <span className="receipt-value">{paymentData.receipt_number}</span>
                  </div>
                )}
                <div className="receipt-field">
                  <span className="receipt-label">Payment Status:</span>
                  <span className="receipt-value" style={{ color: '#059669', fontWeight: 'bold' }}>
                    {(paymentData.status || studentData.payment_status || '').toUpperCase()}
                  </span>
                </div>
                <div className="receipt-field">
                  <span className="receipt-label">Payment Method:</span>
                  <span className="receipt-value">{paymentData.payment_method_type || 'Online Payment'}</span>
                </div>
                <div className="receipt-field amount-box">
                  <span className="receipt-label">Amount Paid:</span>
                  <span className="receipt-value amount">₹ {paymentData.amount || studentData.payment_amount || '0.00'}</span>
                </div>
              </div>

              <div className="footer">
                <p>This is a computer-generated receipt and does not require a signature.</p>
                <p>For any queries, please contact the registration office.</p>
                <p><strong>Date of Print:</strong> {new Date().toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}