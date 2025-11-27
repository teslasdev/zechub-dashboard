import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">ZecHub</h3>
                        <p className="text-gray-400">
                            Community-driven platform for Zcash resources and information.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="/" className="text-gray-400 hover:text-white transition">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/about" className="text-gray-400 hover:text-white transition">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="/docs" className="text-gray-400 hover:text-white transition">
                                    Documentation
                                </a>
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Community</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="https://github.com/zechub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                                    GitHub
                                </a>
                            </li>
                            <li>
                                <a href="https://twitter.com/zechub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                                    Twitter
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} ZecHub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}