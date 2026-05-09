import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, CheckCircle, Tag, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';

const Checkout = () => {
  const { id } = useParams(); // Course ID
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [course, setCourse] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Extract selected batch from navigation state
  const selectedBatch = location.state?.batchId;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedBatch) {
      navigate(`/course/${id}`); // Redirect back if no batch selected
      return;
    }

    const fetchCourse = async () => {
      try {
        const res = await api.get(`lms/courses/${id}/`);
        setCourse(res.data);
      } catch (err) {
        setError("Failed to load course details.");
      }
    };
    fetchCourse();
  }, [id, selectedBatch, navigate, user]);

  const handleApplyPromo = async () => {
    // In a real app, this would hit an API endpoint to validate the promo code.
    // Simulating with a hardcoded code for now.
    if (promoCode === 'OSTAD10' || promoCode === 'LMS2026') {
      setDiscount(10); // 10% discount
      setError('');
    } else {
      setError('Invalid or expired promo code.');
      setDiscount(0);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    
    // Calculate final amount
    const finalAmount = course.price - (course.price * (discount / 100));

    try {
      // 1. Create Transaction record
      await api.post('payments/transactions/', {
        course: course.id,
        batch: selectedBatch,
        amount: finalAmount,
        payment_method: paymentMethod,
        transaction_id: `TXN-${Math.floor(Math.random() * 1000000)}`,
        status: 'completed'
      });

      // 2. Create Enrollment
      await api.post('lms/enrollments/', {
        course: course.id,
        batch: selectedBatch
      });

      // Successful Enrollment
      navigate('/profile');
    } catch (err) {
      setError('Payment failed or you are already enrolled in this batch.');
    } finally {
      setProcessing(false);
    }
  };

  if (!course) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>Preparing your checkout...</div>
    </div>
  );

  const discountAmount = (course.price * (discount / 100)).toFixed(2);
  const finalPrice = (course.price - parseFloat(discountAmount)).toFixed(2);

  return (
    <div className="animate-fade-in" style={{ padding: '40px 20px', background: '#f8fafc', minHeight: '90vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '30px', fontWeight: '600' }}>
          <ArrowLeft size={18} /> Back to Course
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start' }}>
          
          {/* Main Checkout Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Enrollment Summary */}
            <div className="glass-card" style={{ padding: '30px', borderRadius: '24px', background: 'white' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <ShieldCheck color="var(--accent-primary)" /> Enrollment Summary
              </h2>
              
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '25px', padding: '15px', background: '#f1f5f9', borderRadius: '16px' }}>
                 <div style={{ width: '100px', height: '65px', borderRadius: '10px', overflow: 'hidden' }}>
                   <img src={course.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 </div>
                 <div>
                   <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{course.title}</h3>
                   <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Batch ID: {selectedBatch}</div>
                 </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Course Price</span>
                  <span>৳{course.price}</span>
                </div>
                
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: '600' }}>
                    <span>Promo Discount ({discount}%)</span>
                    <span>-৳{discountAmount}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.4rem', borderTop: '2px solid #f1f5f9', paddingTop: '15px', marginTop: '5px', color: 'var(--accent-primary)' }}>
                  <span>Final Total</span>
                  <span>৳{finalPrice}</span>
                </div>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="glass-card" style={{ padding: '25px', borderRadius: '20px', background: 'white' }}>
               <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <Tag size={18} color="var(--accent-primary)" /> Have a Promo Code?
               </h3>
               <div style={{ display: 'flex', gap: '12px' }}>
                 <input 
                   type="text" 
                   placeholder="Enter Code (e.g. OSTAD10)" 
                   value={promoCode} 
                   onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                   style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                 />
                 <button onClick={handleApplyPromo} className="btn-primary" style={{ padding: '0 25px', borderRadius: '12px' }}>Apply</button>
               </div>
               {discount > 0 && <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '10px', fontWeight: '600' }}>✓ Code applied successfully!</div>}
               {error && <div style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '10px' }}>{error}</div>}
            </div>

          </div>

          {/* Payment & Action Sidebar */}
          <aside style={{ position: 'sticky', top: '40px' }}>
            <div className="glass-card" style={{ padding: '30px', borderRadius: '24px', background: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
               <h2 style={{ fontSize: '1.4rem', marginBottom: '25px' }}>Payment Method</h2>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                 {['card', 'bkash', 'nagad', 'stripe'].map(method => (
                   <label key={method} style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'space-between',
                     padding: '16px', 
                     borderRadius: '14px', 
                     border: '2px solid',
                     borderColor: paymentMethod === method ? 'var(--accent-primary)' : '#f1f5f9',
                     background: paymentMethod === method ? 'rgba(99, 102, 241, 0.05)' : 'white',
                     cursor: 'pointer',
                     transition: 'all 0.2s'
                   }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value={method} 
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span style={{ fontWeight: '700', textTransform: 'capitalize', fontSize: '1rem' }}>
                          {method === 'card' ? 'Credit / Debit Card' : method}
                        </span>
                     </div>
                     {method === 'card' ? <CreditCard size={20} color="#94a3b8" /> : <div style={{ width: '20px', height: '20px', background: '#f1f5f9', borderRadius: '4px' }} />}
                   </label>
                 ))}
               </div>

               <button 
                 onClick={handlePayment} 
                 className="btn-primary" 
                 disabled={processing}
                 style={{ 
                   width: '100%', 
                   padding: '20px', 
                   fontSize: '1.2rem', 
                   borderRadius: '16px',
                   background: 'var(--success)',
                   boxShadow: '0 10px 20px rgba(34, 197, 94, 0.2)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '12px'
                 }}
               >
                 {processing ? 'Confirming...' : <><Zap size={20} fill="white" /> Complete Enrollment</>}
               </button>

               <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.8rem', justifyContent: 'center' }}>
                  <ShieldCheck size={16} /> 100% Secure Transaction
               </div>
            </div>
            
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', marginTop: '20px', lineHeight: '1.5' }}>
              Your enrollment will be activated instantly after successful payment. You will receive an email confirmation.
            </p>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
