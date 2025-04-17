import React, { useState } from 'react';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Přihlášení selhalo. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <div className="login-form">
            <h1 className="form-title">Přihlášení</h1>
            
            {error && <Message variant="danger">{error}</Message>}
            {loading && <Loader />}
            
            <Form onSubmit={submitHandler}>
              <Form.Group controlId="email" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Zadejte email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="password" className="mb-4">
                <Form.Label>Heslo</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Zadejte heslo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                Přihlásit se
              </Button>
            </Form>

            <Row className="py-3">
              <Col>
                Nemáte účet?{' '}
                <Link to="/register">Zaregistrujte se</Link>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
