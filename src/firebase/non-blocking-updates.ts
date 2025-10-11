
import {
    DocumentReference,
    CollectionReference,
    setDoc,
    addDoc,
    SetOptions,
    DocumentData
  } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';
  
  /**
   * Performs a non-blocking `setDoc` operation on a Firestore document.
   * It initiates the write and immediately returns, allowing the UI to remain responsive.
   * Errors, especially permission errors, are caught and emitted globally for centralized handling.
   *
   * @param {DocumentReference} docRef - The reference to the Firestore document.
   * @param {DocumentData} data - The data to write to the document.
   * @param {SetOptions} [options] - Options for the set operation (e.g., { merge: true }).
   */
  export function setDocumentNonBlocking(
    docRef: DocumentReference,
    data: DocumentData,
    options?: SetOptions
  ): void {
    const operation = options && 'merge' in options ? 'update' : 'create';
    
    setDoc(docRef, data, { merge: true })
      .catch((serverError) => {
        // Create the rich, contextual error and emit it.
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: operation,
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }
  
  /**
   * Performs a non-blocking `addDoc` operation to a Firestore collection.
   * It initiates the write and immediately returns.
   * Errors are caught and emitted globally.
   *
   * @param {CollectionReference} collectionRef - The reference to the Firestore collection.
   * @param {DocumentData} data - The data for the new document.
   */
  export function addDocumentNonBlocking(
    collectionRef: CollectionReference,
    data: DocumentData
  ): void {
    addDoc(collectionRef, data)
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: collectionRef.path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }
