import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const JoinLeague = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    displayName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, password, displayName } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !password || !displayName) {
      setError('Vyplňte prosím všechna pole');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/leagues/join', formData);
      toast.success('Úspěšně jste se připojili k lize');
      navigate(`/leagues/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Chyba při připojování k lize');
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4">Připojit se k lize</h1>

      <Card className="mb-4">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Název ligy</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="Zadejte název ligy"
                required
              />
              <Form.Text className="text-muted">
                Zadejte přesný název ligy, ke které se chcete připojit.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Heslo ligy</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Zadejte heslo pro přístup do ligy"
                required
              />
              <Form.Text className="text-muted">
                Zadejte heslo, které bylo nastaveno při vytvoření ligy.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="displayName">
              <Form.Label>Vaše zobrazované jméno v lize</Form.Label>
              <Form.Control
                type="text"
                name="displayName"
                value={displayName}
                onChange={handleChange}
                placeholder="Zadejte své zobrazované jméno v této lize"
                required
              />
              <Form.Text className="text-muted">
                Pod tímto jménem budete viditelní pro ostatní členy ligy.
              </Form.Text>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3"
              disabled={loading}
            >
              {loading ? 'Připojování...' : 'Připojit se k lize'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default JoinLeague;
