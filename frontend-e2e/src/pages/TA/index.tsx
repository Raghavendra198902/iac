import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TA = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/ta/infrastructure', { replace: true });
  }, [navigate]);

  return null;
};

export default TA;
