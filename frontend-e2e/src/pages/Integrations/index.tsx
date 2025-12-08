import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Integrations() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/integrations/overview');
  }, [navigate]);

  return null;
}
