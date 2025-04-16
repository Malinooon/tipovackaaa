import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        name: user.name || ''
      }));
    }
  }, [user]);

  const { name, currentPassword, newPassword, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validace
    if (!name) {
      setError('Jméno je povinné');
      setLoading(false);
      return;
    }

    // Kontrola, zda jsou vyplněna všechna pole pro změnu hesla
    if ((currentPassword || newPassword || confirmPassword) && 
        (!currentPassword || !newPassword || !confirmPassword)) {
      setError('Pro změnu hesla musíte vyplnit všechna pole');
      setLoading(false);
      return;
    }

    // Kontrola, zda se nové heslo a potvrzení shodují
    if (newPassword && newPassword !== confirmPassword) {
      setError('Nové heslo a potvrzení hesla se neshodují');
      setLoading(false);
      return;
    }

    // Kontrola délky nového hesla
    if (newPassword && newPassword.length < 6) {
      setError('Nové heslo musí mít alespoň 6 znaků');
      setLoading(false);
      return;
    }

    // Příprava dat pro aktualizaci
    const updateData = {
      name
    };

    // Přidání hesel, pokud jsou vyplněna
    if (currentPassword && newPassword) {
      updateData.currentPassword = currentPassword;
      updateData.newPassword = newPassword;
    }

    const success = await updateProfile(updateData);
    
    if (success) {
      // Vymazání polí pro hesla
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Profil byl úspěšně aktualizován');
    }
    
    setLoading(false);
  };

  return (
    <div>
      <h1 className="mb-4">Můj profil</h1>

      <Card className="mb-4">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Jméno</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="Zadejte své jméno"
                required
              />
            </Form.Group>

            <h4 className="mt-4 mb-3">Změna hesla</h4>

            <Form.Group className="mb-3" controlId="currentPassword">
              <Form.Label>Současné heslo</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={currentPassword}
                onChange={handleChange}
                placeholder="Zadejte současné heslo"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>Nové heslo</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={handleChange}
                placeholder="Zadejte nové heslo"
              />
              <Form.Text className="text-muted">
                Heslo musí mít alespoň 6 znaků.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Potvrzení nového hesla</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Zadejte nové heslo znovu"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3"
              disabled={loading}
            >
              {loading ? 'Ukládání...' : 'Uložit změny'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Profile;
