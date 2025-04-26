// src/components/WarrantyList.jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { getContract } from '../utils/contract';

const WarrantyList = ({ account }) => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (account) {
      fetchWarranties();
    }
  }, [account]);

  const fetchWarranties = async () => {
    setLoading(true);
    setError('');
    
    try {
      const contract = await getContract();
      if (!contract) throw new Error('Could not connect to contract');
      
      // Get the total supply of tokens
      const totalSupply = await contract.getTotalSupply(); // ✅
      const warrantyPromises = [];
      
      // Loop through each token and check if the current account owns it
      for (let i = 1; i <= totalSupply; i++) {
        warrantyPromises.push(checkWarrantyOwnership(contract, i, account));
      }
      
      // Wait for all promises to resolve
      const userWarranties = (await Promise.all(warrantyPromises)).filter(Boolean);
      setWarranties(userWarranties);
    } catch (err) {
      console.error("Error fetching warranties:", err);
      setError('Failed to fetch warranties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkWarrantyOwnership = async (contract, tokenId, account) => {
    try {
      // Try to get the owner of this token
      const owner = await contract.ownerOf(tokenId);
      
      // If the owner matches our account, get the warranty details
      if (owner.toLowerCase() === account.toLowerCase()) {
        const [
          issuedTimestamp,
          expiryTimestamp,
          productId,
          productName,
          brand,
          issuer,
          isValid,
          hasExpired
        ] = await contract.getWarrantyDetails(tokenId);
        
        // Get the token URI for additional metadata
        const tokenURI = await contract.tokenURI(tokenId);
        let metadata = {};
        
        // If the tokenURI is an IPFS link or HTTP link, try to fetch the metadata
        if (tokenURI && (tokenURI.startsWith('ipfs://') || tokenURI.startsWith('http'))) {
          try {
            const url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
            const response = await fetch(url);
            metadata = await response.json();
          } catch (err) {
            console.warn(`Could not fetch metadata for token ${tokenId}`);
          }
        }
        
        return {
          tokenId,
          issuedTimestamp: new Date(issuedTimestamp.toNumber() * 1000).toLocaleDateString(),
          expiryTimestamp: new Date(expiryTimestamp.toNumber() * 1000).toLocaleDateString(),
          productId,
          productName,
          brand,
          issuer,
          isValid,
          hasExpired,
          image: metadata.image ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : null,
          additionalInfo: metadata.additionalInfo || ''
        };
      }
      return null;
    } catch (err) {
      // This will happen if the token doesn't exist or is burned
      return null;
    }
  };

  const claimWarranty = async (tokenId) => {
    try {
      const contract = await getContract(true);
      const tx = await contract.claimWarranty(tokenId);
      await tx.wait();
      alert(`Warranty claim submitted for token ID: ${tokenId}`);
    } catch (err) {
      console.error("Error claiming warranty:", err);
      alert(`Failed to claim warranty: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading your warranties...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (warranties.length === 0) {
    return <div className="no-warranties">You don't have any warranties yet.</div>;
  }

  return (
    <div className="warranty-list">
      <h2>My Warranties</h2>
      
      <div className="warranty-grid">
        {warranties.map(warranty => (
          <div key={warranty.tokenId} className="warranty-card">
            {warranty.image && (
              <div className="warranty-image">
                <img src={warranty.image} alt={`${warranty.brand} ${warranty.productName}`} />
              </div>
            )}
            
            <div className="warranty-content">
              <h3>{warranty.brand} {warranty.productName}</h3>
              <p><strong>Product ID:</strong> {warranty.productId}</p>
              <p><strong>Issued:</strong> {warranty.issuedTimestamp}</p>
              <p><strong>Expires:</strong> {warranty.expiryTimestamp}</p>
              <p className={`warranty-status ${warranty.isValid && !warranty.hasExpired ? 'valid' : 'invalid'}`}>
                Status: {warranty.isValid && !warranty.hasExpired ? 'Valid' : 'Expired/Void'}
              </p>
              
              <div className="warranty-actions">
                <Link to={`/warranty/${warranty.tokenId}`} className="view-button">
                  View Details
                </Link>
                
                {warranty.isValid && !warranty.hasExpired && (
                  <button 
                    onClick={() => claimWarranty(warranty.tokenId)}
                    className="claim-button"
                  >
                    Claim Warranty
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WarrantyList;