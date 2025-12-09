import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { authRouter } from './routes/auth';
import { samlRouter } from './routes/saml';
import { oauth2Router } from './routes/oauth2';
import { adminRouter } from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3012;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'iac-dharma-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'sso-service' });
});
import { createLogger } from '../../../packages/logger/src/index';

const logger = createLogger({ serviceName: 'sso-service' });

app.use('/api/auth', authRouter);
app.use('/api/auth/saml', samlRouter);
app.use('/api/auth/oauth2', oauth2Router);
app.use('/api/auth/admin', adminRouter);

app.listen(PORT, () => {
  logger.info('SSO Service started', { port: PORT });
});
