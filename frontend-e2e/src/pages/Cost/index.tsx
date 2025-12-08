import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Cost = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Cost Analytics by default
    navigate('/cost/analytics', { replace: true });
  }, [navigate]);

  return null;
};

export default Cost;
