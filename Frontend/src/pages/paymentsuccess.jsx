import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ShoppingBag } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const hasVerified = useRef(false);

  const pidx = searchParams.get('pidx');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyPayment = async () => {
      try {
        const storedOrderId = sessionStorage.getItem('pendingOrderId');
        const finalOrderId = orderId || storedOrderId;

        const { data } = await api.post('/payment/verify', {
          pidx,
          orderId: finalOrderId
        });

        if (data.success) {
          setStatus('success');
          setMessage('Payment completed successfully!');
          setOrderDetails(data.order);
          success('Payment successful! Your order has been confirmed.');

          sessionStorage.removeItem('pendingOrderId');

          let countdown = 5;
          const interval = setInterval(() => {
            countdown -= 1;
            setRedirectCountdown(countdown);
            if (countdown === 0) {
              clearInterval(interval);
              navigate('/orders');
            }
          }, 1000);

        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment verification failed. Please contact support.');
          toastError('Payment verification failed');
          setTimeout(() => navigate('/cart'), 5000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('failed');
        setMessage(
          error.response?.data?.message ||
          'An error occurred during payment verification.'
        );
        toastError('Error verifying payment');
        setTimeout(() => navigate('/cart'), 5000);
      }
    };

    if (pidx) {
      verifyPayment();
    } else {
      setStatus('failed');
      setMessage('Invalid payment session.');
      setTimeout(() => navigate('/cart'), 5000);
    }
  }, [pidx, orderId, success, toastError, navigate]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 sm:px-6 lg:px-10 xl:px-16 py-12">
      <div className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full text-center border border-orange-100 shadow-soft">

        {/* VERIFYING */}
        {status === 'verifying' && (
          <div>
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
            </div>
            <p className="eyebrow mb-2">Please wait</p>
            <h2 className="text-2xl font-bold text-[#3D1A00] mb-2">Verifying payment...</h2>
            <p className="text-[#7A6A5A] text-sm">Please wait while we confirm your payment.</p>
            <div className="mt-6 w-full bg-orange-100 h-1 rounded-full overflow-hidden">
              <div className="bg-orange-600 h-full rounded-full animate-progress"></div>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {status === 'success' && (
          <div className="animate-scale-in">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <p className="eyebrow mb-2">Order confirmed</p>
            <h2 className="text-3xl font-bold text-[#3D1A00] mb-2">Payment successful!</h2>
            <p className="text-[#7A6A5A] text-sm mb-6">{message}</p>

            {orderDetails && (
              <div className="mb-6 p-5 bg-[#FFF4E6] rounded-2xl border border-orange-100 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">Order</span>
                  <span className="text-sm font-bold text-[#3D1A00]">
                    #{orderDetails.orderNumber || orderDetails._id?.slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">Total</span>
                  <span className="text-lg font-bold text-orange-600">
                    रु{orderDetails.totalAmount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">Payment</span>
                  <span className="text-sm font-semibold text-[#3D1A00]">
                    {orderDetails.paymentMethod}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-sm text-blue-700 mb-2">
                  Redirecting to orders in <strong>{redirectCountdown}</strong> seconds...
                </p>
                <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(redirectCountdown / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => navigate('/orders')}
                className="w-full bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-orange-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                <ShoppingBag size={20} />
                View my orders
              </button>

              <button
                onClick={() => navigate('/products')}
                className="w-full bg-cream border border-orange-200 text-[#3D1A00] px-8 py-3.5 rounded-full font-semibold hover:bg-orange-50 transition-all"
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}

        {/* FAILED */}
        {status === 'failed' && (
          <div className="animate-scale-in">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>

            <p className="eyebrow mb-2" style={{ color: '#DC2626' }}>Something went wrong</p>
            <h2 className="text-3xl font-bold text-[#3D1A00] mb-2">Payment failed</h2>
            <p className="text-[#7A6A5A] text-sm mb-6">{message}</p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/cart')}
                className="w-full bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20"
              >
                Return to cart
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-cream border border-orange-200 text-[#3D1A00] px-8 py-3.5 rounded-full font-semibold hover:bg-orange-50 transition-all"
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .animate-scale-in { animation: scale-in 0.5s ease-out; }
        .animate-progress { animation: progress 3s ease-in-out forwards; }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;