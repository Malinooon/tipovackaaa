import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import Message from '../components/Message';
import Loader from '../components/Loader';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user ? user.name : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Hesla se neshodují');
      return;
    }
    
    // Note: In a real implementation, we would update the user profile here
    // For this demo, we'll just simulate success
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setMessage('Profil byl úspěšně aktualizován');
      setLoading(false);
    }, 1000);
  };

  return (
    <Container>
      <Row className="justify-content-md-center my-4">
        <Col md={8}>
          <h1 className="text-center mb-4">Uživatelský profil</h1>
          
          <Card className="profile-card">
            <Card.Body>
              <div className="profile-header">
                <div className="profile-avatar">
                  {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-info">
                  <h2>{user && user.name}</h2>
                  <p>{user && user.email}</p>
                </div>
              </div>
              
              {message && (
                <Message variant={success ? 'success' : 'danger'}>
                  {message}
                </Message>
              )}
              
              {loading && <Loader />}
              
              <Form onSubmit={submitHandler}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Jméno</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Zadejte jméno"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Zadejte email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="password" className="mb-3">
                  <Form.Label>Heslo</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Zadejte nové heslo"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Nechte prázdné, pokud nechcete měnit heslo
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="confirmPassword" className="mb-4">
                  <Form.Label>Potvrzení hesla</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Potvrďte nové heslo"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100 mb-3">
                  Aktualizovat profil
                </Button>
                
                <Button 
                  variant="danger" 
                  className="w-100" 
                  onClick={logout}
                >
                  Odhlásit se
                </Button>
              </Form>
            </Card.Body>
          </Card>
          
          <div className="profile-stats mt-4">
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Celkem tipů</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Bodů</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0%</div>
              <div className="stat-label">Úspěšnost</div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
