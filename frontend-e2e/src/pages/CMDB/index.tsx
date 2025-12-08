import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CMDBIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/cmdb/assets', { replace: true });
  }, [navigate]);

  return null;
}
