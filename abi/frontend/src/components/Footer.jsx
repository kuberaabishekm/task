import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../features/ui/uiSlice';
import { Globe, CreditCard } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();

  const handleJoinNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      dispatch(addToast({ type: 'error', message: 'Please enter a valid email address.' }));
      return;
    }
    dispatch(addToast({
      type: 'success',
      message: 'Thank you for subscribing to our Hotelier newsletter!'
    }));
    setEmail('');
  };

  return (
    <footer className="mdb-footer" aria-label="Site Footer">
      <div className="container py-5">
        <div className="row g-4">
          {/* Column 1: MDB Brand Logo & Copyright */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="MMK-footer-brand mb-3">
              <span className="brand-letter-M">M</span>
              <span className="brand-letter-M">M</span>
              <span className="brand-letter-B">K</span>
              <span className="brand-sub-badge ms-2">HOTELS</span>
            </div>
            <p className="mdb-footer-copyright mb-0">
              © {new Date().getFullYear()} Copyright: <br />
              <strong>MDBootstrap.com</strong>
            </p>
          </div>

          {/* Column 2: STORE */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="mdb-footer-heading">STORE</h6>
            <ul className="list-unstyled mdb-footer-links mb-0">
              <li><a href="#!">About us</a></li>
              <li><a href="#!">Find store</a></li>
              <li><a href="#!">Categories</a></li>
              <li><a href="#!">Blogs</a></li>
            </ul>
          </div>

          {/* Column 3: INFORMATION */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="mdb-footer-heading">INFORMATION</h6>
            <ul className="list-unstyled mdb-footer-links mb-0">
              <li><a href="#!">Help center</a></li>
              <li><a href="#!">Money refund</a></li>
              <li><a href="#!">Shipping info</a></li>
              <li><a href="#!">Refunds</a></li>
            </ul>
          </div>

          {/* Column 4: SUPPORT */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="mdb-footer-heading">SUPPORT</h6>
            <ul className="list-unstyled mdb-footer-links mb-0">
              <li><a href="#!">Help center</a></li>
              <li><a href="#!">Documents</a></li>
              <li><a href="#!">Account restore</a></li>
              <li><a href="#!">My orders</a></li>
            </ul>
          </div>

          {/* Column 5: NEWSLETTER */}
          <div className="col-12 col-md-9 col-lg-3">
            <h6 className="mdb-footer-heading">NEWSLETTER</h6>
            <p className="mdb-footer-text mb-3">
              Stay in touch with latest updates about our products and offers
            </p>
            <form onSubmit={handleJoinNewsletter} className="mdb-newsletter-form">
              <div className="input-group">
                <input
                  type="email"
                  className="form-control mdb-newsletter-input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address for newsletter"
                />
                <button
                  type="submit"
                  className="btn mdb-newsletter-btn"
                  aria-label="Join newsletter"
                >
                  JOIN
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="mdb-footer-divider"></div>

      {/* Bottom Sub-bar: Payment icons on Left, Language on Right */}
      <div className="container py-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          {/* Payment Card Badges */}
          <div className="d-flex align-items-center gap-2 mdb-payment-icons">
            <span className="payment-card-badge" title="Visa">VISA</span>
            <span className="payment-card-badge" title="MasterCard">MC</span>
            <span className="payment-card-badge" title="American Express">AMEX</span>
            <span className="payment-card-badge" title="PayPal">PAYPAL</span>
            <span className="payment-card-badge" title="Apple Pay">APPLE</span>
          </div>

          {/* Language Selector */}
          <div className="d-flex align-items-center gap-1 mdb-language-selector">
            <span className="me-1">🇺🇸</span>
            <span>English</span>
            <span style={{ fontSize: '0.75rem', marginLeft: '2px' }}>▾</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

