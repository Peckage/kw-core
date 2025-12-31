# Kwik

**Encrypted, expiring, single-use file sharing.**

Kwik lets you share files securely via a link. Files are encrypted client-side before upload, meaning the server never sees your data. Links can be set to expire and self-destruct after a single download.

> **Note:** Kwik is dark-mode-first by design in v0.1. Light mode is not currently supported.

## Features

- **Client-Side Encryption**: Files are encrypted in the browser using AES-256-GCM before being uploaded. The server only stores encrypted blobs.
- **Zero Knowledge**: Encryption keys are stored only in the URL fragment and never sent to the server.
- **Expiring Links**: Set expiry from 1 hour to 7 days, or never.
- **Single-Use Option**: First download wins - perfect for sensitive transfers.
- **No Account Required**: Upload and share without signing up.
- **Self-Destructing**: Files are automatically deleted after expiry or claim.

## How It Works

### Upload Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           UPLOAD FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. User selects file                                               │
│           │                                                         │
│           ▼                                                         │
│  2. Browser generates random AES-256 key                            │
│           │                                                         │
│           ▼                                                         │
│  3. File encrypted in browser using AES-256-GCM                     │
│           │                                                         │
│           ▼                                                         │
│  4. API creates object record, returns pre-signed upload URL        │
│           │                                                         │
│           ▼                                                         │
│  5. Encrypted blob uploaded directly to S3-compatible storage       │
│           │                                                         │
│           ▼                                                         │
│  6. Share URL generated: https://kwik.zip/claim/{id}#{key}          │
│                                                    ▲                │
│                                                    │                │
│                                           Key in fragment           │
│                                           (never sent to server)    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Claim Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLAIM FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Recipient opens link: https://kwik.zip/claim/{id}#{key}         │
│           │                                                         │
│           ▼                                                         │
│  2. Browser extracts key from URL fragment (client-side only)       │
│           │                                                         │
│           ▼                                                         │
│  3. API fetches metadata (without key)                              │
│           │                                                         │
│           ▼                                                         │
│  4. User clicks download                                            │
│           │                                                         │
│           ▼                                                         │
│  5. API claims object, returns pre-signed download URL              │
│     (if single-use: marks as claimed, schedules cleanup)            │
│           │                                                         │
│           ▼                                                         │
│  6. Browser downloads encrypted blob                                │
│           │                                                         │
│           ▼                                                         │
│  7. Browser decrypts using key from fragment                        │
│           │                                                         │
│           ▼                                                         │
│  8. Decrypted file saved to user's device                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Object Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OBJECT LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐                                                       │
│  │ CREATED  │ ──────────────────────────────────────────────────┐   │
│  └────┬─────┘                                                   │   │
│       │                                                         │   │
│       ▼                                                         │   │
│  ┌──────────┐      Expiry timer        ┌─────────┐              │   │
│  │  ACTIVE  │ ──────────────────────▶  │ EXPIRED │ ──┐          │   │
│  └────┬─────┘                          └─────────┘   │          │   │
│       │                                              │          │   │
│       │ First download                               │          │   │
│       │ (if single-use)                              │          │   │
│       ▼                                              ▼          │   │
│  ┌──────────┐                                   ┌─────────┐     │   │
│  │ CLAIMED  │ ────────────────────────────────▶ │ DELETED │ ◀───┘   │
│  └──────────┘       Cleanup job                 └─────────┘         │
│                                                                     │
│  • ACTIVE: Available for claim                                      │
│  • CLAIMED: Downloaded (single-use only)                            │
│  • EXPIRED: Past expiry time                                        │
│  • DELETED: Blob and metadata removed                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Encryption Details

### Algorithm

- **Cipher**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits (32 bytes)
- **IV Size**: 96 bits (12 bytes)
- **Auth Tag**: 128 bits

### Encrypted Format

```
┌────────────────┬────────────────────────────────────────┐
│   IV (12 B)    │   Ciphertext + Auth Tag                │
└────────────────┴────────────────────────────────────────┘
```

### Key Handling

1. Keys are generated using `crypto.getRandomValues()` (CSPRNG)
2. Keys are base64url encoded for URL-safe transmission
3. Keys are stored only in URL fragments (`#key`)
4. Fragments are never sent to the server in HTTP requests
5. Keys never appear in server logs or browser history URLs

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Encryption**: Web Crypto API
- **Storage**: S3-compatible (AWS S3, MinIO, R2, B2)
- **Cache/State**: Redis (ioredis)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── upload/page.tsx    # Upload form
│   ├── claim/[id]/page.tsx # Claim/download page
│   └── api/               # API routes
│       ├── create-object/ # Create new object
│       ├── fetch-meta/    # Get object metadata
│       └── claim-object/  # Claim and get download URL
├── core/                   # Core business logic
│   ├── kwik-object/       # Object types, model, service
│   │   ├── types.ts       # TypeScript interfaces
│   │   ├── model.ts       # Pure domain logic
│   │   ├── service.ts     # Orchestration
│   │   └── repository.ts  # Redis persistence
│   └── crypto/            # Encryption/decryption
│       ├── key-derivation.ts
│       ├── encrypt.ts
│       └── decrypt.ts
├── lib/                    # Infrastructure
│   ├── redis/             # Redis client
│   ├── storage/           # S3 storage driver
│   ├── hooks/             # React hooks
│   └── utils/             # Utility functions
├── ui/                     # UI components
│   ├── shadcn/            # shadcn/ui primitives
│   ├── components/        # Kwik-specific components
│   └── layouts/           # Page layouts
└── styles/                 # Global CSS
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Redis
REDIS_URL=redis://localhost:6379

