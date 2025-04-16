import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Table, Alert, Tab, Nav, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('matches');
  const [newMatch, setNewMatch] = useState({
    matchId: '',
    homeTeam: '',
    awayTeam: '',
    homeTeamFlag: '',
    awayTeamFlag: '',
    stage: 'group',
    group: 'A',
    startTime: ''
  });
  const [editMatch, setEditMatch] = useState({
    id: '',
    homeScore: '',
    awayScore: '',
    endingType: 'regular'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get('/api/admin/users');
        setUsers(usersRes.data);
        
        const matchesRes = await axios.get('/api/matches');
        setMatches(matchesRes.data);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Chyba při načítání dat');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewMatchChange = (e) => {
    setNewMatch({ ...newMatch, [e.target.name]: e.target.value });
  };

  const handleEditMatchChange = (e) => {
    setEditMatch({ ...editMatch, [e.target.name]: e.target.value });
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/matches', newMatch);
      toast.success('Zápas byl úspěšně vytvořen');
      
      // Aktualizace seznamu zápasů
      const matchesRes = await axios.get('/api/matches');
      setMatches(matchesRes.data);
      
      // Reset formuláře
      setNewMatch({
        matchId: '',
        homeTeam: '',
        awayTeam: '',
        homeTeamFlag: '',
        awayTeamFlag: '',
        stage: 'group',
        group: 'A',
        startTime: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Chyba při vytváření zápasu');
    }
  };

  const handleUpdateMatchResult = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/matches/${editMatch.id}/result`, {
        homeScore: parseInt(editMatch.homeScore),
        awayScore: parseInt(editMatch.awayScore),
        endingType: editMatch.endingType
      });
      toast.success('Výsledek zápasu byl úspěšně aktualizován');
      
      // Aktualizace seznamu zápasů
      const matchesRes = await axios.get('/api/matches');
      setMatches(matchesRes.data);
      
      // Reset formuláře
      setEditMatch({
        id: '',
        homeScore: '',
        awayScore: '',
        endingType: 'regular'
      });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Chyba při aktualizaci výsledku zápasu');
    }
  };

  const handleImportMatches = async () => {
    try {
      await axios.post('/api/admin/matches/import');
      toast.success('Import zápasů byl úspěšně dokončen');
      
      // Aktualizace seznamu zápasů
      const matchesRes = await axios.get('/api/matches');
      setMatches(matchesRes.data);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Chyba při importu zápasů');
    }
  };

  const handleEvaluatePredictions = async () => {
    try {
      await axios.post('/api/admin/matches/evaluate');
      toast.success('Vyhodnocení predikcí bylo úspěšně dokončeno');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Chyba při vyhodnocování predikcí');
    }
  };

  const handleToggleAdmin = async (userId, isAdmin) => {
    try {
      await axios.put(`/api/admin/users/${userId}/admin`, { isAdmin: !isAdmin });
      
      // Aktualizace seznamu uživatelů
      const usersRes = await axios.get('/api/admin/users');
      setUsers(usersRes.data);
      
      toast.success(`Administrátorská práva byla ${!isAdmin ? 'přidělena' : 'odebrána'}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Chyba při změně administrátorských práv');
    }
  };

  if (loading) {
    return <div className="text-center py-5">Načítání...</div>;
  }

  return (
    <div>
      <h1 className="mb-4">Administrace</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Tab.Container id="admin-tabs" activeKey={activeTab} onSelect={setActiveTab}>
        <Card className="mb-4">
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="matches">Správa zápasů</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="users">Správa uživatelů</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tools">Nástroje</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content>
              <Tab.Pane eventKey="matches">
                <h3 className="mb-3">Správa zápasů</h3>
                
                <Card className="mb-4">
                  <Card.Header>
                    <h4>Přidat nový zápas</h4>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleCreateMatch}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="matchId">
                            <Form.Label>ID zápasu</Form.Label>
                            <Form.Control
                              type="text"
                              name="matchId"
                              value={newMatch.matchId}
                              onChange={handleNewMatchChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="startTime">
                            <Form.Label>Čas začátku</Form.Label>
                            <Form.Control
                              type="datetime-local"
                              name="startTime"
                              value={newMatch.startTime}
                              onChange={handleNewMatchChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="homeTeam">
                            <Form.Label>Domácí tým</Form.Label>
                            <Form.Control
                              type="text"
                              name="homeTeam"
                              value={newMatch.homeTeam}
                              onChange={handleNewMatchChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="homeTeamFlag">
                            <Form.Label>URL vlajky domácího týmu</Form.Label>
                            <Form.Control
                              type="text"
                              name="homeTeamFlag"
                              value={newMatch.homeTeamFlag}
                              onChange={handleNewMatchChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="awayTeam">
                            <Form.Label>Hostující tým</Form.Label>
                            <Form.Control
                              type="text"
                              name="awayTeam"
                              value={newMatch.awayTeam}
                              onChange={handleNewMatchChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="awayTeamFlag">
                            <Form.Label>URL vlajky hostujícího týmu</Form.Label>
                            <Form.Control
                              type="text"
                              name="awayTeamFlag"
                              value={newMatch.awayTeamFlag}
                              onChange={handleNewMatchChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="stage">
                            <Form.Label>Fáze turnaje</Form.Label>
                            <Form.Select
                              name="stage"
                              value={newMatch.stage}
                              onChange={handleNewMatchChange}
                              required
                            >
                              <option value="group">Základní skupina</option>
                              <option value="quarterfinal">Čtvrtfinále</option>
                              <option value="semifinal">Semifinále</option>
                              <option value="bronze">O 3. místo</option>
                              <option value="final">Finále</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3" controlId="group">
                            <Form.Label>Skupina (pouze pro základní skupiny)</Form.Label>
                            <Form.Select
                              name="group"
                              value={newMatch.group}
                              onChange={handleNewMatchChange}
                              disabled={newMatch.stage !== 'group'}
                            >
                              <option value="A">Skupina A</option>
                              <option value="B">Skupina B</option>
                              <option value="C">Skupina C</option>
                              <option value="D">Skupina D</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Button type="submit" variant="primary" className="w-100">
                        Vytvořit zápas
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
                
                <Card className="mb-4">
                  <Card.Header>
                    <h4>Aktualizovat výsledek zápasu</h4>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleUpdateMatchResult}>
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3" controlId="matchSelect">
                            <Form.Label>Vyberte zápas</Form.Label>
                            <Form.Select
                              name="id"
                              value={editMatch.id}
                              onChange={handleEditMatchChange}
                              required
                            >
                              <option value="">Vyberte zápas</option>
                              {matches.map(match => (
                                <option key={match._id} value={match._id}>
                                  {new Date(match.startTime).toLocaleDateString('cs-CZ')} {match.homeTeam} vs {match.awayTeam}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3" controlId="homeScore">
                            <Form.Label>Skóre domácího týmu</Form.Label>
                            <Form.Control
                              type="number"
                              name="homeScore"
                              value={editMatch.homeScore}
                              onChange={handleEditMatchChange}
                              min="0"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3" controlId="awayScore">
                            <Form.Label>Skóre hostujícího týmu</Form.Label>
                            <Form.Control
                              type="number"
                              name="awayScore"
                              value={editMatch.awayScore}
                              onChange={handleEditMatchChange}
                              min="0"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3" controlId="endingType">
                            <Form.Label>Typ ukončení zápasu</Form.Label>
                            <Form.Select
                              name="endingType"
                              value={editMatch.endingType}
                              onChange={handleEditMatchChange}
                              required
                            >
                              <option value="regular">Základní hrací doba</option>
                              <option value="overtime">Prodloužení</option>
                              <option value="shootout">Nájezdy</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Button type="submit" variant="primary" className="w-100" disabled={!editMatch.id}>
                        Aktualizovat výsledek
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
                
                <h4 className="mb-3">Seznam zápasů</h4>
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
                                  <span className="ms-2">
                                    ({match.result.endingType === 'overtime' ? 'P' : 'SN'})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted">Nezadáno</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Tab.Pane>
              
              <Tab.Pane eventKey="users">
                <h3 className="mb-3">Správa uživatelů</h3>
                
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Jméno</th>
                      <th>Email</th>
                      <th>Registrace</th>
                      <th>Admin</th>
                      <th>Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user._id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString('cs-CZ')}</td>
                        <td>{user.isAdmin ? 'Ano' : 'Ne'}</td>
                        <td>
                          <Button
                            variant={user.isAdmin ? 'danger' : 'success'}
                            size="sm"
                            onClick={() => handleToggleAdmin(user._id, user.isAdmin)}
                          >
                            {user.isAdmin ? 'Odebrat admin' : 'Přidat admin'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab.Pane>
              
              <Tab.Pane eventKey="tools">
                <h3 className="mb-3">Nástroje</h3>
                
                <Card className="mb-4">
                  <Card.Header>
                    <h4>Import a vyhodnocení</h4>
                  </Card.Header>
                  <Card.Body>
                    <p>
                      Tyto nástroje slouží k importu zápasů z API a k manuálnímu vyhodnocení predikcí.
                    </p>
                    <div className="d-grid gap-3">
                      <Button variant="primary" onClick={handleImportMatches}>
                        Importovat zápasy z API
                      </Button>
                      <Button variant="success" onClick={handleEvaluatePredictions}>
                        Vyhodnotit všechny predikce
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </div>
  );
};

export default AdminPanel;
