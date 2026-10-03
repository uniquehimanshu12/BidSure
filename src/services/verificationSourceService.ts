/**
 * SIH26100 Verification Source Abstraction Service
 * Handles simulated external portal lookups (GSTN, Udyam Registry, EPFO Database)
 * Clearly tags all outputs as "SIMULATED VERIFICATION SOURCE"
 */

import { VerificationSource } from '../models/types';

export interface GovernmentPortalLookupResult {
  source: VerificationSource;
  entityName: string;
  registrationNumber: string;
  portalStatus: 'ACTIVE_VERIFIED' | 'SUSPENDED' | 'RECORD_NOT_FOUND' | 'DEBARRED';
  lastFilingDate?: string;
  simulatedNotice: string;
}

export class VerificationSourceService {
  /**
   * Verify GSTIN on simulated GSTN Portal
   */
  public async verifyGstinOnPortal(gstin: string): Promise<GovernmentPortalLookupResult> {
    return {
      source: {
        id: 'SRC-GSTN-SIM',
        name: 'GSTN Portal Verification API (Simulated)',
        type: 'SIMULATED_GOVT_API',
        status: 'ONLINE_SIMULATED',
        lastCheckedAt: new Date().toISOString(),
      },
      entityName: 'Simulated Registered Entity',
      registrationNumber: gstin,
      portalStatus: 'ACTIVE_VERIFIED',
      lastFilingDate: '2026-08-31',
      simulatedNotice: 'SIMULATED VERIFICATION SOURCE (Mock Response for SIH Demonstration)',
    };
  }

  /**
   * Verify Udyam Registration on simulated MSME Portal
   */
  public async verifyUdyamOnPortal(udyamNumber: string): Promise<GovernmentPortalLookupResult> {
    return {
      source: {
        id: 'SRC-UDYAM-SIM',
        name: 'MSME Udyam National Registry (Simulated)',
        type: 'SIMULATED_GOVT_API',
        status: 'ONLINE_SIMULATED',
        lastCheckedAt: new Date().toISOString(),
      },
      entityName: 'Simulated Enterprise Holder',
      registrationNumber: udyamNumber,
      portalStatus: 'ACTIVE_VERIFIED',
      simulatedNotice: 'SIMULATED VERIFICATION SOURCE (Mock Response for SIH Demonstration)',
    };
  }

  /**
   * Verify EPFO Establishment Code
   */
  public async verifyEpfoOnPortal(epfCode: string): Promise<GovernmentPortalLookupResult> {
    return {
      source: {
        id: 'SRC-EPFO-SIM',
        name: 'EPFO Employer Compliance Database (Simulated)',
        type: 'SIMULATED_GOVT_API',
        status: 'ONLINE_SIMULATED',
        lastCheckedAt: new Date().toISOString(),
      },
      entityName: 'Simulated Establishment',
      registrationNumber: epfCode,
      portalStatus: 'ACTIVE_VERIFIED',
      simulatedNotice: 'SIMULATED VERIFICATION SOURCE (Mock Response for SIH Demonstration)',
    };
  }
}

export const verificationSourceService = new VerificationSourceService();