# S3-Compatible Storage
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=kwik-objects

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_FILE_SIZE=104857600        # 100MB
MAX_EXPIRY_SECONDS=604800      # 7 days
```

## Development

### Prerequisites

- Node.js 20+
- Redis
- S3-compatible storage (MinIO for local dev)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Local Storage (MinIO)

```bash
# Start MinIO
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# Create bucket via console at http://localhost:9001
```

### Local Redis

```bash
docker run -p 6379:6379 redis:alpine
```

## API Reference

### POST /api/create-object

Creates a new KwikObject.

**Request:**

```json
{
  "fileName": "document.pdf",
  "mimeType": "application/pdf",
  "originalSize": 1024000,
  "encryptedSize": 1024016,
  "expirySeconds": 86400,
  "singleUse": true
}
```

**Response:**

```json
{
  "id": "abc123...",
  "uploadUrl": "https://storage.example.com/...",
  "storageKey": "objects/2024/01/15/abc123..."
}
```

### GET /api/fetch-meta?id={id}

Fetches public metadata for an object.

**Response:**

```json
{
  "id": "abc123...",
  "fileName": "document.pdf",
  "mimeType": "application/pdf",
  "originalSize": 1024000,
  "singleUse": true,
  "expiresAt": 1705363200000,
  "isClaimable": true
}
```

### POST /api/claim-object

Claims an object and returns download URL.

**Request:**

```json
{
  "id": "abc123..."
}
```

**Response (success):**

```json
{
  "success": true,
  "downloadUrl": "https://storage.example.com/..."
}
```

**Response (error):**

```json
{
  "success": false,
  "errorCode": "ALREADY_CLAIMED",
  "error": "This single-use file has already been downloaded"
}
```

## Security Considerations

1. **Keys in Fragments**: Encryption keys are transmitted only in URL fragments, which are not sent to the server in HTTP requests.

2. **No Server-Side Decryption**: The server never has access to decryption keys and cannot read file contents.

3. **Pre-Signed URLs**: Storage URLs are time-limited and single-purpose.

4. **Atomic Claims**: Single-use claims use Redis-based locking to prevent race conditions.

5. **Auto-Cleanup**: Expired and claimed objects are automatically deleted from storage.

## Global Statistics

Kwik displays anonymous, aggregate usage statistics on the landing page. This section explains what is tracked, what is NOT tracked, and why.

### What IS Tracked

| Stat      | Description                                               |
| --------- | --------------------------------------------------------- |
| `uploads` | Total number of files successfully encrypted and uploaded |
| `claims`  | Total number of files successfully claimed/downloaded     |
| `expired` | Total number of files that expired without being claimed  |

All stats are:

- **Aggregate only**: A single global counter, not per-user
- **Monotonically increasing**: Counters only go up, never reset
- **Stored in Redis**: Persists across server restarts

### What is NOT Tracked

Kwik explicitly does NOT collect:

- ❌ IP addresses
- ❌ User agents or browser fingerprints
- ❌ Timestamps per upload/download
- ❌ Geographic location
- ❌ Session or user identifiers
- ❌ File names or content
- ❌ Referrer URLs
- ❌ Historical timelines or trends
- ❌ Per-object statistics

### Why This Preserves Privacy

1. **No attribution**: There is no way to link a stat increment to any individual, session, or device.

2. **No correlation**: Stats are independent counters. You cannot determine if the same person uploaded and downloaded a file.

3. **No timing**: We don't store when stats changed. You cannot reconstruct activity patterns.

4. **No reversibility**: Counters only increment. You cannot determine if activity happened recently or months ago.

5. **Public by design**: All stats are publicly visible. We track nothing we wouldn't show everyone.

### Stats API

```
GET /api/stats
```

**Response:**

```json
{
  "uploads": 1284,
  "claims": 1019,
  "expired": 265
}
```

- No authentication required
- Cached for 60 seconds
- Returns zeros on error (graceful degradation)

## Limitations

- Maximum file size: 100MB (configurable)
- Maximum expiry: 7 days (configurable)
- No user accounts (by design)
- No file preview (encrypted blobs)

## License

MIT

---

Built by [Kwik Labs](https://x.com/kwiklabs)
