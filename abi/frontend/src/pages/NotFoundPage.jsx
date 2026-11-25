import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home } from 'lucide-react';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Hotelier</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Helmet>
      <Navbar />
      <PageHeader
        title="Page Not Found"
        subtitle="The requested URL was not found on this server"
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "404 Error", active: true }
        ]}
      />
      <div className="container py-5 text-center">
        <div className="card p-5 border mx-auto" style={{ maxWidth: '500px' }}>
          <h2 className="display-4 fw-bold text-primary mb-3">404</h2>
          <h3 className="h5 fw-bold mb-2">We couldn't find that page</h3>
          <p className="text-muted mb-4">
            The page or hotel listing you requested may have been moved, deleted, or does not exist.
          </p>
          <Link to="/" className="btn btn-primary-blue mx-auto d-inline-flex align-items-center gap-1">
            <Home size={16} />
            <span>Return to Hotel Listings</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;

