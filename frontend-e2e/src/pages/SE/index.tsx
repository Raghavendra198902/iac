import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SE = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/se/development', { replace: true });
  }, [navigate]);

  return null;
};

export default SE;
