// src/utils/ipfs.js
import axios from 'axios';

// Set up Pinata API keys
// You should store these in environment variables in a production environment
const PINATA_API_KEY = '67710e8be4393ff36b0f';
const PINATA_SECRET_API_KEY = 'cc52ce9edd52f415effafd9cd83d6e5971aaa03d89414411dc201f5f01208ce3';

// Upload JSON metadata to IPFS via Pinata
export const uploadJSONToIPFS = async (JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  
  // Make sure the body is a string
  const data = JSONBody;
  
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      }
    });
    
    return `ipfs://${response.data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading JSON to IPFS: ", error);
    throw new Error("Failed to upload JSON to IPFS");
  }
};

// Upload file to IPFS via Pinata
export const uploadFileToIPFS = async (file) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  
  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  
  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }
  });
  formData.append('pinataMetadata', metadata);
  
  // Configure pinning options
  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', pinataOptions);
  
  try {
    const response = await axios.post(url, formData, {
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      }
    });
    
    return `ipfs://${response.data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading file to IPFS: ", error);
    throw new Error("Failed to upload file to IPFS");
  }
};

// Convenience function to handle both file and JSON uploads
export const uploadToIPFS = async (content) => {
  if (typeof content === 'string') {
    try {
      // If it's a JSON string, parse it and upload as JSON
      const jsonData = JSON.parse(content);
      return await uploadJSONToIPFS(jsonData);
    } catch (error) {
      // If it's not valid JSON, upload as a file
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], 'data.txt', { type: 'text/plain' });
      return await uploadFileToIPFS(file);
    }
  } else if (content instanceof File) {
    // If it's a File object, upload as a file
    return await uploadFileToIPFS(content);
  } else if (typeof content === 'object') {
    // If it's an object, upload as JSON
    return await uploadJSONToIPFS(content);
  } else {
    throw new Error('Unsupported content type for IPFS upload');
  }
};

// Function to retrieve data from IPFS
export const getFromIPFS = async (ipfsHash) => {
  try {
    // Convert ipfs:// URL to gateway URL
    const url = ipfsHash.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error retrieving from IPFS: ", error);
    throw new Error("Failed to retrieve data from IPFS");
  }
};