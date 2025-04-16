import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const { name, email, password, password2 } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password) {
      setError('Vyplňte prosím všechna pole');
      setLoading(false);
      return;
    }

    if (password !== password2) {
      setError('Hesla se neshodují');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      setLoading(false);
      return;
    }

    const registerData = {
      name,
      email,
      password
    };

    const success = await register(registerData);
    
    if (success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div>
      <h3 className="text-center mb-4">Registrace</h3>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Jméno</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={name}
            onChange={handleChange}
            placeholder="Zadejte jméno"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Zadejte email"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Heslo</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            placeholder="Zadejte heslo"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password2">
          <Form.Label>Potvrzení hesla</Form.Label>
          <Form.Control
            type="password"
            name="password2"
            value={password2}
            onChange={handleChange}
            placeholder="Zadejte heslo znovu"
            required
          />
        </Form.Group>

        <Button 
          variant="primary" 
          type="submit" 
          className="w-100 mt-3" 
          disabled={loading}
        >
          {loading ? 'Registrace...' : 'Zaregistrovat se'}
        </Button>
      </Form>
      
      <div className="text-center mt-3">
        <p>
          Již máte účet? <Link to="/login">Přihlaste se</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
