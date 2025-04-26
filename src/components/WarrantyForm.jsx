// src/components/WarrantyForm.jsx
import { useState } from 'react';
import { ethers } from 'ethers';
import { uploadToIPFS } from '../utils/ipfs';
import { getContract } from '../utils/contract';

const WarrantyForm = () => {
  const [formData, setFormData] = useState({
    recipient: '',
    productId: '',
    productName: '',
    brand: '',
    validityInDays: 365,
    productImage: null,
    additionalInfo: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate form data
      if (!ethers.utils.isAddress(formData.recipient)) {
        throw new Error('Invalid recipient address');
      }
      
      if (!formData.productId || !formData.productName || !formData.brand) {
        throw new Error('Please fill in all required fields');
      }

      // Upload warranty metadata to IPFS
      const metadata = {
        name: `${formData.brand} ${formData.productName} Warranty`,
        description: `Warranty for ${formData.productId}`,
        product: {
          id: formData.productId,
          name: formData.productName,
          brand: formData.brand
        },
        validityInDays: parseInt(formData.validityInDays),
        additionalInfo: formData.additionalInfo,
        image: formData.productImage ? await uploadToIPFS(formData.productImage) : null
      };
      
      const metadataURI = await uploadToIPFS(JSON.stringify(metadata));
      
      // Get contract with signer
      const contract = await getContract(true);
      
      // Issue warranty
      const tx = await contract.issueWarranty(
        formData.recipient,
        formData.productId,
        formData.productName,
        formData.brand,
        parseInt(formData.validityInDays),
        metadataURI
      );
      
      setSuccess('Warranty transaction submitted. Please wait for confirmation...');
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Find the WarrantyIssued event
      const event = receipt.events.find(event => event.event === 'WarrantyIssued');
      const tokenId = event.args.tokenId.toString();
      
      setSuccess(`Warranty successfully issued! Token ID: ${tokenId}`);
      
      // Reset form
      setFormData({
        recipient: '',
        productId: '',
        productName: '',
        brand: '',
        validityInDays: 365,
        productImage: null,
        additionalInfo: ''
      });
    } catch (err) {
      console.error("Error issuing warranty:", err);
      setError(err.message || 'Failed to issue warranty. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="warranty-form">
      <h2>Issue New Warranty</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address</label>
          <input
            id="recipient"
            name="recipient"
            type="text"
            value={formData.recipient}
            onChange={handleChange}
            placeholder="0x..."
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="productId">Product ID</label>
          <input
            id="productId"
            name="productId"
            type="text"
            value={formData.productId}
            onChange={handleChange}
            placeholder="e.g. ABC123456"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="productName">Product Name</label>
          <input
            id="productName"
            name="productName"
            type="text"
            value={formData.productName}
            onChange={handleChange}
            placeholder="e.g. Smartphone X"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="brand">Brand</label>
          <input
            id="brand"
            name="brand"
            type="text"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g. Tech Company Inc."
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="validityInDays">Validity (days)</label>
          <input
            id="validityInDays"
            name="validityInDays"
            type="number"
            min="1"
            value={formData.validityInDays}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="productImage">Product Image</label>
          <input
            id="productImage"
            name="productImage"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="additionalInfo">Additional Information</label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            placeholder="Enter any additional warranty information..."
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? 'Processing...' : 'Issue Warranty'}
        </button>
      </form>
    </div>
  );
};

export default WarrantyForm;