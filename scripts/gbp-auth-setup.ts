/**
 * Google Business Profile OAuth2 Setup
 *
 * Step 1: Run this script to get the authorization URL
 * Step 2: Open the URL in browser, login, and copy the authorization code
 * Step 3: Run again with the code to get refresh_token
 *
 * Usage:
 *   npx tsx scripts/gbp-auth-setup.ts              # Get auth URL
 *   npx tsx scripts/gbp-auth-setup.ts CODE_HERE     # Exchange code for tokens
 */

import * as fs from 'fs';
import * as path from 'path';

const CREDENTIALS_PATH = path.join(process.cwd(), 'data', 'gbp-credentials.json');
const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
];

// Read from environment or .env.local
function getClientCredentials() {
  const envPath = path.join(process.cwd(), '.env.local');
  const env: Record<string, string> = {};

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) env[match[1].trim()] = match[2].trim();
    }
  }

  return {
    clientId: process.env.GBP_CLIENT_ID || env.GBP_CLIENT_ID || '',
    clientSecret: process.env.GBP_CLIENT_SECRET || env.GBP_CLIENT_SECRET || '',
  };
}

async function getAuthUrl() {
  const { clientId } = getClientCredentials();

  if (!clientId) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Google Business Profile API - OAuth2 Setup                  ║
╚══════════════════════════════════════════════════════════════╝

Step 1: Create OAuth2 Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "FYWarehouse GBP"
5. Authorized redirect URIs: add "http://localhost:3000/oauth2callback"
6. Click "Create" and copy Client ID and Client Secret

Step 2: Add to .env.local

  GBP_CLIENT_ID=your_client_id_here
  GBP_CLIENT_SECRET=your_client_secret_here

Step 3: Run this script again

  npx tsx scripts/gbp-auth-setup.ts
`);
    return;
  }

  const redirectUri = 'https://www.fywarehouse.com/oauth2callback';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(SCOPES.join(' '))}` +
    `&access_type=offline` +
    `&prompt=consent`;

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Google Business Profile API - Authorization                 ║
╚══════════════════════════════════════════════════════════════╝

Open this URL in your browser and authorize:

${authUrl}

After authorizing, Google will show you an authorization code.
Copy the code and run:

  npx tsx scripts/gbp-auth-setup.ts YOUR_AUTH_CODE_HERE
`);
}

async function exchangeCode(code: string) {
  const { clientId, clientSecret } = getClientCredentials();

  if (!clientId || !clientSecret) {
    console.error('Error: GBP_CLIENT_ID and GBP_CLIENT_SECRET must be set in .env.local');
    process.exit(1);
  }

  const redirectUri = 'https://www.fywarehouse.com/oauth2callback';

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();

  if (data.error) {
    console.error('Error:', data.error, data.error_description);
    process.exit(1);
  }

  // Save credentials
  const credentials = {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: data.refresh_token,
    token_type: data.token_type,
    created_at: new Date().toISOString(),
  };

  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2));
  console.log(`✓ Credentials saved to ${CREDENTIALS_PATH}`);

  // Now fetch account and location info
  console.log('\nFetching GBP account info...\n');

  const accessToken = data.access_token;

  // List accounts
  const accountsRes = await fetch('https://mybusinessbusinessinformation.googleapis.com/v1/accounts', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!accountsRes.ok) {
    // Try alternative API endpoint
    const altRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (altRes.ok) {
      const altData = await altRes.json();
      console.log('Accounts:', JSON.stringify(altData, null, 2));

      if (altData.accounts?.length) {
        const accountName = altData.accounts[0].name; // e.g. "accounts/123456"

        // List locations
        const locRes = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (locRes.ok) {
          const locData = await locRes.json();
          console.log('\nLocations:', JSON.stringify(locData, null, 2));

          if (locData.locations?.length) {
            const loc = locData.locations[0];
            // Save to env
            const envPath = path.join(process.cwd(), '.env.local');
            let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

            if (!envContent.includes('GBP_ACCOUNT_ID')) {
              envContent += `\nGBP_ACCOUNT_ID=${accountName}\n`;
              envContent += `GBP_LOCATION_ID=${loc.name}\n`;
              fs.writeFileSync(envPath, envContent);
              console.log(`\n✓ Added GBP_ACCOUNT_ID and GBP_LOCATION_ID to .env.local`);
            }
          }
        } else {
          console.log('Could not fetch locations. You may need to enable My Business Business Information API.');
          console.log('Status:', altRes.status, await altRes.text());
        }
      }
    } else {
      console.log('Could not fetch accounts. Status:', accountsRes.status);
      console.log('You may need to enable "My Business Account Management API"');
      console.log('Go to: https://console.cloud.google.com/apis/library/mybusinessaccountmanagement.googleapis.com');
    }
  } else {
    const accountsData = await accountsRes.json();
    console.log('Accounts:', JSON.stringify(accountsData, null, 2));
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Setup Complete!                                             ║
╚══════════════════════════════════════════════════════════════╝

Credentials saved. The system will now automatically:
- Post to Google Business Profile when new articles are published
- Use the content pipeline to generate GBP posts

To test, run:
  curl -X POST http://localhost:3001/api/social/gbp -H 'Content-Type: application/json' -d '{"action":"preview","title":"Test","url":"https://www.fywarehouse.com"}'
`);
}

async function main() {
  const code = process.argv[2];

  if (code) {
    await exchangeCode(code);
  } else {
    await getAuthUrl();
  }
}

main().catch(console.error);
