import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Nav, Tab, Alert, Badge } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const LeagueDetail = () => {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [league, setLeague] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        const leagueRes = await axios.get(`/api/leagues/${leagueId}`);
        setLeague(leagueRes.data);
        
        const matchesRes = await axios.get('/api/matches');
        setMatches(matchesRes.data);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Chyba při načítání dat ligy');
        setLoading(false);
      }
    };

    fetchLeagueData();
  }, [leagueId]);

  const handlePredictClick = () => {
    navigate(`/leagues/${leagueId}/predictions`);
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

  // Seřazení členů ligy podle bodů (sestupně)
  const sortedMembers = [...league.members].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div>
      <h1 className="mb-4">{league.name}</h1>

      <Tab.Container id="league-tabs" defaultActiveKey="standings">
        <Card className="mb-4">
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="standings">Žebříček</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="matches">Zápasy</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="members">Členové</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="standings">
                <h3 className="mb-3">Žebříček ligy</h3>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Jméno</th>
                      <th>Body</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMembers.map((member, index) => (
                      <tr key={member.userId}>
                        <td>{index + 1}</td>
                        <td>{member.displayName}</td>
                        <td>{member.totalPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab.Pane>
              <Tab.Pane eventKey="matches">
                <h3 className="mb-3">Zápasy</h3>
                <div className="d-grid gap-2 mb-4">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={handlePredictClick}
                  >
                    Tipovat zápasy
                  </Button>
                </div>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Datum</th>
                      <th>Zápas</th>
                      <th>Fáze</th>
                      <th>Výsledek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match) => {
                      const matchDate = new Date(match.startTime);
                      const isFinished = match.result.isFinished;
                      const now = new Date();
                      const deadline = new Date(match.startTime);
                      deadline.setMinutes(deadline.getMinutes() - 30);
                      const canPredict = now <= deadline;
                      
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
                            {isFinished ? (
                              <div>
                                {match.result.homeScore} : {match.result.awayScore}
                                {match.result.endingType !== 'regular' && (
                                  <Badge 
                                    bg="secondary" 
                                    className="ms-2"
                                  >
                                    {match.result.endingType === 'overtime' ? 'P' : 'SN'}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <Badge 
                                bg={canPredict ? 'success' : 'warning'}
                              >
                                {canPredict ? 'Otevřeno pro tipy' : 'Uzavřeno pro tipy'}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Tab.Pane>
              <Tab.Pane eventKey="members">
                <h3 className="mb-3">Členové ligy</h3>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Jméno</th>
                      <th>Připojení</th>
                    </tr>
                  </thead>
                  <tbody>
                    {league.members.map((member) => (
                      <tr key={member.userId}>
                        <td>{member.displayName}</td>
                        <td>
                          {new Date(member.joinedAt).toLocaleDateString('cs-CZ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </div>
  );
};

export default LeagueDetail;
