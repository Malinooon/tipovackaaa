import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AuthLayout = () => {
  return (
    <Container fluid className="auth-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="shadow-lg border-0 rounded-lg">
            <Card.Header className="text-center py-4 bg-primary text-white">
              <h2>Tipovačka MS v Hokeji 2025</h2>
            </Card.Header>
            <Card.Body className="p-4">
              <Outlet />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthLayout;
