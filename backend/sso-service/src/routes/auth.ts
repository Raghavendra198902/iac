import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key';

// Mock user database
const users = new Map([
  ['admin@iac-dharma.com', {
    id: '1',
    email: 'admin@iac-dharma.com',
    password: '$2a$10$xQjRZ8jKZY8xh.p4sNKZgO5F5h5mL4pN8gF5K5mL4pN8gF5K5mL4p', // "admin123"
    name: 'Admin User',
    role: 'admin',
    provider: 'local'
  }]
]);

// Local authentication
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Token validation
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    res.json({
      valid: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error: any) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// Token refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as any;
    
    const newToken = jwt.sign(
      { 
        id: decoded.id, 
        email: decoded.email, 
        role: decoded.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token: newToken });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = Array.from(users.values()).find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      provider: user.provider
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export { router as authRouter };
