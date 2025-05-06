"use client";

import { ThirdwebProvider } from "@thirdweb-dev/react";
import { createClient } from "@supabase/supabase-js";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Navbar } from "@/components/Navbar";
import { Base } from "@thirdweb-dev/chains";

// Initialize Supabase client - you should use environment variables in production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Don't throw error here as it will crash the client component
// Instead handle the condition gracefully
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <ThirdwebProvider 
        activeChain={Base}
        clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      >
        <Navbar />
        {children}
      </ThirdwebProvider>
    </SessionContextProvider>
  );
}