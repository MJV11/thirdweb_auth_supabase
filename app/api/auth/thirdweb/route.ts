import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { buildSiweMessage } from "@/lib/siwe";


// initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, address, payload, signature } = body;

    if (action === 'generate') {
      // Generate a new SIWE message
      const nonce = ethers.utils.hexlify(ethers.utils.randomBytes(32));
      const now = new Date();
      const issuedAt = now.toISOString();
      
      // Set expiration time to 10 minutes from now
      const expiration = new Date(now);
      expiration.setMinutes(now.getMinutes() + 10);
      const expirationTime = expiration.toISOString();
      
      // Set "not valid before" time to now
      const notBefore = new Date(now);
      notBefore.setMinutes(now.getMinutes() - 10); // valid from 10 minutes ago
      const invalidBefore = notBefore.toISOString();
      
      const domain = request.headers.get('host') || 'localhost:3000';
      
      const payload = {
        domain,
        address,
        statement: 'Please ensure that the domain above matches the URL of the current website.',
        uri: domain,
        version: '1',
        chain_id: '1', // Ethereum mainnet
        nonce,
        issued_at: issuedAt,
        expiration_time: expirationTime,
        invalid_before: invalidBefore,
      };
      
      return NextResponse.json({ payload });
    } else if (action === 'verify') {
      if (!payload || !signature || !address) return NextResponse.json({ error: 'Missing payload, signature, or address' }, { status: 400 });
      try {
        // Format the message for verification
        const message = buildSiweMessage(payload);
        
        // Recover the address from the signature
        const recoveredAddress = ethers.utils.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
          return NextResponse.json({ 
            error: 'Invalid signature', 
            expected: address, 
            received: recoveredAddress 
          }, { status: 401 });
        }
        
        // Create or get user in Supabase
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', address.toLowerCase())
          .single();
                  
        let userId;
        
        if (userError) {
          // Create new user
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([
              { 
                wallet_address: address.toLowerCase(),
                last_login: new Date().toISOString()
              }
            ])
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating user:', createError);
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
          }
          
          userId = newUser.id;
          console.log("Created new user:", newUser);
        } else {
          // Update last login for existing user
          userId = existingUser.id;
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userId);
            
          if (updateError) {
            console.error('Error updating user:', updateError);
          }
          
          console.log("Updated existing user:", userId);
        }
        
        // Generate a JWT using Supabase's auth.admin API
        const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: `${address.toLowerCase()}@web3auth.temp`, // temporary email format
          options: {
            data: {
              wallet_address: address.toLowerCase(),
              user_id: userId
            }
          }
        });
        
        if (sessionError) {
          console.error('Error generating session:', sessionError);
          return NextResponse.json({ error: 'Failed to generate session' }, { status: 500 });
        }
        
        // Extract the token
        const { properties } = sessionData;
        const token = properties?.hashed_token;
        
        // Return the session information
        return NextResponse.json({ 
          success: true, 
          session: {
            user: {
              id: userId,
              wallet_address: address.toLowerCase()
            },
            access_token: token
          }
        });
        
      } catch (error: any) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

