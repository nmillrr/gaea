// Note: These are integration tests and would need a test database to run properly
// For completeness, I'm including them, but they would need additional setup to run

import request from 'supertest';
import app from '../server';

describe('Authentication Routes', () => {
  describe('POST /auth/register', () => {
    it('should register a new user and return a JWT token', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'integration-test@example.com',
          password: 'password123',
          username: 'integrationUser'
        });
        
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('email', 'integration-test@example.com');
    });
  });

  describe('POST /auth/login', () => {
    it('should log in an existing user and return a JWT token', async () => {
      // Assuming the user created in the registration test exists
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'password123'
        });
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'integration-test@example.com');
    });
  });

  describe('Protected Routes', () => {
    let token: string;
    
    beforeAll(async () => {
      // Log in to get a token for protected route tests
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'password123'
        });
        
      token = res.body.token;
    });
    
    it('should access a protected route with a valid token', async () => {
      const res = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email');
    });
    
    it('should reject access to a protected route without a token', async () => {
      const res = await request(app)
        .get('/api/me');
        
      expect(res.status).toBe(401);
    });
    
    it('should reject access to a protected route with an invalid token', async () => {
      const res = await request(app)
        .get('/api/me')
        .set('Authorization', 'Bearer invalid-token');
        
      expect(res.status).toBe(401);
    });
  });
});