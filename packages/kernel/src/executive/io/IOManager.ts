/**
 * @fileoverview I/O Manager - Async I/O Coordination
 * @module @kernel/executive/io/IOManager
 */

import type { Handle } from '../types';

/**
 * I/O request packet
 */
export interface IRP {
  id: number;
  deviceHandle: Handle;
  majorFunction: string;
  minorFunction?: string;
  inputBuffer?: unknown;
  outputBuffer?: unknown;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  errorCode?: number;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * I/O Manager coordinates async I/O operations
 */
export class IOManager {
  private pendingIRPs = new Map<number, IRP>();
  private nextIRPId = 1;
  
  /**
   * Create an I/O request packet
   */
  createIRP(
    deviceHandle: Handle,
    majorFunction: string,
    inputBuffer?: unknown
  ): IRP {
    const irp: IRP = {
      id: this.nextIRPId++,
      deviceHandle,
      majorFunction,
      inputBuffer,
      status: 'pending',
      createdAt: new Date(),
    };
    
    this.pendingIRPs.set(irp.id, irp);
    return irp;
  }
  
  /**
   * Complete an IRP
   */
  completeIRP(irpId: number, outputBuffer?: unknown, error?: { code: number; message: string }): boolean {
    const irp = this.pendingIRPs.get(irpId);
    if (!irp) return false;
    
    irp.outputBuffer = outputBuffer;
    irp.completedAt = new Date();
    
    if (error) {
      irp.status = 'failed';
      irp.errorCode = error.code;
      irp.errorMessage = error.message;
    } else {
      irp.status = 'completed';
    }
    
    return true;
  }
  
  /**
   * Cancel an IRP
   */
  cancelIRP(irpId: number): boolean {
    const irp = this.pendingIRPs.get(irpId);
    if (!irp || irp.status !== 'pending') return false;
    
    irp.status = 'cancelled';
    irp.completedAt = new Date();
    
    return true;
  }
  
  /**
   * Get IRP by ID
   */
  getIRP(irpId: number): IRP | null {
    return this.pendingIRPs.get(irpId) ?? null;
  }
  
  /**
   * Get pending IRP count
   */
  getPendingCount(): number {
    let count = 0;
    for (const irp of this.pendingIRPs.values()) {
      if (irp.status === 'pending') count++;
    }
    return count;
  }
  
  /**
   * Clean up completed IRPs
   */
  cleanup(): number {
    const toDelete: number[] = [];
    
    for (const [id, irp] of this.pendingIRPs) {
      if (irp.status !== 'pending') {
        toDelete.push(id);
      }
    }
    
    toDelete.forEach(id => this.pendingIRPs.delete(id));
    
    return toDelete.length;
  }
  
  /**
   * Perform async I/O operation
   */
  async performIO<T = unknown>(
    deviceHandle: Handle,
    majorFunction: string,
    inputBuffer?: unknown
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const irp = this.createIRP(deviceHandle, majorFunction, inputBuffer);
      
      // Simulate async completion (in real implementation, this would be device-specific)
      setTimeout(() => {
        this.completeIRP(irp.id);
        if (irp.status === 'completed') {
          resolve(irp.outputBuffer as T);
        } else {
          reject(new Error(irp.errorMessage ?? 'I/O failed'));
        }
      }, 0);
    });
  }
}

// Singleton instance
export const ioManager = new IOManager();
