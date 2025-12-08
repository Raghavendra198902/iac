import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/reports/overview');
  }, [navigate]);

  return null;
};

export default Reports;
