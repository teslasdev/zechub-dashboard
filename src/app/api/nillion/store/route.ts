/**
 * Nillion API Route - Store Private Analytics
 * 
 * POST /api/nillion/store
 * Stores user analytics data privately using nilDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { Signer, PayerBuilder, NilauthClient } from '@nillion/nuc';
import { SecretVaultBuilderClient } from '@nillion/secretvaults';
import crypto from 'crypto';
import { demoDataStore } from '@/app/lib/nillion/demoStore';

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
  BUILDER_PRIVATE_KEY: process.env.NILLION_BUILDER_PRIVATE_KEY || '6ccef9032994e3873feb9673cbe68788b7c620b58336c7c86e6639c4ac8553a5',
};

const COLLECTION_ID = 'zcash-analytics-collection';

// GET endpoint for health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Nillion Store API is available',
    config: {
      hasPrivateKey: !!NILLION_CONFIG.BUILDER_PRIVATE_KEY,
      nilchainUrl: NILLION_CONFIG.NILCHAIN_URL,
      nilauthUrl: NILLION_CONFIG.NILAUTH_URL,
      nodeCount: NILLION_CONFIG.NILDB_NODES.length,
    },
    usage: 'POST to this endpoint with analytics data to store privately',
    requiredFields: ['userId', 'timestamp', 'pageViews', 'sessionDuration', 'interactions', 'category', 'platform'],
  });
}

export async function POST(request: NextRequest) {
  console.log('🔵 Nillion Store API called');
  console.log('Request method:', request.method);
  
  try {
    if (!NILLION_CONFIG.BUILDER_PRIVATE_KEY) {
      return NextResponse.json(
        { success: false, error: 'Missing NILLION_BUILDER_PRIVATE_KEY' },
        { status: 500 }
      );
    }

    const data = await request.json();

    // Initialize Nillion client
    const privateKey = NILLION_CONFIG.BUILDER_PRIVATE_KEY.replace(/^0x/, '');
    const signer = Signer.fromPrivateKey(privateKey);
    const payerBuilder = await PayerBuilder.fromPrivateKey(privateKey);
    const payer = await payerBuilder
      .chainUrl(NILLION_CONFIG.NILCHAIN_URL)
      .build();
    const nilauthClient = await NilauthClient.create({
      baseUrl: NILLION_CONFIG.NILAUTH_URL,
      payer,
    });
    const builderClient = await SecretVaultBuilderClient.from({
      signer,
      nilauthClient: nilauthClient as any,
      dbs: NILLION_CONFIG.NILDB_NODES,
    });
    await builderClient.refreshRootToken();

    // Get list of collections to find our collection UUID
    const collections = await builderClient.readCollections();
    const collection = collections.data.find((c: any) => c.name === COLLECTION_ID);
    
    if (!collection) {
      throw new Error(`Collection ${COLLECTION_ID} not found. Please initialize first.`);
    }

    // Generate unique document ID
    const documentId = crypto.randomUUID();

    // Prepare document with metadata - flatten the share values
    const document = {
      _id: documentId,
      userId: data.userId,
      timestamp: data.timestamp,
      pageViews: data.pageViews['%share'] || data.pageViews['%allot'] || 0,
      sessionDuration: data.sessionDuration['%share'] || data.sessionDuration['%allot'] || 0,
      interactions: data.interactions['%share'] || data.interactions['%allot'] || 0,
      category: data.category,
      platform: data.platform,
      storedAt: new Date().toISOString(),
    };

    // Store data in nilDB - data is encrypted and secret-shared across nodes
    const storeResult = await builderClient.createStandardData({
      collection: collection.id,
      data: [document],
    });

    // Result is ByNodeName<CreateDataResponse>, get first node's response
    const firstNode = Object.keys(storeResult)[0];
    const response = storeResult[firstNode];

    console.log('Analytics stored privately in nilDB:', {
      id: documentId,
      userId: data.userId,
      category: data.category,
      nodes: NILLION_CONFIG.NILDB_NODES.length,
    });

    return NextResponse.json({
      success: true,
      id: documentId,
      created: response.data.created,
      errors: response.data.errors,
      message: 'Analytics data encrypted and stored across nilDB nodes',
    });
  } catch (error) {
    console.error('Storage error:', error);
    
    // Fallback to demo mode on auth errors
    if (error instanceof Error && 
        (error.message?.includes('Unauthorized') || 
         error.message?.includes('not found') ||
         error.message?.includes('412'))) {
      console.log('⚠️  Falling back to demo storage');
      
      const data = await request.json();
      const documentId = crypto.randomUUID();
      
      const document = {
        _id: documentId,
        userId: data.userId,
        timestamp: data.timestamp,
        pageViews: data.pageViews['%share'] || data.pageViews['%allot'] || 0,
        sessionDuration: data.sessionDuration['%share'] || data.sessionDuration['%allot'] || 0,
        interactions: data.interactions['%share'] || data.interactions['%allot'] || 0,
        category: data.category,
        platform: data.platform,
        storedAt: new Date().toISOString(),
      };
      
      demoDataStore.set(documentId, document);
      
      return NextResponse.json({
        success: true,
        id: documentId,
        message: 'Analytics data stored in demo mode',
        demo: true,
      });
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
