// src/pages/IssueWarranty.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WarrantyForm from '../components/WarrantyForm';

const IssueWarranty = ({ account }) => {
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
    <div className="issue-warranty-page">
      <h1>Issue New Warranty</h1>
      <p className="page-description">
        Create a new NFT warranty for a product. The warranty will be minted and sent to the recipient's
        address. Make sure you have enough ETH in your wallet to cover the gas fees.
      </p>
      
      <WarrantyForm />
    </div>
  );
};

export default IssueWarranty;