import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Table, Alert, Badge, Row, Col, Tab, Nav } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Predictions = () => {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [league, setLeague] = useState(null);
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('group');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Načtení ligy
        const leagueRes = await axios.get(`/api/leagues/${leagueId}`);
        setLeague(leagueRes.data);
        
        // Načtení zápasů
        const matchesRes = await axios.get('/api/matches');
        setMatches(matchesRes.data);
        
        // Načtení predikcí uživatele
        const predictionsRes = await axios.get(`/api/predictions/user/league/${leagueId}`);
        
        // Převedení predikcí na objekt pro snadnější přístup
        const predictionsObj = {};
        predictionsRes.data.forEach(prediction => {
          predictionsObj[prediction.matchId._id] = {
            homeScore: prediction.homeScore,
            awayScore: prediction.awayScore,
            endingType: prediction.endingType,
            points: prediction.points,
            evaluated: prediction.evaluated,
            evaluationDetails: prediction.evaluationDetails
          };
        });
        
        setPredictions(predictionsObj);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Chyba při načítání dat');
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId]);

  const handlePredictionChange = (matchId, field, value) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value
      }
    }));
  };

  const handleSubmitPrediction = async (matchId) => {
    try {
      const prediction = predictions[matchId];
      
      if (!prediction || prediction.homeScore === undefined || prediction.awayScore === undefined || !prediction.endingType) {
        toast.error('Vyplňte prosím všechny údaje predikce');
        return;
      }
      
      const predictionData = {
        matchId,
        leagueId,
        homeScore: parseInt(prediction.homeScore),
        awayScore: parseInt(prediction.awayScore),
        endingType: prediction.endingType
      };
      
      await axios.post('/api/predictions', predictionData);
      toast.success('Predikce byla úspěšně uložena');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Chyba při ukládání predikce');
    }
  };

  const handleBackToLeague = () => {
    navigate(`/leagues/${leagueId}`);
  };

  if (loading) {
    return <div className="text-center py-5">Načítání...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!league) {
    return <Alert variant="danger">Liga nebyla nalezena</Alert>;
  }

  // Filtrování zápasů podle fáze turnaje
  const filteredMatches = matches.filter(match => {
    if (activeTab === 'group') {
      return match.stage === 'group';
    } else if (activeTab === 'playoff') {
      return match.stage !== 'group';
    }
    return true;
  });

  // Seřazení zápasů podle data
  const sortedMatches = [...filteredMatches].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return (
    <div>
      <h1 className="mb-4">Tipování zápasů</h1>
      <h3 className="mb-3">Liga: {league.name}</h3>

      <Button 
        variant="outline-secondary" 
        className="mb-4" 
        onClick={handleBackToLeague}
      >
        &larr; Zpět na ligu
      </Button>

      <Tab.Container id="prediction-tabs" activeKey={activeTab} onSelect={setActiveTab}>
        <Card className="mb-4">
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="group">Základní skupiny</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="playoff">Play-off</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="group">
                <h3 className="mb-3">Zápasy základních skupin</h3>
              </Tab.Pane>
              <Tab.Pane eventKey="playoff">
                <h3 className="mb-3">Zápasy play-off</h3>
              </Tab.Pane>
            </Tab.Content>

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Zápas</th>
                  <th>Fáze</th>
                  <th>Váš tip</th>
                  <th>Akce</th>
                </tr>
              </thead>
              <tbody>
                {sortedMatches.map((match) => {
                  const matchDate = new Date(match.startTime);
                  const now = new Date();
                  const deadline = new Date(match.startTime);
                  deadline.setMinutes(deadline.getMinutes() - 30);
                  const canPredict = now <= deadline;
                  const prediction = predictions[match._id] || {};
                  
                  return (
                    <tr key={match._id}>
                      <td>
                        {matchDate.toLocaleDateString('cs-CZ')}
                        <br />
                        {matchDate.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="text-end me-2">
                            <img 
                              src={match.homeTeamFlag} 
                              alt={match.homeTeam} 
                              width="30" 
                              className="me-2" 
                            />
                            {match.homeTeam}
                          </div>
                          <div className="mx-2">vs</div>
                          <div className="text-start ms-2">
                            <img 
                              src={match.awayTeamFlag} 
                              alt={match.awayTeam} 
                              width="30" 
                              className="me-2" 
                            />
                            {match.awayTeam}
                          </div>
                        </div>
                      </td>
                      <td>
                        {match.stage === 'group' ? `Skupina ${match.group}` : 
                         match.stage === 'quarterfinal' ? 'Čtvrtfinále' :
                         match.stage === 'semifinal' ? 'Semifinále' :
                         match.stage === 'bronze' ? 'O 3. místo' :
                         match.stage === 'final' ? 'Finále' : match.stage}
                      </td>
                      <td>
                        {match.result.isFinished ? (
                          <div>
                            <div className="mb-2">
                              <strong>Váš tip:</strong> {prediction.homeScore} : {prediction.awayScore}
                              {prediction.endingType !== 'regular' && (
                                <Badge 
                                  bg="secondary" 
                                  className="ms-2"
                                >
                                  {prediction.endingType === 'overtime' ? 'P' : 'SN'}
                                </Badge>
                              )}
                            </div>
                            <div className="mb-2">
                              <strong>Výsledek:</strong> {match.result.homeScore} : {match.result.awayScore}
                              {match.result.endingType !== 'regular' && (
                                <Badge 
                                  bg="secondary" 
                                  className="ms-2"
                                >
                                  {match.result.endingType === 'overtime' ? 'P' : 'SN'}
                                </Badge>
                              )}
                            </div>
                            {prediction.evaluated && (
                              <div>
                                <strong>Body:</strong> {prediction.points}
                              </div>
                            )}
                          </div>
                        ) : canPredict ? (
                          <Row>
                            <Col xs={5}>
                              <Form.Control
                                type="number"
                                min="0"
                                value={prediction.homeScore || ''}
                                onChange={(e) => handlePredictionChange(match._id, 'homeScore', e.target.value)}
                                placeholder="0"
                              />
                            </Col>
                            <Col xs={2} className="text-center">:</Col>
                            <Col xs={5}>
                              <Form.Control
                                type="number"
                                min="0"
                                value={prediction.awayScore || ''}
                                onChange={(e) => handlePredictionChange(match._id, 'awayScore', e.target.value)}
                                placeholder="0"
                              />
                            </Col>
                            <Col xs={12} className="mt-2">
                              <Form.Select
                                value={prediction.endingType || ''}
                                onChange={(e) => handlePredictionChange(match._id, 'endingType', e.target.value)}
                              >
                                <option value="">Vyberte typ ukončení</option>
                                <option value="regular">Základní hrací doba</option>
                                <option value="overtime">Prodloužení</option>
                                <option value="shootout">Nájezdy</option>
                              </Form.Select>
                            </Col>
                          </Row>
                        ) : (
                          <div>
                            {prediction.homeScore !== undefined && prediction.awayScore !== undefined ? (
                              <div>
                                {prediction.homeScore} : {prediction.awayScore}
                                {prediction.endingType !== 'regular' && (
                                  <Badge 
                                    bg="secondary" 
                                    className="ms-2"
                                  >
                                    {prediction.endingType === 'overtime' ? 'P' : 'SN'}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <Badge bg="danger">Bez tipu</Badge>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        {canPredict && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSubmitPrediction(match._id)}
                          >
                            Uložit tip
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Tab.Container>
    </div>
  );
};

export default Predictions;
