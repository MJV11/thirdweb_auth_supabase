"use client"; 
import { useState, useEffect } from "react";
import { ConnectWallet, useWallet, useConnectionStatus } from "@thirdweb-dev/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { buildSiweMessage } from "@/lib/siwe";


export function Navbar() {
  const wallet = useWallet();
  const status = useConnectionStatus();
  const supabaseClient = useSupabaseClient();
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // This effect runs whenever wallet or status changes
  useEffect(() => {
    /**
     * Gets the wallet address and authenticates with Supabase
     */
    const getAddress = async () => {
      if (status === "connected" && wallet) {
        try {
          const address = await wallet.getAddress();
          setWalletAddress(address);
          console.log("Wallet connected:", address);
          
          // authenticate with Supabase
          handleAuth(address);
        } catch (error) {
          console.error("Failed to get wallet address:", error);
        }
      } else if (status === "disconnected") {
        setWalletAddress(null);
        setSupabaseUserId(null);
      }
    };

    /**
     * Handles authentication with Supabase
     * @param address - The wallet address to authenticate with
     */
    const handleAuth = async (address: string) => {
      if (isAuthenticating) return; // prevent multiple calls
      setIsAuthenticating(true);
      toast.loading("Authenticating...", { id: "auth" });
      
      try {      
        // 1. Generate login payload from your backend
        const payloadRes = await fetch("/api/auth/thirdweb", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, action: "generate" }),
        });
        
        if (!payloadRes.ok) throw new Error("Failed to generate auth payload");
        const { payload } = await payloadRes.json();
        
        // 2. Build a formatted message string from the payload
        const messageToSign = buildSiweMessage(payload);
        
        // 3. User signs the message
        if (!wallet) throw new Error("Wallet not connected");      
        const signature = await wallet.signMessage(messageToSign);
        
        // 4. Send the signature back to the server for verification and session creation
        const verifyRes = await fetch('/api/auth/thirdweb', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: "verify",
            payload,
            signature,
            address,
          }),
        });
        if (!verifyRes.ok) {
          const errorData = await verifyRes.json();
          throw new Error(errorData.error || "Failed to verify signature");
        }
        
        const { session } = await verifyRes.json();
        
        if (session?.user) {
          setSupabaseUserId(session.user.id);
          
          // Set Supabase session manually
          if (session.access_token) {
            // Set the session in Supabase client
            await supabaseClient.auth.setSession({
              access_token: session.access_token,
              refresh_token: '',
            });
            
            console.log("Supabase session set successfully");
          }
          
          toast.success("Authenticated successfully", { id: "auth" });
        } else {
          throw new Error("Failed to get session");
        }
      } catch (error: any) {
        console.error("Auth error:", error);
        toast.error(`Authentication failed: ${error.message}`, { id: "auth" });
      } finally {
        setIsAuthenticating(false);
      }
    };
    
    getAddress();
  }, [wallet, status]);

  const isConnected = status === "connected";

  return (
    <div className="fixed top-0 z-10 flex items-center justify-center w-full bg-transparent text-white/60 backdrop-blur-md">
      <nav className="flex items-center justify-between w-full px-8 py-5 mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <Link href="/" className="mr-4">
            <Image
              src="/logo.png"
              width={48}
              height={48}
              alt="NFT marketplace sample logo"
            />
          </Link>

          <div className="flex items-center gap-6 font-medium">
            <Link
              href="/buy"
              className="transition hover:text-white/100"
            >
              Buy
            </Link>
            <Link
              href="/sell"
              className="transition hover:text-white/100"
            >
              Sell
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          {!isConnected ? (
            <ConnectWallet
              btnTitle="Connect Wallet"
              modalTitle="Sign in with your wallet"
              switchToActiveChain={true}
              // Don't need onConnect anymore because it is done in useEffect
            />
          ) : (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-white/80">Connected:</span>
                {walletAddress && (
                  <span className="text-white/80">
                    {walletAddress}
                  </span>
                )}
              </div>
              {supabaseUserId && (
                <span className="text-white/80">
                  Supabase User ID: {supabaseUserId}
                </span>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

