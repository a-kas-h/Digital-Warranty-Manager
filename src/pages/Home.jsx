// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { getContract } from '../utils/contract';

const Home = ({ account }) => {
  const [stats, setStats] = useState({
    totalWarranties: 0,
    activeWarranties: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      fetchStats();
    }
  }, [account]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      
      // Get the current token ID counter
      const tokenIdCounter = await contract.getTotalSupply();
      const totalWarranties = tokenIdCounter.toNumber();      
      let activeCount = 0;
      for (let i = 1; i <= totalWarranties; i++) {
        try {
          const isValid = await contract.isWarrantyValid(i);
          if (isValid) activeCount++;
        } catch (err) {
          // Skip tokens that might have been burned or don't exist
          console.log(`Token ${i} might not exist`);
        }
      }
      
      setStats({
        totalWarranties,
        activeWarranties: activeCount
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Blockchain-Powered Warranty Management</h1>
        <p>Issue, track, and manage product warranties as NFTs on Ethereum</p>
        
        {!account ? (
          <div className="cta">
            <p>Connect your wallet to get started</p>
          </div>
        ) : (
          <div className="cta-buttons">
            <Link to="/issue" className="cta-button primary">Issue New Warranty</Link>
            <Link to="/my-warranties" className="cta-button secondary">View My Warranties</Link>
          </div>
        )}
      </section>
      
      {account && (
        <section className="stats">
          <h2>Platform Statistics</h2>
          {loading ? (
            <p>Loading statistics...</p>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Warranties</h3>
                <p className="stat-value">{stats.totalWarranties}</p>
              </div>
              <div className="stat-card">
                <h3>Active Warranties</h3>
                <p className="stat-value">{stats.activeWarranties}</p>
              </div>
            </div>
          )}
        </section>
      )}
      
      <section className="features">
        <h2>Why Use NFT Warranties?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Immutable Proof</h3>
            <p>Blockchain-based warranties can't be altered or forged, ensuring authenticity.</p>
          </div>
          <div className="feature-card">
            <h3>Easy Transfers</h3>
            <p>Transfer warranty ownership along with the product when you sell or gift items.</p>
          </div>
          <div className="feature-card">
            <h3>Never Lose Receipt</h3>
            <p>Digital warranties stay in your wallet - no more searching for paper receipts.</p>
          </div>
          <div className="feature-card">
            <h3>Verify Status Instantly</h3>
            <p>Check warranty validity instantly without contacting customer service. NFT's are proof of ownership</p>
          </div>
        </div>
      </section>
      
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Connect Wallet</h3>
            <p>Connect your Ethereum wallet to get started. Metamask is best</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Issue Warranty</h3>
            <p>Enter product details and issue a new warranty as an NFT</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Manage & Claim</h3>
            <p>View, transfer, or claim your warranties when needed</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;