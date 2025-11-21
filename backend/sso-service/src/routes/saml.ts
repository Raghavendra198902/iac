import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as SamlStrategy } from 'passport-saml';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key';

// Configure SAML strategy
const samlConfig = {
  entryPoint: process.env.SAML_ENTRY_POINT || 'https://idp.example.com/sso',
  issuer: process.env.SAML_ISSUER || 'iac-dharma',
  callbackUrl: process.env.SAML_CALLBACK_URL || 'http://localhost:3012/api/auth/saml/callback',
  cert: process.env.SAML_CERT || 'dummy-cert'
};

passport.use('saml', new SamlStrategy(
  samlConfig,
  (profile: any, done: any) => {
    return done(null, {
      id: profile.nameID,
      email: profile.email || profile.nameID,
      name: profile.displayName || profile.nameID,
      role: profile.role || 'user',
      provider: 'saml'
    });
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Initiate SAML authentication
router.get('/login', passport.authenticate('saml'));

// SAML callback
router.post('/callback',
  passport.authenticate('saml', { session: false }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// SAML metadata
router.get('/metadata', (req: Request, res: Response) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                  entityID="${samlConfig.issuer}">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="${samlConfig.callbackUrl}"
        index="0"/>
  </SPSSODescriptor>
</EntityDescriptor>`);
});

// Configure SAML provider
router.post('/configure', async (req: Request, res: Response) => {
  try {
    const { entryPoint, issuer, cert, enabled } = req.body;
    
    // In production, save to database
    const config = {
      entryPoint,
      issuer,
      cert: cert.substring(0, 50) + '...', // Don't return full cert
      enabled,
      callbackUrl: samlConfig.callbackUrl
    };
    
    res.json({ 
      message: 'SAML configuration updated',
      config 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as samlRouter };
