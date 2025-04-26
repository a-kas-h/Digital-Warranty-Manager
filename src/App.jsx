// src/App.jsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ConnectWallet from './components/ConnectWallet';
import Home from './pages/Home';
import IssueWarranty from './pages/IssueWarranty';
import MyWarranties from './pages/MyWarranties';
import WarrantyDetails from './pages/WarrantyDetails';
import './App.css';

function App() {
  const [account, setAccount] = useState('');

  const handleConnect = (address) => {
    setAccount(address);
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="app-brand">
            <Link to="/">Digital Warranty Manager</Link>
          </div>
          
          <nav className="app-nav">
            <Link to="/">Home</Link>
            <Link to="/issue">Issue Warranty</Link>
            <Link to="/my-warranties">My Warranties</Link>
          </nav>
          
          <div className="app-wallet">
            <ConnectWallet onConnect={handleConnect} />
          </div>
        </header>
        
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home account={account} />} />
            <Route path="/issue" element={<IssueWarranty account={account} />} />
            <Route path="/my-warranties" element={<MyWarranties account={account} />} />
            <Route path="/warranty/:tokenId" element={<WarrantyDetails account={account} />} />
          </Routes>
        </main>
        
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} Warranty NFT Manager by Akash Saminathan</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;