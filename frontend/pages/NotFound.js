import React from 'react';
import { Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center py-5">
      <Alert variant="warning">
        <h2>404 - Stránka nenalezena</h2>
        <p className="mb-0">
          Požadovaná stránka neexistuje. <Link to="/dashboard">Zpět na hlavní stránku</Link>
        </p>
      </Alert>
    </div>
  );
};

export default NotFound;
