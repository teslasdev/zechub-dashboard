"use client";

import { useState, useEffect } from "react";
import Layout from "../layouts/Layout";
import { viewingKeyManager, ViewingKey, ShieldedTransaction } from "../lib/zcash/viewing-keys";
import { blockExplorer, Transaction } from "../lib/zcash/block-explorer";

const Page = () => {
  const [viewingKey, setViewingKey] = useState("");
  const [keyType, setKeyType] = useState<ViewingKey['type']>("sapling");
  const [keyLabel, setKeyLabel] = useState("");
  const [keys, setKeys] = useState<Array<{ id: string; type: string; label?: string }>>([]);
  const [transactions, setTransactions] = useState<ShieldedTransaction[]>([]);
  const [searchTxid, setSearchTxid] = useState("");
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null);
  const [searching, setSearching] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [activeTab, setActiveTab] = useState<'keys' | 'search' | 'scan'>('keys');

  useEffect(() => {
    viewingKeyManager.loadFromSession();
    setKeys(viewingKeyManager.getKeys());
  }, []);

  const handleAddKey = () => {
    if (!viewingKey.trim()) {
      alert("Please enter a viewing key");
      return;
    }

    const success = viewingKeyManager.addKey(viewingKey, keyType, keyLabel || undefined);
    if (success) {
      setKeys(viewingKeyManager.getKeys());
      setViewingKey("");
      setKeyLabel("");
      alert("Viewing key added successfully! You can now scan for transactions.");
    } else {
      alert("Invalid viewing key format. Please check and try again.");
    }
  };

  const handleRemoveKey = (keyId: string) => {
    viewingKeyManager.removeKey(keyId);
    setKeys(viewingKeyManager.getKeys());
  };

  const handleSearchTransaction = async () => {
    if (!searchTxid.trim()) return;

    setSearching(true);
    setCurrentTx(null);

    try {
      const tx = await blockExplorer.getTransaction(searchTxid);
      setCurrentTx(tx);
    } catch (error) {
      alert("Transaction not found or network error");
    } finally {
      setSearching(false);
    }
  };

  const handleScanBlockchain = async () => {
    if (keys.length === 0) {
      alert("Please add a viewing key first");
      return;
    }

    setScanning(true);
    setTransactions([]);

    try {
      const latestHeight = await blockExplorer.getLatestBlockHeight();
      
      if (!latestHeight) {
        alert("Failed to fetch blockchain data from Blockchair");
        return;
      }
      
      alert(`⚠️ Blockchain Scanning Limitation\n\nBlockchair API doesn't provide the cryptographic data needed to decrypt shielded transactions with viewing keys.\n\nTo use this feature, you would need:\n• A full Zcash node with RPC access\n• Or a specialized API that provides shielded pool data\n• Or use Zcash-specific wallets like Ywallet or Zingo\n\nLatest block height: ${latestHeight.toLocaleString()}\n\nYou can still use the "Search TX" tab to look up any transaction by ID!`);
      
    } catch (error) {
      console.error("Scan error:", error);
      alert("Error connecting to Blockchair API");
    } finally {
      setScanning(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto space-y-6 sm:space-y-8 px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl md:text-[28px] plus-jakarta-sans font-bold">
              Privacy-Preserving Block Explorer
            </h3>
            <p className="text-sm sm:text-base text-[#B7B9BD]">
              View your shielded transactions with client-side decryption
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="text-xs sm:text-sm">
              <p className="text-green-400 font-semibold mb-1">🔐 100% Client-Side Privacy • Zcash Testnet</p>
              <p className="text-gray-400">
                Your viewing keys never leave your device. All decryption happens in your browser.
                Currently connected to <span className="text-green-300 font-semibold">Zcash Testnet</span> for safe testing.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base transition ${
              activeTab === 'keys'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Viewing Keys
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base transition ${
              activeTab === 'search'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Search TX
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base transition ${
              activeTab === 'scan'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Transactions
          </button>
        </div>

        {/* Viewing Keys Tab */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 sm:p-6">
              <h4 className="text-lg sm:text-xl font-bold mb-4">Add Viewing Key</h4>
              
              {/* Testnet Info */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                <p className="text-xs sm:text-sm text-blue-300">
                  <strong>💡 Using Testnet:</strong> Get testnet TAZ from the{' '}
                  <a 
                    href="https://faucet.testnet.z.cash/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-200"
                  >
                    Zcash Testnet Faucet
                  </a>
                  {' '}and export your viewing key from your testnet wallet (Ywallet, Zingo, etc.)
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Key Type
                  </label>
                  <select
                    value={keyType}
                    onChange={(e) => setKeyType(e.target.value as ViewingKey['type'])}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="sapling">Sapling Viewing Key</option>
                    <option value="unified">Unified Viewing Key</option>
                    <option value="orchard">Orchard Viewing Key</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Viewing Key
                  </label>
                  <input
                    type="text"
                    value={viewingKey}
                    onChange={(e) => setViewingKey(e.target.value)}
                    placeholder="Enter View Key"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={keyLabel}
                    onChange={(e) => setKeyLabel(e.target.value)}
                    placeholder="My main wallet"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleAddKey}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition"
                >
                  Add Viewing Key
                </button>
              </div>
            </div>

            {/* Stored Keys */}
            {keys.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                <h4 className="text-lg sm:text-xl font-bold mb-4">Stored Keys</h4>
                <div className="space-y-3">
                  {keys.map((key) => (
                    <div
                      key={key.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-800/50 p-3 sm:p-4 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm sm:text-base">
                          {key.label || 'Unnamed Key'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Type: {key.type} • ID: {key.id}...
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveKey(key.id)}
                        className="text-red-400 hover:text-red-300 text-xs sm:text-sm px-3 py-1 bg-red-900/20 rounded transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Transaction Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 sm:p-6">
              <h4 className="text-lg sm:text-xl font-bold mb-4">Search Transaction</h4>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={searchTxid}
                  onChange={(e) => setSearchTxid(e.target.value)}
                  placeholder="Enter transaction ID..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500 font-mono"
                  disabled={searching}
                />
                <button
                  onClick={handleSearchTransaction}
                  disabled={searching || !searchTxid.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {searching && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {currentTx && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                <h4 className="text-lg sm:text-xl font-bold mb-4">Transaction Details</h4>
                
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="text-gray-400 font-semibold min-w-[120px]">TXID:</span>
                    <span className="text-white font-mono break-all">{currentTx.txid}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="text-gray-400 font-semibold min-w-[120px]">Block Height:</span>
                    <span className="text-white">{currentTx.height.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="text-gray-400 font-semibold min-w-[120px]">Timestamp:</span>
                    <span className="text-white">
                      {new Date(currentTx.time * 1000).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="text-gray-400 font-semibold min-w-[120px]">Type:</span>
                    <span className={`inline-block px-3 py-1 rounded text-xs sm:text-sm ${
                      currentTx.hasShielded
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {currentTx.hasShielded ? '🔒 Shielded' : 'Transparent'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="text-gray-400 font-semibold min-w-[120px]">Version:</span>
                    <span className="text-white">{currentTx.version}</span>
                  </div>
                  
                  {currentTx.vShieldedSpend && currentTx.vShieldedSpend.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <span className="text-gray-400 font-semibold min-w-[120px]">Shielded Spends:</span>
                      <span className="text-green-400">{currentTx.vShieldedSpend.length}</span>
                    </div>
                  )}
                  
                  {currentTx.vShieldedOutput && currentTx.vShieldedOutput.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <span className="text-gray-400 font-semibold min-w-[120px]">Shielded Outputs:</span>
                      <span className="text-green-400">{currentTx.vShieldedOutput.length}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="text-gray-400 font-semibold min-w-[120px]">Transparent Inputs:</span>
                    <span className="text-white">{currentTx.vin.length}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="text-gray-400 font-semibold min-w-[120px]">Transparent Outputs:</span>
                    <span className="text-white">{currentTx.vout.length}</span>
                  </div>
                  
                  {currentTx.valueBalance !== undefined && currentTx.valueBalance !== 0 && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <span className="text-gray-400 font-semibold min-w-[120px]">Value Balance:</span>
                      <span className="text-white">{(currentTx.valueBalance / 100000000).toFixed(8)} ZEC</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="text-gray-400 font-semibold min-w-[120px]">Lock Time:</span>
                    <span className="text-white">{currentTx.locktime}</span>
                  </div>
                </div>

                {/* Transparent Inputs Details */}
                {currentTx.vin.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-md sm:text-lg font-bold mb-3 text-blue-400">Inputs ({currentTx.vin.length})</h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {currentTx.vin.map((input: any, idx: number) => (
                        <div key={idx} className="bg-gray-800/50 p-3 rounded text-xs sm:text-sm">
                          <div className="flex gap-2 mb-1">
                            <span className="text-gray-400">#{idx}:</span>
                            <span className="text-gray-300 font-mono break-all">
                              {input.recipient || input.addresses?.[0] || 'N/A'}
                            </span>
                          </div>
                          {input.value !== undefined && (
                            <div className="text-green-400">
                              Value: {(input.value / 100000000).toFixed(8)} ZEC
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transparent Outputs Details */}
                {currentTx.vout.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-md sm:text-lg font-bold mb-3 text-purple-400">Outputs ({currentTx.vout.length})</h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {currentTx.vout.map((output: any, idx: number) => (
                        <div key={idx} className="bg-gray-800/50 p-3 rounded text-xs sm:text-sm">
                          <div className="flex gap-2 mb-1">
                            <span className="text-gray-400">#{idx}:</span>
                            <span className="text-gray-300 font-mono break-all">
                              {output.recipient || output.addresses?.[0] || output.scriptPubKey?.addresses?.[0] || 'N/A'}
                            </span>
                          </div>
                          {output.value !== undefined && (
                            <div className="text-green-400">
                              Value: {(output.value / 100000000).toFixed(8)} ZEC
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy Info */}
                {currentTx.hasShielded && (
                  <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-xs sm:text-sm text-green-300">
                      <strong>🔒 Privacy Note:</strong> This transaction uses shielded pools. 
                      To view amounts and memos, you need the corresponding viewing key.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* My Transactions Tab */}
        {activeTab === 'scan' && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 sm:p-6">
              <h4 className="text-lg sm:text-xl font-bold mb-4">Blockchain Scanning</h4>
              
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-300 mb-2">
                  <strong>⚠️ Scanning Limitation:</strong>
                </p>
                <p className="text-xs sm:text-sm text-yellow-200">
                  Blockchair API doesn't provide the cryptographic data needed to decrypt shielded transactions with viewing keys.
                  For full viewing key functionality, you would need a full Zcash node or specialized wallet software like Ywallet or Zingo.
                </p>
              </div>
              
              <p className="text-sm sm:text-base text-gray-400 mb-4">
                You can still use the <strong>"Search TX"</strong> tab to look up any transaction by ID 
                and view its structure (transparent/shielded components).
              </p>

              <button
                onClick={handleScanBlockchain}
                disabled={scanning || keys.length === 0}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scanning ? 'Scanning...' : 'Start Scan'}
              </button>

              {keys.length === 0 && (
                <p className="text-yellow-400 text-xs sm:text-sm mt-2">
                  ⚠️ Please add a viewing key first
                </p>
              )}
            </div>

            {/* Transactions List */}
            {transactions.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                <h4 className="text-lg sm:text-xl font-bold mb-4">
                  Your Transactions ({transactions.length})
                </h4>
                
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.txid}
                      className="bg-gray-800/50 p-3 sm:p-4 rounded-lg"
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-2 mb-2">
                        <span className={`font-semibold text-sm sm:text-base ${
                          tx.type === 'received' ? 'text-green-400' : 'text-orange-400'
                        }`}>
                          {tx.type === 'received' ? '↓ Received' : '↑ Sent'}
                        </span>
                        <span className="text-lg sm:text-xl font-bold">
                          {tx.amount.toFixed(4)} ZEC
                        </span>
                      </div>
                      
                      <div className="text-xs sm:text-sm text-gray-400 space-y-1">
                        <p>Block: {tx.blockHeight}</p>
                        <p>Address: {tx.address}</p>
                        {tx.memo && <p className="text-gray-300">📝 {tx.memo}</p>}
                        <p className="font-mono text-xs break-all">{tx.txid}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 sm:p-6">
            <div className="text-blue-400 text-2xl sm:text-3xl mb-3">🔑</div>
            <h5 className="font-semibold text-sm sm:text-base mb-2">Your Keys, Your Data</h5>
            <p className="text-xs sm:text-sm text-gray-400">
              Viewing keys are stored in your browser session only. Never transmitted to any server.
            </p>
          </div>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 sm:p-6">
            <div className="text-purple-400 text-2xl sm:text-3xl mb-3">🔒</div>
            <h5 className="font-semibold text-sm sm:text-base mb-2">Client-Side Decryption</h5>
            <p className="text-xs sm:text-sm text-gray-400">
              All cryptographic operations happen in your browser. Zero trust required.
            </p>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 sm:p-6">
            <div className="text-green-400 text-2xl sm:text-3xl mb-3">🛡️</div>
            <h5 className="font-semibold text-sm sm:text-base mb-2">Cypherpunk Ethos</h5>
            <p className="text-xs sm:text-sm text-gray-400">
              True privacy requires no compromise. View your data without exposing it.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Page;