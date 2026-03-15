/**
 * @fileoverview Object Manager - Kernel Object Management
 * @module @kernel/executive/object/ObjectManager
 */

import type { KernelObjectType, Handle, KernelObject } from '../types';

/**
 * ObjectManager manages kernel objects and handles.
 */
export class ObjectManager {
  private objects = new Map<Handle, KernelObject>();
  private nextHandle: Handle = 1;
  private typeCounts = new Map<KernelObjectType, number>();
  
  /**
   * Create a kernel object and return its handle
   */
  create(type: KernelObjectType, name?: string): Handle {
    const handle = this.nextHandle++;
    const object: KernelObject = {
      type,
      refCount: 1,
      createdAt: new Date(),
      name,
    };
    
    this.objects.set(handle, object);
    this.incrementTypeCount(type);
    
    return handle;
  }
  
  /**
   * Get an object by handle
   */
  get(handle: Handle): KernelObject | null {
    return this.objects.get(handle) ?? null;
  }
  
  /**
   * Reference an object (increment ref count)
   */
  reference(handle: Handle): boolean {
    const object = this.objects.get(handle);
    if (!object) return false;
    
    object.refCount++;
    return true;
  }
  
  /**
   * Dereference an object (decrement ref count)
   */
  dereference(handle: Handle): boolean {
    const object = this.objects.get(handle);
    if (!object) return false;
    
    object.refCount--;
    
    if (object.refCount <= 0) {
      this.objects.delete(handle);
      this.decrementTypeCount(object.type);
    }
    
    return true;
  }
  
  /**
   * Close a handle (dereference and remove)
   */
  close(handle: Handle): boolean {
    return this.dereference(handle);
  }
  
  /**
   * Get object type
   */
  getType(handle: Handle): KernelObjectType | null {
    return this.objects.get(handle)?.type ?? null;
  }
  
  /**
   * Get object count
   */
  getCount(): number {
    return this.objects.size;
  }
  
  /**
   * Get count by type
   */
  getCountByType(type: KernelObjectType): number {
    return this.typeCounts.get(type) ?? 0;
  }
  
  /**
   * Find handles by type
   */
  findByType(type: KernelObjectType): Handle[] {
    const handles: Handle[] = [];
    for (const [handle, object] of this.objects) {
      if (object.type === type) {
        handles.push(handle);
      }
    }
    return handles;
  }
  
  /**
   * Find handles by name
   */
  findByName(name: string): Handle[] {
    const handles: Handle[] = [];
    for (const [handle, object] of this.objects) {
      if (object.name === name) {
        handles.push(handle);
      }
    }
    return handles;
  }
  
  /**
   * Clear all objects
   */
  clear(): void {
    this.objects.clear();
    this.typeCounts.clear();
    this.nextHandle = 1;
  }
  
  private incrementTypeCount(type: KernelObjectType): void {
    this.typeCounts.set(type, (this.typeCounts.get(type) ?? 0) + 1);
  }
  
  private decrementTypeCount(type: KernelObjectType): void {
    const count = this.typeCounts.get(type) ?? 0;
    if (count <= 1) {
      this.typeCounts.delete(type);
    } else {
      this.typeCounts.set(type, count - 1);
    }
  }
}

// Singleton instance
export const objectManager = new ObjectManager();
