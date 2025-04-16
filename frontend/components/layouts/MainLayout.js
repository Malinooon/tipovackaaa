import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/dashboard">
            Tipovačka MS v Hokeji 2025
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard">
                Přehled
              </Nav.Link>
              <NavDropdown title="Ligy" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/create-league">
                  Vytvořit ligu
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/join-league">
                  Připojit se k lize
                </NavDropdown.Item>
              </NavDropdown>
              {user?.isAdmin && (
                <Nav.Link as={Link} to="/admin">
                  Administrace
                </Nav.Link>
              )}
            </Nav>
            <Nav>
              <NavDropdown title={user?.name || 'Uživatel'} id="user-dropdown">
                <NavDropdown.Item as={Link} to="/profile">
                  Můj profil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Odhlásit se
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="flex-grow-1 mb-4">
        <Outlet />
      </Container>

      <footer className="bg-light py-3 mt-auto">
        <Container className="text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} Tipovačka MS v Hokeji 2025
          </p>
        </Container>
      </footer>
    </div>
  );
};

export default MainLayout;
