/**
 * Nillion API Route - Initialize Service
 * 
 * POST /api/nillion/init
 * Initializes Nillion service, registers builder, creates collection
 */

import { NextRequest, NextResponse } from 'next/server';
import { Signer, PayerBuilder, NilauthClient } from '@nillion/nuc';
import { SecretVaultBuilderClient } from '@nillion/secretvaults';
import crypto from 'crypto';

const NILLION_CONFIG = {
  NILCHAIN_URL: process.env.NILCHAIN_URL || 'http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz',
  NILAUTH_URL: process.env.NILAUTH_URL || 'https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz',
  NILDB_NODES: process.env.NILDB_NODES 
    ? process.env.NILDB_NODES.split(',')
    : [
        'https://nildb-stg-n1.nillion.network',
        'https://nildb-stg-n2.nillion.network',
        'https://nildb-stg-n3.nillion.network'
      ],
  BUILDER_PRIVATE_KEY: process.env.NILLION_BUILDER_PRIVATE_KEY,
};

const COLLECTION_ID = 'zcash-analytics-collection';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS handler for preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GET endpoint for health check
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: 'ok',
      message: 'Nillion Init API is available',
      config: {
        hasPrivateKey: !!NILLION_CONFIG.BUILDER_PRIVATE_KEY,
        nilchainUrl: NILLION_CONFIG.NILCHAIN_URL,
        nilauthUrl: NILLION_CONFIG.NILAUTH_URL,
        nodeCount: NILLION_CONFIG.NILDB_NODES.length,
        nodeEnv: process.env.NODE_ENV,
      },
      usage: 'POST to this endpoint to initialize Nillion service',
    },
    { headers: corsHeaders }
  );
}

export async function POST(request: NextRequest) {
  console.log('🔵 Nillion Init API called');
  console.log('Environment check:', {
    hasPrivateKey: !!NILLION_CONFIG.BUILDER_PRIVATE_KEY,
    nilchainUrl: NILLION_CONFIG.NILCHAIN_URL,
    nilauthUrl: NILLION_CONFIG.NILAUTH_URL,
    nodeCount: NILLION_CONFIG.NILDB_NODES.length,
    nodeEnv: process.env.NODE_ENV,
  });
  
  try {
    if (!NILLION_CONFIG.BUILDER_PRIVATE_KEY) {
      console.error('❌ Missing NILLION_BUILDER_PRIVATE_KEY environment variable');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing NILLION_BUILDER_PRIVATE_KEY - Configure in Vercel environment variables',
          hint: 'Add NILLION_BUILDER_PRIVATE_KEY to your Vercel project settings'
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // 1. Create signer from private key (without 0x prefix)
    const privateKey = NILLION_CONFIG.BUILDER_PRIVATE_KEY.replace(/^0x/, '');
    const signer = Signer.fromPrivateKey(privateKey);
    const builderDid = signer.getDid().toString();

    // 2. Create payer for transaction fees
    const payerBuilder = await PayerBuilder.fromPrivateKey(privateKey);
    const payer = await payerBuilder
      .chainUrl(NILLION_CONFIG.NILCHAIN_URL)
      .build();

    // 3. Initialize Nilauth client for authentication
    const nilauthClient = await NilauthClient.create({
      baseUrl: NILLION_CONFIG.NILAUTH_URL,
      payer,
    });

    // 4. Create SecretVault builder client
    const builderClient = await SecretVaultBuilderClient.from({
      signer,
      nilauthClient: nilauthClient as any, // Type mismatch between package versions
      dbs: NILLION_CONFIG.NILDB_NODES,
    });

    // 5. Check subscription status first
    const subscriptionStatus = await builderClient.subscriptionStatus();
    console.log('Subscription status:', subscriptionStatus);

    // 6. Refresh authentication token
    try {
      await builderClient.refreshRootToken();
    } catch (authError: any) {
      // If auth fails (412, 401), fall back to demo mode
      if (authError?.response?.status === 412 || authError?.response?.status === 401 || 
          authError?._tag === 'NilauthUnreachable') {
        console.warn('⚠️  Authentication failed (412/401), falling back to demo mode');
        return NextResponse.json(
          { 
            success: true, 
            demo: true,
            message: 'Using demo mode - Nillion SDK authentication unavailable'
          },
          { headers: corsHeaders }
        );
      }
      throw authError;
    }

    // 7. Register as builder (or verify existing registration)
    try {
      await builderClient.register({
        did: builderDid,
        name: 'zcash-privacy-analytics',
      });
      console.log('Builder registered successfully');
    } catch (error: any) {
      // Registration might fail if already registered - this is okay
      if (error.message?.includes('already registered') || 
          error.message?.includes('exists') ||
          (Array.isArray(error) && error.some((e: any) => e.error?.status === 400))) {
        console.log('Builder already registered (continuing...)');
      } else {
        console.error('Registration error:', error);
        throw error;
      }
    }

    // 8. Try to GET existing collections first (read operation, less strict permissions)
    let collectionId: string;
    try {
      console.log('Fetching existing collections...');
      const collections = await builderClient.readCollections();
      console.log('Collections found:', collections);
      
      const existing = collections.data.find((c: any) => c.name === COLLECTION_ID);
      if (existing) {
        console.log('✓ Found existing collection:', existing.id);
        collectionId = existing.id;
      } else {
        // Collection doesn't exist, need to create it
        console.log('Collection not found, creating new one...');
        collectionId = crypto.randomUUID();
        const collectionSchema = {
          _id: collectionId,
          type: 'standard' as const,
          name: COLLECTION_ID,
          schema: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            timestamp: { type: 'string' },
            pageViews: { type: 'integer' },
            sessionDuration: { type: 'integer' },
            interactions: { type: 'integer' },
            category: { type: 'string' },
            platform: { type: 'string' },
          },
        };
        
        const result = await builderClient.createCollection(collectionSchema);
        console.log('✓ Analytics collection created:', result);
      }
    } catch (error: any) {
      // Check for 401 Unauthorized errors - fall back to demo mode
      if (Array.isArray(error) && error.some((e: any) => e.error?.status === 401)) {
        console.warn('⚠️  Unauthorized error accessing collections, falling back to demo mode');
        return NextResponse.json(
          { 
            success: true, 
            demo: true,
            message: 'Using demo mode - Nillion SDK authorization failed'
          },
          { headers: corsHeaders }
        );
      }
      
      console.error('Collection access error:', error);
      // Fall back to demo mode on any collection error
      console.warn('⚠️  Collection access failed, falling back to demo mode');
      return NextResponse.json(
        { 
          success: true, 
          demo: true,
          message: 'Using demo mode - Nillion SDK collection access failed'
        },
        { headers: corsHeaders }
      );
    }

    console.log('Nillion service initialized successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'Nillion service initialized',
        builderDid,
        collectionId,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('❌ Nillion init error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      full: JSON.stringify(error, null, 2)
    });
    
    // If we have auth/permission issues, fall back to demo mode
    if (error instanceof Error && 
        (error.message?.includes('Unauthorized') ||
         error.message?.includes('412') ||
         error.message?.includes('Precondition Failed'))) {
      console.log('⚠️  Nillion SDK auth issue - falling back to demo mode');
      console.log('💡 To use real Nillion: subscribe at https://subscription.nillion.com/');
      
      // Return success in demo mode
      return NextResponse.json(
        {
          success: true,
          message: 'Demo mode - Nillion subscription required for production',
          builderDid: 'demo-did',
          collectionId: 'demo-collection-id',
          demo: true,
        },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
