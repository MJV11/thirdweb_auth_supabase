/**
 * Builds a SIWE message string from the payload
 * @param payload - The payload to build the message from
 * @returns The SIWE message string
 */
export function buildSiweMessage(payload: Record<string, any>): string {
    return `${payload.domain} wants you to sign in with your Ethereum account:
  ${payload.address}
  
  ${payload.statement}
  
  URI: ${payload.uri}
  Version: ${payload.version}
  Chain ID: ${payload.chain_id}
  Nonce: ${payload.nonce}
  Issued At: ${payload.issued_at}${payload.expiration_time ? `
  Expiration Time: ${payload.expiration_time}` : ''}${payload.invalid_before ? `
  Not Before: ${payload.invalid_before}` : ''}`;
  }
  