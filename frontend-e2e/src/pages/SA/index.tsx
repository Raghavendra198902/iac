import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SA = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/sa/design', { replace: true });
  }, [navigate]);

  return null;
};

export default SA;
