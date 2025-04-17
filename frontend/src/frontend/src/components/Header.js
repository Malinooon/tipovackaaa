import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>Tipovačka MS v Hokeji 2025</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {user ? (
                <>
                  <LinkContainer to="/predictions">
                    <Nav.Link>Moje Tipy</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/profile">
                    <Nav.Link>Profil</Nav.Link>
                  </LinkContainer>
                  <Nav.Item className="user-info">
                    <span className="user-name">Přihlášen jako: {user.name}</span>
                    <Button variant="outline-light" size="sm" onClick={logout}>
                      Odhlásit
                    </Button>
                  </Nav.Item>
                </>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link>Přihlášení</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <Nav.Link>Registrace</Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
