import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const res = await axios.get('/api/leagues');
        setLeagues(res.data);
        setLoading(false);
      } catch (err) {
        setError('Nepodařilo se načíst ligy');
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Načítání...</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Přehled</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {leagues.length === 0 ? (
        <Card className="mb-4">
          <Card.Body className="text-center py-5">
            <h3 className="mb-4">Vítejte v Tipovačce MS v Hokeji 2025!</h3>
            <p className="mb-4">
              Pro začátek tipování se připojte k existující lize nebo vytvořte vlastní.
            </p>
            <Row className="justify-content-center">
              <Col xs={12} md={6} lg={4} className="mb-3">
                <Button
                  as={Link}
                  to="/create-league"
                  variant="primary"
                  className="w-100"
                >
                  Vytvořit ligu
                </Button>
              </Col>
              <Col xs={12} md={6} lg={4}>
                <Button
                  as={Link}
                  to="/join-league"
                  variant="outline-primary"
                  className="w-100"
                >
                  Připojit se k lize
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ) : (
        <>
          <h2 className="mb-3">Moje ligy</h2>
          <Row>
            {leagues.map((league) => (
              <Col key={league._id} xs={12} md={6} lg={4} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title>{league.name}</Card.Title>
                    <Card.Text>
                      Počet členů: {league.members.length}
                    </Card.Text>
                    <Button
                      as={Link}
                      to={`/leagues/${league._id}`}
                      variant="primary"
                      className="w-100"
                    >
                      Zobrazit ligu
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
            <Col xs={12} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm border-dashed">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  <Card.Title>Přidat další ligu</Card.Title>
                  <div className="mt-3">
                    <Button
                      as={Link}
                      to="/create-league"
                      variant="outline-primary"
                      className="me-2"
                    >
                      Vytvořit ligu
                    </Button>
                    <Button
                      as={Link}
                      to="/join-league"
                      variant="outline-secondary"
                    >
                      Připojit se
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;
