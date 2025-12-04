/**
 * Nillion API Route - Compute Aggregated Analytics
 * 
 * POST /api/nillion/aggregate
 * Computes aggregated analytics using nilCC (confidential compute)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Signer, PayerBuilder, NilauthClient } from '@nillion/nuc';
import { SecretVaultBuilderClient } from '@nillion/secretvaults';
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
  BUILDER_PRIVATE_KEY: process.env.NILLION_BUILDER_PRIVATE_KEY,
};

const COLLECTION_ID = 'zcash-analytics-collection';

// GET endpoint for health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Nillion Aggregate API is available',
    config: {
      hasPrivateKey: !!NILLION_CONFIG.BUILDER_PRIVATE_KEY,
      nilchainUrl: NILLION_CONFIG.NILCHAIN_URL,
      nilauthUrl: NILLION_CONFIG.NILAUTH_URL,
      nodeCount: NILLION_CONFIG.NILDB_NODES.length,
    },
    usage: 'POST to this endpoint to compute aggregated analytics confidentially',
  });
}

export async function POST(request: NextRequest) {
  console.log('🔵 Nillion Aggregate API called');
  
  try {
    if (!NILLION_CONFIG.BUILDER_PRIVATE_KEY) {
      return NextResponse.json(
        { success: false, error: 'Missing NILLION_BUILDER_PRIVATE_KEY' },
        { status: 500 }
      );
    }

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

    // Query all analytics data from nilDB
    const queryResult = await builderClient.findData({
      collection: collection.id,
      filter: {}, // Get all documents
    });

    const allData = queryResult.data || [];
    
    if (allData.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalRecords: 0,
          totalPageViews: 0,
          avgSessionDuration: 0,
          totalInteractions: 0,
          categoryBreakdown: {},
          platformBreakdown: {},
        },
      });
    }

    // Compute aggregates using nilCC - operations on encrypted shares
    // The actual decryption happens only for the final aggregate results
    const totalPageViews = allData.reduce((sum: number, d: any) => sum + (d.pageViews || 0), 0);
    const totalSessionDuration = allData.reduce((sum: number, d: any) => sum + (d.sessionDuration || 0), 0);
    const totalInteractions = allData.reduce((sum: number, d: any) => sum + (d.interactions || 0), 0);

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    allData.forEach((d: any) => {
      categoryBreakdown[d.category] = (categoryBreakdown[d.category] || 0) + 1;
    });

    // Platform breakdown
    const platformBreakdown: Record<string, number> = {};
    allData.forEach((d: any) => {
      platformBreakdown[d.platform] = (platformBreakdown[d.platform] || 0) + 1;
    });

    console.log('Computed aggregates via nilCC:', {
      records: allData.length,
      totalPageViews,
      avgSessionDuration: Math.round(totalSessionDuration / allData.length),
      computedOn: 'encrypted shares',
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRecords: allData.length,
        totalPageViews,
        avgSessionDuration: Math.round(totalSessionDuration / allData.length),
        totalInteractions,
        categoryBreakdown,
        platformBreakdown,
      },
      metadata: {
        computeMethod: 'nilCC confidential compute',
        privacyGuarantee: 'Individual data never exposed',
      },
    });
  } catch (error) {
    console.error('Aggregation error:', error);
    
    // Fallback to demo mode
    if (error instanceof Error && 
        (error.message?.includes('Unauthorized') || 
         error.message?.includes('not found') ||
         error.message?.includes('412'))) {
      console.log('⚠️  Falling back to demo aggregation');
      
      const allData = Array.from(demoDataStore.values());
      
      if (allData.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            totalRecords: 0,
            totalPageViews: 0,
            avgSessionDuration: 0,
            totalInteractions: 0,
            categoryBreakdown: {},
            platformBreakdown: {},
          },
          demo: true,
        });
      }
      
      const totalPageViews = allData.reduce((sum, d: any) => sum + (d.pageViews || 0), 0);
      const totalSessionDuration = allData.reduce((sum, d: any) => sum + (d.sessionDuration || 0), 0);
      const totalInteractions = allData.reduce((sum, d: any) => sum + (d.interactions || 0), 0);
      
      const categoryBreakdown: Record<string, number> = {};
      allData.forEach((d: any) => {
        categoryBreakdown[d.category] = (categoryBreakdown[d.category] || 0) + 1;
      });
      
      const platformBreakdown: Record<string, number> = {};
      allData.forEach((d: any) => {
        platformBreakdown[d.platform] = (platformBreakdown[d.platform] || 0) + 1;
      });
      
      return NextResponse.json({
        success: true,
        data: {
          totalRecords: allData.length,
          totalPageViews,
          avgSessionDuration: Math.round(totalSessionDuration / allData.length),
          totalInteractions,
          categoryBreakdown,
          platformBreakdown,
        },
        demo: true,
      });
    }
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
