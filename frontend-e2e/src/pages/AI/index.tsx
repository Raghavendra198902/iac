import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AI() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/ai/overview');
  }, [navigate]);

  return null;
}
