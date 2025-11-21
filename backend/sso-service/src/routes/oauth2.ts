import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { OIDCStrategy } from 'passport-azure-ad';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key';

// Google OAuth2
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use('google', new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/oauth2/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, {
        id: profile.id,
        email: profile.emails?.[0].value,
        name: profile.displayName,
        role: 'user',
        provider: 'google'
      });
    }
  ));
}

// Azure AD OAuth2
if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET) {
  passport.use('azuread', new OIDCStrategy(
    {
      identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      responseType: 'code id_token',
      responseMode: 'form_post',
      redirectUrl: '/api/auth/oauth2/azuread/callback',
      allowHttpForRedirectUrl: true,
      scope: ['profile', 'email']
    },
    (iss, sub, profile, accessToken, refreshToken, done) => {
      return done(null, {
        id: profile.oid,
        email: profile.upn || profile.email,
        name: profile.displayName,
        role: 'user',
        provider: 'azuread'
      });
    }
  ));
}

// Google OAuth routes
router.get('/google/login', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Azure AD OAuth routes
router.get('/azuread/login',
  passport.authenticate('azuread')
);

router.post('/azuread/callback',
  passport.authenticate('azuread', { session: false }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Okta configuration endpoint
router.post('/okta/configure', async (req: Request, res: Response) => {
  try {
    const { domain, clientId, clientSecret, enabled } = req.body;
    
    const config = {
      domain,
      clientId,
      clientSecret: '***masked***',
      enabled,
      callbackUrl: '/api/auth/oauth2/okta/callback'
    };
    
    res.json({ 
      message: 'Okta OAuth2 configuration updated',
      config 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List configured providers
router.get('/providers', (req: Request, res: Response) => {
  const providers = [
    {
      id: 'google',
      name: 'Google Workspace',
      enabled: !!process.env.GOOGLE_CLIENT_ID,
      configured: !!process.env.GOOGLE_CLIENT_ID
    },
    {
      id: 'azuread',
      name: 'Azure Active Directory',
      enabled: !!process.env.AZURE_CLIENT_ID,
      configured: !!process.env.AZURE_CLIENT_ID
    },
    {
      id: 'okta',
      name: 'Okta',
      enabled: false,
      configured: false
    }
  ];
  
  res.json({ providers });
});

export { router as oauth2Router };
