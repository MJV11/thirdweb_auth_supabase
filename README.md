# thirdweb-auth-supabase

A modern Next.js app with thirdweb wallet authentication and Supabase session management.

---

## 🚀 One-Click Supabase Setup

1. **Install the Supabase CLI** (if you haven't already):
   ```sh
   npm install -g supabase
   ```

2. **Initialize Supabase in your project:**
   ```sh
   supabase init
   ```

3. **Start Supabase locally:**
   ```sh
   supabase start
   ```

4. **Apply the database schema:**
   ```sh
   supabase db push
   ```
   > This will create the required `users` table and any other schema in your `supabase/migrations` folder.

5. **Get your Supabase project URL and keys:**
   - Go to your [Supabase dashboard](https://app.supabase.com/).
   - Copy your project's `URL`, `anon key`, and `service role key`.

---

## 🛠️ Environment Variables

1. **Copy the example env file:**
   ```sh
   cp .env.example .env.local
   ```
2. **Fill in your real values in `.env.local`:**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
   NEXT_PUBLIC_DOMAIN=localhost:3000
   THIRDWEB_SECRET_KEY=your-thirdweb-secret-key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

   NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your_public_template_client_id
   TW_SECRET_KEY=your_tw_secret_key

   ADMIN_CRYTPO_ETHEREUM_KEY=your_ethereum_key
   ```

---

## 🏃 How to Run Locally

1. **Install dependencies:**
   ```sh
   pnpm install
   ```

2. **Start the development server:**
   ```sh
   pnpm dev
   ```

3. **Open your browser:**  
   Visit [http://localhost:3000](http://localhost:3000)

---

## 🌍 How to Deploy

- **Vercel (Recommended):**
  1. Push your code to GitHub.
  2. Import your repo into [Vercel](https://vercel.com/).
  3. Set the environment variables in the Vercel dashboard (copy from `.env.example`).
  4. Click "Deploy".

- **Other platforms:**  
  Deploy as a standard Next.js app.  
  Make sure to set all required environment variables.

---

## 📦 Project Structure

```
/app
  /api/auth/thirdweb/route.ts   # Auth API route
/components
  Navbar.tsx                    # Wallet connect & auth UI
/lib
  siwe.ts                       # SIWE message builder
.env.example                    # Example env vars
```

---

## 📝 Notes

- **Never commit your real `.env.local`!** Only `.env.example` should be in git.
- For production, use secure secrets and HTTPS.

---

## 🧑‍💻 Contributing

PRs and issues welcome!
