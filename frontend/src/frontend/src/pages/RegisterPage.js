import React, { useState } from 'react';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await register(name, email, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Registrace selhala. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <div className="register-form">
            <h1 className="form-title">Registrace</h1>
            
            {error && <Message variant="danger">{error}</Message>}
            {loading && <Loader />}
            
            <Form onSubmit={submitHandler}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Jméno</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Zadejte jméno"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

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

              <Form.Group controlId="password" className="mb-3">
                <Form.Label>Heslo</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Zadejte heslo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="confirmPassword" className="mb-4">
                <Form.Label>Potvrzení hesla</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Potvrďte heslo"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                Registrovat se
              </Button>
            </Form>

            <Row className="py-3">
              <Col>
                Již máte účet?{' '}
                <Link to="/login">Přihlaste se</Link>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
