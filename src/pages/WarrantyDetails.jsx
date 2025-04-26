// src/pages/WarrantyDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { getContract } from '../utils/contract';

const WarrantyDetails = ({ account }) => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  
  const [warranty, setWarranty] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');

  useEffect(() => {
    if (!account) {
      navigate('/');
      return;
    }
    
    fetchWarrantyDetails();
  }, [account, tokenId, navigate]);

  const fetchWarrantyDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const contract = await getContract();
      
      // Check if the user owns this token
      const owner = await contract.ownerOf(tokenId);
      if (owner.toLowerCase() !== account.toLowerCase()) {
        setError("You don't own this warranty");
        setLoading(false);
        return;
      }
      
      // Get warranty details
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
      
      const warrantyData = {
        tokenId,
        issuedTimestamp: new Date(issuedTimestamp.toNumber() * 1000),
        expiryTimestamp: new Date(expiryTimestamp.toNumber() * 1000),
        productId,
        productName,
        brand,
        issuer,
        isValid,
        hasExpired,
        owner
      };
      
      setWarranty(warrantyData);
      
      // Get token URI and metadata
      const tokenURI = await contract.tokenURI(tokenId);
      if (tokenURI) {
        try {
          // Handle IPFS URLs
          const url = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
          const response = await fetch(url);
          const data = await response.json();
          
          // If there's an image URL, transform it for viewing
          if (data.image) {
            data.image = data.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
          }
          
          setMetadata(data);
        } catch (err) {
          console.warn("Could not fetch metadata:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching warranty details:", err);
      setError("Failed to fetch warranty details");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess('');
    setIsTransferring(true);
    
    try {
      if (!ethers.utils.isAddress(transferTo)) {
        throw new Error('Invalid recipient address');
      }
      
      const contract = await getContract(true);
      
      // Transfer the NFT
      const tx = await contract.transferFrom(account, transferTo, tokenId);
      
      setTransferSuccess('Transfer transaction submitted. Please wait for confirmation...');
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setTransferSuccess(`Warranty successfully transferred to ${transferTo}`);
      setTransferTo('');
      
      // Redirect back to My Warranties page after successful transfer
      setTimeout(() => {
        navigate('/my-warranties');
      }, 3000);
    } catch (err) {
      console.error("Error transferring warranty:", err);
      setTransferError(err.message || 'Failed to transfer warranty');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClaimWarranty = async () => {
    try {
      const contract = await getContract(true);
      const tx = await contract.claimWarranty(tokenId);
      
      await tx.wait();
      
      alert('Warranty claim successfully submitted!');
      // Refresh warranty details to show updated status
      fetchWarrantyDetails();
    } catch (err) {
      console.error("Error claiming warranty:", err);
      alert(`Failed to claim warranty: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading warranty details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!warranty) {
    return <div className="not-found">Warranty not found</div>;
  }

  return (
    <div className="warranty-details-page">
      <h1>Warranty Details</h1>
      
      <div className="warranty-container">
        <div className="warranty-image-container">
          {metadata && metadata.image ? (
            <img 
              src={metadata.image} 
              alt={`${warranty.brand} ${warranty.productName}`} 
              className="warranty-image"
            />
          ) : (
            <div className="warranty-image-placeholder">
              No Image Available
            </div>
          )}
        </div>
        
        <div className="warranty-info">
          <h2>{warranty.brand} {warranty.productName}</h2>
          
          <div className="info-group">
            <div className="info-item">
              <span className="label">Token ID:</span>
              <span className="value">{warranty.tokenId}</span>
            </div>
            
            <div className="info-item">
              <span className="label">Product ID:</span>
              <span className="value">{warranty.productId}</span>
            </div>
            
            <div className="info-item">
              <span className="label">Issued Date:</span>
              <span className="value">{warranty.issuedTimestamp.toLocaleDateString()}</span>
            </div>
            
            <div className="info-item">
              <span className="label">Expiry Date:</span>
              <span className="value">{warranty.expiryTimestamp.toLocaleDateString()}</span>
            </div>
            
            <div className="info-item">
              <span className="label">Status:</span>
              <span className={`value status ${warranty.isValid && !warranty.hasExpired ? 'valid' : 'invalid'}`}>
                {warranty.isValid && !warranty.hasExpired ? 'Valid' : 'Invalid/Expired'}
              </span>
            </div>
            
            <div className="info-item">
              <span className="label">Issuer:</span>
              <span className="value address">{warranty.issuer}</span>
            </div>
          </div>
          
          {metadata && metadata.additionalInfo && (
            <div className="additional-info">
              <h3>Additional Information</h3>
              <p>{metadata.additionalInfo}</p>
            </div>
          )}
          
          <div className="warranty-actions">
            {warranty.isValid && !warranty.hasExpired && (
              <button 
                onClick={handleClaimWarranty}
                className="action-button claim"
              >
                Claim Warranty Service
              </button>
            )}
            
            <div className="transfer-section">
              <h3>Transfer Warranty</h3>
              <form onSubmit={handleTransfer} className="transfer-form">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Recipient Address (0x...)"
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isTransferring}
                    className="action-button transfer"
                  >
                    {isTransferring ? 'Transferring...' : 'Transfer'}
                  </button>
                </div>
                
                {transferError && <div className="error-message">{transferError}</div>}
                {transferSuccess && <div className="success-message">{transferSuccess}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarrantyDetails;