/**
 * @fileoverview Handle Table
 * 
 * Manages handles for a single process. Each process has its own handle
 * table that maps handle values to kernel objects.
 * 
 * @module executive/object/HandleTable
 * @version 1.0.0
 */

import type { Handle, PID, KernelObjectBase } from '../types';
import { INVALID_HANDLE } from '../types';
import type {
  IHandleTable,
  HandleTableEntry,
  HandleInfo,
} from './types';

/**
 * Handle Table
 * 
 * Provides a per-process handle table for managing kernel object handles.
 * Handles are opaque references that processes use to interact with
 * kernel objects.
 */
export class HandleTable implements IHandleTable {
  /** The process that owns this handle table */
  public readonly pid: PID;

  /** Handle entries map */
  private _entries: Map<Handle, HandleTableEntry> = new Map();

  /** Next available handle value */
  private _nextHandle: Handle = 4; // Start at 4 (0-3 reserved)

  /** Handle value increment */
  private readonly HANDLE_INCREMENT = 4;

  /** Maximum handle value */
  private readonly MAX_HANDLE = 0x7FFFFFFF;

  /** Statistics */
  private _stats = {
    totalCreated: 0,
    totalClosed: 0,
    peakCount: 0,
  };

  /**
   * Create a new handle table
   * @param pid The process that owns this table
   */
  constructor(pid: PID) {
    this.pid = pid;
  }

  /**
   * Add a handle entry
   * @param entry The handle table entry
   * @returns The assigned handle value
   */
  public add(entry: HandleTableEntry): Handle {
    // Find an available handle value
    const handle = this.allocateHandle();
    
    // Store the entry
    this._entries.set(handle, entry);

    // Update statistics
    this._stats.totalCreated++;
    if (this._entries.size > this._stats.peakCount) {
      this._stats.peakCount = this._entries.size;
    }

    return handle;
  }

  /**
   * Remove a handle
   * @param handle The handle to remove
   * @returns The removed entry, or null if not found
   */
  public remove(handle: Handle): HandleTableEntry | null {
    const entry = this._entries.get(handle);
    
    if (!entry) {
      return null;
    }

    // Mark as closed
    entry.closed = true;

    // Remove from table
    this._entries.delete(handle);

    // Update statistics
    this._stats.totalClosed++;

    return entry;
  }

  /**
   * Get a handle entry
   * @param handle The handle to look up
   * @returns The entry, or null if not found or closed
   */
  public get(handle: Handle): HandleTableEntry | null {
    if (handle === INVALID_HANDLE) {
      return null;
    }

    const entry = this._entries.get(handle);
    
    if (!entry || entry.closed) {
      return null;
    }

    return entry;
  }

  /**
   * Check if a handle exists and is valid
   * @param handle The handle to check
   */
  public has(handle: Handle): boolean {
    return this.get(handle) !== null;
  }

  /**
   * Get all valid handles
   */
  public getAll(): Handle[] {
    const handles: Handle[] = [];
    for (const [handle, entry] of this._entries) {
      if (!entry.closed) {
        handles.push(handle);
      }
    }
    return handles;
  }

  /**
   * Get all entries
   */
  public getAllEntries(): HandleTableEntry[] {
    const entries: HandleTableEntry[] = [];
    for (const entry of this._entries.values()) {
      if (!entry.closed) {
        entries.push(entry);
      }
    }
    return entries;
  }

  /**
   * Get handle count
   */
  public get count(): number {
    return this._entries.size;
  }

  /**
   * Get handle information
   * @param handle The handle to get info for
   */
  public getHandleInfo(handle: Handle): HandleInfo | null {
    const entry = this.get(handle);
    if (!entry) {
      return null;
    }

    return {
      handle,
      type: entry.object.type,
      name: entry.object.name,
      refCount: entry.object.refCount,
      accessMask: entry.accessMask,
      inheritable: entry.inheritable,
      closed: entry.closed,
    };
  }

  /**
   * Get all handle information
   */
  public getAllHandleInfo(): HandleInfo[] {
    const infos: HandleInfo[] = [];
    for (const handle of this.getAll()) {
      const info = this.getHandleInfo(handle);
      if (info) {
        infos.push(info);
      }
    }
    return infos;
  }

  /**
   * Close all handles
   * This marks all handles as closed and clears the table
   */
  public clear(): void {
    for (const entry of this._entries.values()) {
      entry.closed = true;
    }
    this._entries.clear();
  }

  /**
   * Close handles of a specific type
   * @param type The object type to close
   * @returns Number of handles closed
   */
  public closeByType(type: string): number {
    let closed = 0;
    const handlesToClose: Handle[] = [];

    for (const [handle, entry] of this._entries) {
      if (entry.object.type === type && !entry.closed) {
        handlesToClose.push(handle);
      }
    }

    for (const handle of handlesToClose) {
      this.remove(handle);
      closed++;
    }

    return closed;
  }

  /**
   * Find handles by object
   * @param object The object to find handles for
   * @returns Array of handles pointing to the object
   */
  public findByObject(object: KernelObjectBase): Handle[] {
    const handles: Handle[] = [];
    for (const [handle, entry] of this._entries) {
      if (entry.object === object && !entry.closed) {
        handles.push(handle);
      }
    }
    return handles;
  }

  /**
   * Find handles by name
   * @param name The object name to search for
   * @returns Array of handles pointing to named objects
   */
  public findByName(name: string): Handle[] {
    const handles: Handle[] = [];
    for (const [handle, entry] of this._entries) {
      if (entry.object.name === name && !entry.closed) {
        handles.push(handle);
      }
    }
    return handles;
  }

  /**
   * Duplicate a handle entry
   * @param handle The handle to duplicate
   * @param accessMask Optional new access mask
   * @param inheritable Whether the new handle should be inheritable
   * @returns The new handle, or null if the source handle is invalid
   */
  public duplicate(
    handle: Handle,
    accessMask?: number,
    inheritable?: boolean
  ): Handle | null {
    const entry = this.get(handle);
    if (!entry) {
      return null;
    }

    const newEntry: HandleTableEntry = {
      object: entry.object,
      accessMask: accessMask ?? entry.accessMask,
      inheritable: inheritable ?? entry.inheritable,
      closed: false,
      createdAt: new Date(),
    };

    return this.add(newEntry);
  }

  /**
   * Get inheritable handles
   * @returns Array of inheritable handle entries
   */
  public getInheritable(): Array<{ handle: Handle; entry: HandleTableEntry }> {
    const result: Array<{ handle: Handle; entry: HandleTableEntry }> = [];
    for (const [handle, entry] of this._entries) {
      if (entry.inheritable && !entry.closed) {
        result.push({ handle, entry });
      }
    }
    return result;
  }

  /**
   * Allocate a new handle value
   */
  private allocateHandle(): Handle {
    // Find an available handle value
    const startHandle = this._nextHandle;
    
    do {
      if (!this._entries.has(this._nextHandle)) {
        const allocated = this._nextHandle;
        this._nextHandle = (this._nextHandle + this.HANDLE_INCREMENT) & this.MAX_HANDLE;
        if (this._nextHandle === 0) {
          this._nextHandle = 4; // Skip reserved handles
        }
        return allocated;
      }
      
      this._nextHandle = (this._nextHandle + this.HANDLE_INCREMENT) & this.MAX_HANDLE;
      if (this._nextHandle === 0) {
        this._nextHandle = 4;
      }
    } while (this._nextHandle !== startHandle);

    // Handle table is full
    throw new Error('Handle table is full');
  }

  /**
   * Get statistics
   */
  public getStats(): typeof this._stats {
    return { ...this._stats };
  }

  /**
   * Validate a handle for a specific access
   * @param handle The handle to validate
   * @param requiredAccess The required access mask
   */
  public validateAccess(handle: Handle, requiredAccess: number): boolean {
    const entry = this.get(handle);
    if (!entry) {
      return false;
    }

    return (entry.accessMask & requiredAccess) === requiredAccess;
  }
}

export default HandleTable;
