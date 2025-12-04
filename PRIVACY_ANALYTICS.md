# Privacy-Preserving Analytics with Nillion

This implementation demonstrates a privacy-preserving data and analytics platform using **Nillion's nilDB (private storage)** and **nilCC (confidential compute)**.

## 🔐 Overview

The privacy analytics feature allows you to:
- Store user analytics data **privately** using encrypted secret sharing
- Compute **aggregate statistics** without exposing individual user data
- Maintain **user sovereignty** with fine-grained access control
- Ensure **no single party** can access raw data

## 🏗️ Architecture

### Components

1. **nilDB (Private Storage)**
   - Encrypts data client-side
   - Secret-shares across multiple Nillion nodes
   - No single node can reconstruct the data
   - User-owned collections with ACLs

2. **nilCC (Confidential Compute)**
   - Computes on encrypted data shares
   - Produces aggregate results without decryption
   - Preserves privacy while enabling analytics

3. **Access Control**
   - Fine-grained permissions (read/write/execute)
   - Users can grant, revoke, or delete access
   - Builder/application access is explicitly granted

## 📁 File Structure

```
src/app/
├── lib/nillion/
│   ├── config.ts          # Nillion configuration
│   ├── types.ts           # TypeScript types
│   └── client.ts          # Nillion service client
├── privacy-analytics/
│   ├── page.tsx           # Privacy analytics page
│   └── layout.tsx         # Layout wrapper
└── layouts/
    └── Header.tsx         # Navigation (updated)
```

## 🚀 Setup Instructions

### 1. Get Nillion API Keys

Visit [subscription.nillion.com](https://subscription.nillion.com/) and:
1. Create a testnet public/private key pair
2. Fund your account with testnet NIL from the [faucet](https://faucet.testnet.nillion.com/)
3. Subscribe to `nilDB`
4. Save your private key (hex format)

### 2. Configure Environment

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Add your Nillion private key:

```env
NEXT_PUBLIC_NILLION_BUILDER_PRIVATE_KEY=your-hex-private-key-here
```

### 3. Install Dependencies

Dependencies are already installed. If needed:

```bash
npm install @nillion/secretvaults@latest @nillion/nuc dotenv
```

### 4. Run the Application

```bash
npm run dev
```

Navigate to `/privacy-analytics` to see the privacy analytics dashboard.

## 🎯 Features Implemented

### Private Data Storage
- User analytics data is encrypted client-side
- Data is secret-shared across Nillion network nodes
- Each record has individual access controls
- Users maintain full ownership

### Data Schema
```typescript
{
  userId: string;           // User identifier
  timestamp: string;        // When data was collected
  pageViews: encrypted;     // Private: number of page views
  sessionDuration: encrypted; // Private: session duration
  interactions: encrypted;  // Private: user interactions
  category: string;         // Public: data category
  platform: string;         // Public: platform type
}
```

### Confidential Computation
- Aggregate statistics computed on encrypted data
- Individual records never exposed
- Only aggregate results returned
- Preserves user privacy

### User Interface
- Status indicators for privacy layer
- One-click private data storage demo
- Aggregate analytics dashboard
- Configuration error handling

## 🔧 Technical Details

### Encryption Flow

1. **Client-Side Encryption**: Data encrypted before leaving the browser
2. **Secret Sharing**: Encrypted data split using Shamir's Secret Sharing
3. **Distribution**: Shares distributed across multiple Nillion nodes
4. **Computation**: Aggregates computed on shares without reconstruction
5. **Results**: Only aggregate statistics returned

### Access Control

Users can grant different permission levels:
- **Read**: View encrypted data (with proper keys)
- **Write**: Modify existing data
- **Execute**: Run computations on data

### Security Guarantees

- ✅ No single node can access raw data
- ✅ Client-side encryption before transmission
- ✅ User-controlled access permissions
- ✅ Revocable access grants
- ✅ Audit trail of data access

## 🎨 UI Components

### Status Banner
Shows the privacy layer status and encryption state.

### Info Cards
Explains nilDB, nilCC, and user control features.

### Demo Section
Interactive button to store sample analytics data privately.

### Analytics Dashboard
Displays confidential aggregate statistics without exposing individual data.

## 📊 Use Cases

This privacy-preserving analytics platform is ideal for:

1. **Financial Analytics**: Track user behavior without exposing transactions
2. **Health Data**: Aggregate health metrics while maintaining HIPAA compliance
3. **User Analytics**: Understand usage patterns without compromising privacy
4. **Compliance**: Meet GDPR/CCPA requirements with privacy-by-design
5. **Blockchain Analytics**: Privacy-preserving metrics for Zcash users

## 🔮 Future Enhancements

- [ ] Implement actual nilCC computations (currently simulated)
- [ ] Add query builder for custom analytics
- [ ] Implement user authentication and key management
- [ ] Add data visualization charts
- [ ] Create permission management UI
- [ ] Add data export with differential privacy
- [ ] Implement time-series analysis
- [ ] Add multi-party computation examples

## 📚 Resources

- [Nillion Docs](https://docs.nillion.com/)
- [nilDB Quickstart](https://docs.nillion.com/build/private-storage/quickstart)
- [Nillion GitHub](https://github.com/NillionNetwork)
- [Nillion Discord](https://discord.com/invite/nillionnetwork)

## ⚠️ Important Notes

### Development vs Production

This is a **demonstration implementation**. For production:

1. **Move sensitive operations to API routes** (not client-side)
2. **Implement proper key management** (use secure key storage)
3. **Add user authentication** (proper identity management)
4. **Implement actual nilCC computations** (not simulated)
5. **Add error recovery and retry logic**
6. **Implement proper logging and monitoring**

### Node Version

Nillion SDK requires Node.js >= 23. If you're on v20.8.1, consider upgrading:

```bash
nvm install 23
nvm use 23
```

Or use the terminal with Node 21 already configured:
```bash
nvm use 21
```

### Security

- Never commit `.env.local` to version control
- Keep your Nillion private key secure
- Use environment variables for all secrets
- Implement proper access controls in production

## 🤝 Contributing

This implementation can be extended with:
- Additional privacy-preserving algorithms
- More complex analytical queries
- Real-time data streaming
- Multi-tenant support
- Advanced visualization

## 📄 License

This implementation is part of the Zechlub Dashboard project.

---

**Built with Nillion's privacy infrastructure** 🔐
