import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DevOps = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/devops/pipelines', { replace: true });
  }, [navigate]);

  return null;
};

export default DevOps;
