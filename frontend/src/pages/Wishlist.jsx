import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Heart, ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StudentSidebar from '../components/StudentSidebar';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('lms/wishlists/');
        setWishlist(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const removeWishlist = async (id) => {
    try {
      await api.delete(`lms/wishlists/${id}/`);
      setWishlist(wishlist.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading wishlist...</div>;

  return (
    <DashboardLayout sidebar={<StudentSidebar user={user} />}>
      <div style={{ padding: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>My Wishlist</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '40px' }}>Courses you have saved for later.</p>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
            <Heart size={48} color="#94a3b8" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ color: '#0f172a' }}>Your Wishlist is Empty</h3>
            <p style={{ color: '#64748b' }}>Explore our courses and hit the heart icon to save them here.</p>
            <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', borderRadius: '10px' }}>Browse Courses</Link>
          </div>
        ) : (
          <div className="grid grid-cols-3" style={{ gap: '20px' }}>
            {wishlist.map(item => (
              <div key={item.id} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '150px', width: '100%', position: 'relative' }}>
                  <img src={item.course_details.thumbnail || 'https://via.placeholder.com/400x225'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.course_details.title} />
                  <button 
                    onClick={() => removeWishlist(item.id)}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: '#ef4444' }}
                  >
                    <Heart size={18} fill="#ef4444" />
                  </button>
                </div>
                <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', marginBottom: '15px', flex: 1 }}>{item.course_details.title}</h3>
                  <Link to={`/course/${item.course_details.id}`} className="btn-primary" style={{ width: '100%', padding: '10px', borderRadius: '10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: '800' }}>
                    View Course <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Wishlist;
