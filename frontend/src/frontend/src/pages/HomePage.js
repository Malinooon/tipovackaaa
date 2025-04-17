import React, { useState, useEffect } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import MatchCard from '../components/MatchCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/matches');
        setMatches(data);
        setError('');
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Něco se pokazilo. Zkuste to prosím znovu.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handlePredictionSaved = (prediction) => {
    // Update the matches list with the new prediction
    // This is optional but can provide immediate feedback
    console.log('Prediction saved:', prediction);
  };

  return (
    <Container>
      <h1 className="text-center my-4">MS v Hokeji 2025 - Zápasy</h1>
      
      {!user && (
        <Message variant="info">
          Pro zadávání tipů se prosím <a href="/login">přihlaste</a> nebo <a href="/register">zaregistrujte</a>.
        </Message>
      )}
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Row>
          {matches.length === 0 ? (
            <Col>
              <Message>Žádné zápasy k zobrazení</Message>
            </Col>
          ) : (
            matches.map((match) => (
              <Col key={match._id} xs={12}>
                <MatchCard 
                  match={match} 
                  onPredictionSaved={handlePredictionSaved} 
                />
              </Col>
            ))
          )}
        </Row>
      )}
    </Container>
  );
};

export default HomePage;
