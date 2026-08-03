import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCheck, HiOutlineHome, HiSparkles } from 'react-icons/hi';
import axios from 'axios';
import { serverUrl } from '../App';

function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('Pro');
  const [loadingPlan, setLoadingPlan] = useState(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      credits: 50,
      priceAmount: 499,
      price: '₹499',
      description: 'Perfect for beginners looking to try out AI interview practice.',
      features: [
        '50 AI Interview Credits',
        'Basic Performance Reports',
        'Standard Question Bank',
        'Email Support',
      ],
      default: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      credits: 200,
      priceAmount: 1499,
      price: '₹1,499',
      description: 'Ideal for job seekers wanting comprehensive practice sessions.',
      features: [
        '200 AI Interview Credits',
        'Detailed Skill Breakdown & Analytics',
        'Advanced Technical & Behavioral Questions',
        'Priority AI Feedback & Scoring',
        'PDF Report Downloads',
      ],
      default: true,
    },
    {
      id: 'enterprise',
      name: 'Unlimited',
      credits: 9999, // Numeric representation for backend credits addition
      priceAmount: 3999,
      price: '₹3,999',
      description: 'Designed for intensive preparation and multi-role mastery.',
      features: [
        'Unlimited AI Interview Credits',
        'Real-time Audio & Video Analysis',
        'Custom Job Description Tailoring',
        '1-on-1 AI Strategy Coaching',
        '24/7 Dedicated Support',
      ],
      default: false,
    },
  ];

  // Helper function to dynamically load Razorpay script if not present in index.html
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyCredits = async (plan) => {
  try {
    setLoadingPlan(plan.id);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert('Razorpay SDK failed to load. Check your internet connection.');
      setLoadingPlan(null);
      return;
    }

    const token = localStorage.getItem('token'); // Fallback if using Bearer token

    // 1. Call backend to create Razorpay Order
    const { data } = await axios.post(
      `${serverUrl}/api/payment/create-order`,
      {
        planId: plan.id,
        amount: plan.priceAmount,
        credits: plan.credits,
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true, // MUST be inside the 3rd argument (config object)
      }
    );

    if (!data.success) {
      alert('Failed to initiate order. Please try again.');
      setLoadingPlan(null);
      return;
    }

    // 2. Configure Razorpay Modal Options
    const options = {
      key: data.key,
      amount: data.order.amount,
      currency: data.order.currency,
      name: 'Interview Agent',
      description: `Purchase ${plan.name} Plan (${plan.credits} Credits)`,
      order_id: data.order.id,
      handler: async (response) => {
        try {
          // 3. Send signature verification to backend
          const verifyRes = await axios.post(
            `${serverUrl}/api/payment/verify-order`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              withCredentials: true, // Fixed config placement here as well
            }
          );

          if (verifyRes.data.success) {
            alert('🎉 Payment successful! Credits added to your account.');
            navigate('/dashboard');
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        } catch (err) {
          console.error('Verification error:', err);
          alert('Error verifying payment.');
        }
      },
      theme: {
        color: '#06b6d4',
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  } catch (error) {
    console.error('Checkout error:', error);
    alert(error.response?.data?.message || 'Something went wrong during checkout.');
  } finally {
    setLoadingPlan(null);
  }
};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Choose Your Plan</h1>
            <p className="text-sm text-slate-400 mt-1">
              Select a credit package in INR (₹) that suits your interview preparation goals.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-all shadow-md self-start sm:self-auto"
          >
            <HiOutlineHome className="text-base" /> Back to Home
          </button>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.name;
            const isLoading = loadingPlan === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.name)}
                className={`relative flex flex-col justify-between p-8 rounded-3xl transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-950/40 transform -translate-y-1'
                    : 'bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                {/* Default/Popular Badge */}
                {plan.default && (
                  <span className="absolute -top-3.5 right-6 inline-flex items-center gap-1 bg-cyan-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                    <HiSparkles /> Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  {/* Plan Name & Price */}
                  <div>
                    <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                    <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400 font-medium">/ one-time</span>
                  </div>

                  {/* Credits Highlight */}
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs font-semibold text-cyan-400">
                    {plan.id === 'enterprise' ? 'Unlimited Interview Credits' : `${plan.credits} Interview Credits`}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 pt-2 text-xs text-slate-300">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <HiCheck className="text-cyan-400 text-base shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Buy Credits CTA Button */}
                <button
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyCredits(plan);
                  }}
                  className={`mt-8 w-full py-3 px-4 rounded-xl font-semibold text-xs transition-all shadow-lg flex justify-center items-center gap-2 ${
                    isSelected
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-950/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Processing...' : `Buy ${plan.id === 'enterprise' ? 'Unlimited' : plan.credits} Credits`}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Pricing;