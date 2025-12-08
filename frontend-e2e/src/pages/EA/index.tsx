import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EA = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/ea/business', { replace: true });
  }, [navigate]);

  return null;
};

export default EA;
