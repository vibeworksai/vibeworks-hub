# VibeWorks Hub API Documentation

**Base URL:** `https://app-dir-mu.vercel.app`

## For Farrah: API Integration Guide

### Projects API

**Get all projects:**
```bash
GET /api/projects
```

**Response:**
```json
{
  "projects": [
    {
      "id": "supreme-copy-trader",
      "name": "Supreme Copy Trader",
      "status": "On Track",
      "progress": 86,
      "lastUpdated": "2026-02-12T19:00:00.000Z"
    }
  ]
}
```

**Create new project:**
```bash
POST /api/projects
Content-Type: application/json

{
  "name": "New Project",
  "status": "On Track",
  "progress": 0
}
```

### Deals API (CRM Pipeline)

**Get all deals:**
```bash
GET /api/deals
```

**Response:**
```json
{
  "deals": [
    {
      "id": "1",
      "company": "Supreme Financial",
      "contact": "Jameel",
      "value": 36000,
      "stage": "Proposal Sent",
      "lastContact": "2026-02-12T19:00:00.000Z",
      "notes": "Copy trading platform proposal delivered"
    }
  ]
}
```

**Create new deal:**
```bash
POST /api/deals
Content-Type: application/json

{
  "company": "New Client",
  "contact": "Name",
  "value": 50000,
  "stage": "Lead",
  "notes": "Initial contact made"
}
```

**Update deal stage:**
```bash
PATCH /api/deals
Content-Type: application/json

{
  "id": "1",
  "stage": "Negotiation"
}
```

## Deal Stages

- `Lead` - Initial contact
- `Qualified` - Qualified opportunity
- `Proposal Sent` - Proposal delivered
- `Negotiation` - In negotiation
- `Closed Won` - Deal won
- `Closed Lost` - Deal lost

## Project Statuses

- `On Track` - Progressing well
- `Caution` - Needs attention
- `At Risk` - Behind schedule

## Usage Example (Python)

```python
import requests

# Get all projects
response = requests.get('https://app-dir-mu.vercel.app/api/projects')
projects = response.json()['projects']

# Create new deal
new_deal = {
    "company": "Acme Corp",
    "contact": "John Doe",
    "value": 75000,
    "stage": "Lead",
    "notes": "Referral from existing client"
}
response = requests.post('https://app-dir-mu.vercel.app/api/deals', json=new_deal)
```

## Notes

- Currently using mock data (no database)
- All timestamps in ISO 8601 format
- Future: Add authentication + Supabase database
