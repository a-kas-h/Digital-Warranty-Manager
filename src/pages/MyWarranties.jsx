// src/pages/MyWarranties.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WarrantyList from '../components/WarrantyList';

const MyWarranties = ({ account }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to home if not connected
    if (!account) {
      navigate('/');
    }
  }, [account, navigate]);
  
  if (!account) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="my-warranties-page">
      <h1>My Warranties</h1>
      <p className="page-description">
        View and manage all warranties owned by your current wallet address. Here you can check status,
        claim warranty service, or transfer ownership.
      </p>
      
      <WarrantyList account={account} />
    </div>
  );
};

export default MyWarranties;