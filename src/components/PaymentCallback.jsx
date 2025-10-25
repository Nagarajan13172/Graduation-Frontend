import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { API_BASE } from '../api';
import Header from './Header';

export default function PaymentCallback() {
  const navigate = useNavigate();
  const [statusMsg, setStatusMsg] = useState('Verifying payment...');

  useEffect(() => {
    const verify = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const orderid = params.get('orderid') || params.get('orderId') || params.get('order');
        const transaction_response = params.get('transaction_response') || params.get('trx') || params.get('rdata');

        if (!orderid && !transaction_response) {
          setStatusMsg('No order information found in callback URL.');
          setTimeout(() => navigate('/cancel'), 3000);
          return;
        }

        const payload = { orderid };
        if (transaction_response) payload.transaction_response = transaction_response;

        const res = await axios.post(`${API_BASE}/verify-payment`, payload, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (res.data && res.data.success && (res.data.status === 'success' || res.data.auth_status === '0300')) {
          setStatusMsg('Payment verified successfully. Redirecting...');
          setTimeout(() => navigate('/success'), 1200);
        } else {
          setStatusMsg('Payment failed or pending. Redirecting to cancellation page...');
          setTimeout(() => navigate('/cancel'), 1200);
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setStatusMsg('Verification failed. Redirecting to cancellation page...');
        setTimeout(() => navigate('/cancel'), 2000);
      }
    };

    verify();
  }, [navigate]);

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4">Payment Callback</h2>
          <p>{statusMsg}</p>
        </div>
      </div>
    </>
  );
}
