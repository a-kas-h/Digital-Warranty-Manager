// src/components/ConnectWallet.jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ConnectWallet = ({ onConnect }) => {
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already connected
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (onConnect) onConnect(accounts[0]);
        } else {
          setAccount('');
        }
      });
    }
  }, [onConnect]);

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (onConnect) onConnect(accounts[0]);
        }
      }
    } catch (err) {
      console.error("Failed to check wallet connection:", err);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        
        // Check if on Sepolia testnet (chain ID 11155111)
        if (network.chainId !== 11155111) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // Hex value of 11155111
            });
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io/']
                  }]
                });
              } catch (addError) {
                setError('Could not add the Sepolia network to your wallet');
              }
            } else {
              setError('Failed to switch to the Sepolia network');
            }
          }
        }
        
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        if (onConnect) onConnect(address);
      } else {
        setError('MetaMask is not installed. Please install it to use this app.');
      }
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="connect-wallet">
      {!account ? (
        <button 
          onClick={connectWallet} 
          disabled={loading}
          className="connect-button"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="account-info">
          <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ConnectWallet;