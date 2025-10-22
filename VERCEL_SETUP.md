# Vercel Deployment Setup - YDB Database Connection Issue

## Problem
YDB SDK uses gRPC which has DNS resolution issues in Vercel's AWS Lambda environment:
```
Error: 14 UNAVAILABLE: Failed to parse DNS address dns:ydb.serverless.yandexcloud.net:2135
```

## Required Environment Variables

Make sure these are set in **Vercel Dashboard → Settings → Environment Variables**:

### 1. YDB_ENDPOINT
```
grpcs://ydb.serverless.yandexcloud.net:2135
```

### 2. YDB_DATABASE
```
/ru-central1/b1gec1aqb2kmloc82i61/etnl57vql30llfu2h1sa
```

### 3. YDB_SERVICE_ACCOUNT_KEY_JSON
This should be the **entire JSON content** of your Yandex Cloud service account key file, as a **single-line string**.

Example format:
```json
{"id":"...","service_account_id":"...","created_at":"...","key_algorithm":"RSA_2048","public_key":"-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"}
```

**Important**: Copy the entire JSON content, including all newlines in the private/public keys.

## How to Add Environment Variables to Vercel

1. Go to https://vercel.com/[your-username]/[your-project]/settings/environment-variables
2. Click "Add New"
3. Name: `YDB_ENDPOINT`, Value: `grpcs://ydb.serverless.yandexcloud.net:2135`
4. Select environments: Production, Preview, Development
5. Click "Save"
6. Repeat for `YDB_DATABASE` and `YDB_SERVICE_ACCOUNT_KEY_JSON`

## Alternative Solutions

If the DNS issue persists, consider these alternatives:

### Option 1: Use Vercel KV (Redis)
- Fast, serverless-friendly
- No DNS issues
- Simple integration
- Costs apply for usage

### Option 2: Use Vercel Postgres
- SQL database
- Serverless-optimized
- Good for relational data
- Costs apply for usage

### Option 3: Use Supabase (PostgreSQL)
- Free tier available
- REST API + PostgreSQL
- Good serverless support

### Option 4: HTTP API for YDB
- Use YDB Document API over HTTP instead of gRPC
- Requires switching from `ydb-sdk` to HTTP client
- More reliable in serverless environments

## Current Workarounds Applied

1. ✅ Increased connection timeout to 15s
2. ✅ Added SSL credentials configuration
3. ✅ Optimized connection pooling for serverless
4. ✅ Added better error messages
5. ✅ Added environment variable validation

## Testing Locally

To test locally:
```bash
npm run dev
```

Then visit http://localhost:3001/profile (must be logged in with Clerk)

## Debugging

Check Vercel logs for:
1. Environment variables are loaded: Look for `"hasEndpoint": true, "hasDatabase": true, "hasServiceAccount": true`
2. Connection attempts: Look for `"Connecting to YDB: grpcs://..."`
3. Specific error messages about DNS or connection failures

## Next Steps

If the issue persists after verifying environment variables:
1. Contact Vercel support about gRPC/DNS issues
2. Consider migrating to HTTP-based YDB Document API
3. Or migrate to a Vercel-native database solution (KV/Postgres)
