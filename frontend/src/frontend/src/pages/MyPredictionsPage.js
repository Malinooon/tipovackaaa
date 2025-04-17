import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Card } from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import api from '../services/api';

const MyPredictionsPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/predictions/mymatches');
        setPredictions(data);
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

    fetchPredictions();
  }, []);

  // Format match time
  const formatMatchTime = (dateString) => {
    const matchTime = new Date(dateString);
    
    const formattedDate = new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(matchTime);
    
    const formattedTime = new Intl.DateTimeFormat('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(matchTime);

    return `${formattedDate} ${formattedTime}`;
  };

  // Get end type text
  const getEndTypeText = (endType) => {
    switch (endType) {
      case 'regular':
        return 'Základní hrací doba';
      case 'overtime':
        return 'Prodloužení';
      case 'shootout':
        return 'Nájezdy';
      default:
        return '';
    }
  };

  // Calculate total points
  const totalPoints = predictions.reduce((sum, prediction) => sum + prediction.points, 0);

  return (
    <Container>
      <h1 className="text-center my-4">Moje Tipy</h1>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col>
                  <h4>Celkový počet bodů: <span className="text-success">{totalPoints}</span></h4>
                  <p>Celkový počet tipů: {predictions.length}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {predictions.length === 0 ? (
            <Message>Zatím nemáte žádné tipy</Message>
          ) : (
            <Table striped bordered hover responsive className="predictions-table">
              <thead>
                <tr>
                  <th>Datum a čas</th>
                  <th>Zápas</th>
                  <th>Váš tip</th>
                  <th>Výsledek</th>
                  <th>Body</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((prediction) => (
                  <tr key={prediction._id}>
                    <td>{formatMatchTime(prediction.match.matchTime)}</td>
                    <td>
                      <div className="d-flex align-items-center justify-content-center">
                        <img 
                          src={`https://flagcdn.com/w40/${prediction.match.homeTeam.toLowerCase()}.png`} 
                          alt={prediction.match.homeTeam} 
                          className="me-2" 
                          style={{ width: '30px', height: '20px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-flag.png';
                          }}
                        />
                        {prediction.match.homeTeam} vs {prediction.match.awayTeam}
                        <img 
                          src={`https://flagcdn.com/w40/${prediction.match.awayTeam.toLowerCase()}.png`} 
                          alt={prediction.match.awayTeam} 
                          className="ms-2" 
                          style={{ width: '30px', height: '20px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-flag.png';
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      {prediction.homePrediction} : {prediction.awayPrediction}
                      <br />
                      <small>{getEndTypeText(prediction.endTypePrediction)}</small>
                    </td>
                    <td>
                      {prediction.match.status === 'finished' ? (
                        <>
                          {prediction.match.homeScore} : {prediction.match.awayScore}
                          <br />
                          <small>{getEndTypeText(prediction.match.endType)}</small>
                        </>
                      ) : (
                        <span className="text-muted">
                          {prediction.match.status === 'upcoming' ? 'Čeká se na výsledek' : 'Právě se hraje'}
                        </span>
                      )}
                    </td>
                    <td>
                      {prediction.match.status === 'finished' ? (
                        <span className="points">{prediction.points}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Container>
  );
};

export default MyPredictionsPage;
