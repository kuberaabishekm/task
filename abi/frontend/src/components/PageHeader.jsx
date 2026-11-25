import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({
  title = "Hotels",
  breadcrumbs = [
    { label: "Home", path: "/" },
    { label: "Library", path: "/" },
    { label: "Data", active: true }
  ]
}) => {
  return (
    <section className="mdb-page-header-banner" aria-label="Page Header">
      <div className="container">
        <h1 className="mdb-header-title">{title}</h1>
        <nav aria-label="Breadcrumb">
          <ol className="mdb-breadcrumb">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li key={idx} className="mdb-breadcrumb-item">
                  {crumb.active || isLast ? (
                    <span className="active" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link to={crumb.path || "/"}>
                      {crumb.label}
                    </Link>
                  )}
                  {!isLast && <span className="separator">&gt;</span>}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </section>
  );
};

export default PageHeader;
