// In-memory store for reset tokens (would use a database in production)
export interface ResetToken {
  email: string;
  token: string;
  expires: Date;
  createdAt: Date;
}

// Store tokens in memory using an object for O(1) lookups
// In production, this would be stored in a database
const resetTokens: Record<string, ResetToken> = {};

// Function to access a token
export function getToken(token: string): ResetToken | undefined {
  return resetTokens[token];
}

// Function to store a new token
export function storeToken(token: string, data: ResetToken): void {
  resetTokens[token] = data;
}

// Function to delete a token
export function deleteToken(token: string): void {
  delete resetTokens[token];
}

// Function to check if token has expired
export function isTokenExpired(token: ResetToken): boolean {
  const expiryTime = 60 * 60 * 1000; // 1 hour in milliseconds
  const now = new Date();
  return now.getTime() - token.createdAt.getTime() > expiryTime;
} 