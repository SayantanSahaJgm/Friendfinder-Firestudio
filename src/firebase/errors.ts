
// Defines a custom error class for Firestore permission issues.
// This class extends the standard Error and includes a 'context' property
// to carry detailed information about the failed request, which is crucial
// for debugging security rules in the Next.js error overlay.

export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
    requestResourceData?: any;
};
  
export class FirestorePermissionError extends Error {
    context: SecurityRuleContext;

    constructor(context: SecurityRuleContext) {
        // Construct the error message to be as informative as possible.
        // This message will appear in the console and the Next.js error overlay.
        const message = `
FirestoreError: Missing or insufficient permissions.
The following request was denied by Firestore Security Rules:
${JSON.stringify(context, null, 2)}
        `.trim();
        
        super(message);
        this.name = 'FirestorePermissionError';
        this.context = context;

        // This line is needed to restore the correct prototype chain.
        Object.setPrototypeOf(this, FirestorePermissionError.prototype);
    }
}
