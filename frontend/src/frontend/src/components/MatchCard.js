import React, { useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MatchCard = ({ match, onPredictionSaved }) => {
  const { user } = useAuth();
  const [homePrediction, setHomePrediction] = useState('');
  const [awayPrediction, setAwayPrediction] = useState('');
  const [endTypePrediction, setEndTypePrediction] = useState('regular');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if match is still open for predictions (30 minutes before start)
  const now = new Date();
  const matchTime = new Date(match.matchTime);
  const closingTime = new Date(matchTime.getTime() - 30 * 60 * 1000); // 30 minutes before match
  const isOpen = now < closingTime && match.status === 'upcoming';

  // Format match time
  const formattedDate = new Intl.DateTimeFormat('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(matchTime);
  
  const formattedTime = new Intl.DateTimeFormat('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(matchTime);

  // Get status class
  const getStatusClass = () => {
    switch (match.status) {
      case 'upcoming':
        return 'status-upcoming';
      case 'live':
        return 'status-live';
      case 'finished':
        return 'status-finished';
      default:
        return '';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (match.status) {
      case 'upcoming':
        return 'Nadcházející';
      case 'live':
        return 'Právě se hraje';
      case 'finished':
        return 'Ukončeno';
      default:
        return '';
    }
  };

  // Handle prediction submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Pro zadání tipu se musíte přihlásit');
      return;
    }
    
    if (homePrediction === '' || awayPrediction === '') {
      setError('Vyplňte prosím skóre pro oba týmy');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const { data } = await api.post('/api/predictions', {
        matchId: match._id,
        homePrediction: parseInt(homePrediction),
        awayPrediction: parseInt(awayPrediction),
        endTypePrediction,
      });
      
      setSuccess('Tip byl úspěšně uložen');
      
      if (onPredictionSaved) {
        onPredictionSaved(data);
      }
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

  return (
    <Card className="match-card">
      <Card.Body>
        <div className="match-header">
          <div>
            <span className="match-time">
              {formattedDate} | {formattedTime}
            </span>
          </div>
          <div>
            <span className={`match-status ${getStatusClass()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
        
        <Row className="match-teams align-items-center">
          <Col xs={5} className="text-end">
            <div className="team">
              <img 
                src={`https://flagcdn.com/w80/${match.homeTeam.toLowerCase()}.png`} 
                alt={match.homeTeam} 
                className="team-flag" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-flag.png';
                }}
              />
              <div>{match.homeTeam}</div>
            </div>
          </Col>
          
          <Col xs={2} className="text-center">
            {match.status === 'finished' ? (
              <div className="match-score">
                <h3>{match.homeScore} : {match.awayScore}</h3>
                <small>
                  {match.endType === 'regular' ? '' : 
                   match.endType === 'overtime' ? '(po prodloužení)' : 
                   '(po nájezdech)'}
                </small>
              </div>
            ) : (
              <div className="vs">vs</div>
            )}
          </Col>
          
          <Col xs={5} className="text-start">
            <div className="team">
              <img 
                src={`https://flagcdn.com/w80/${match.awayTeam.toLowerCase()}.png`} 
                alt={match.awayTeam} 
                className="team-flag" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-flag.png';
                }}
              />
              <div>{match.awayTeam}</div>
            </div>
          </Col>
        </Row>
        
        {isOpen && user && (
          <Form onSubmit={handleSubmit} className="prediction-form">
            <Row className="align-items-center justify-content-center">
              <Col xs={12} md={3} className="text-end">
                <Form.Group>
                  <Form.Control
                    type="number"
                    min="0"
                    className="prediction-input"
                    value={homePrediction}
                    onChange={(e) => setHomePrediction(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col xs={12} md={1} className="text-center">
                <span className="vs">:</span>
              </Col>
              
              <Col xs={12} md={3} className="text-start">
                <Form.Group>
                  <Form.Control
                    type="number"
                    min="0"
                    className="prediction-input"
                    value={awayPrediction}
                    onChange={(e) => setAwayPrediction(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Select
                    value={endTypePrediction}
                    onChange={(e) => setEndTypePrediction(e.target.value)}
                    className="end-type-select"
                  >
                    <option value="regular">Základní hrací doba</option>
                    <option value="overtime">Prodloužení</option>
                    <option value="shootout">Nájezdy</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col xs={12} md={2} className="text-center mt-2 mt-md-0">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                >
                  {loading ? 'Ukládám...' : 'Uložit tip'}
                </Button>
              </Col>
            </Row>
            
            {error && (
              <Row className="mt-2">
                <Col>
                  <div className="text-danger">{error}</div>
                </Col>
              </Row>
            )}
            
            {success && (
              <Row className="mt-2">
                <Col>
                  <div className="text-success">{success}</div>
                </Col>
              </Row>
            )}
          </Form>
        )}
        
        {!isOpen && match.status === 'upcoming' && (
          <div className="text-center mt-3">
            <p className="text-muted">Uzávěrka tipů pro tento zápas již proběhla</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MatchCard;
