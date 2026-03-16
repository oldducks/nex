# NEX Marketing Rev2 - Consent Policy Contract v1

## Purpose
กำหนดสัญญาข้อมูล (contract) สำหรับการขอและจัดเก็บความยินยอม (consent) ให้สอดคล้อง PDPA

## Consent Object Contract
- `consent_id` (string)
- `user_id` (string | null)
- `consent_type` (enum): `privacy_policy`, `marketing`, `cookie_analytics`, `cookie_ads`
- `status` (enum): `granted`, `revoked`
- `version` (string)
- `granted_at` (datetime | null)
- `revoked_at` (datetime | null)
- `source` (string)
- `ip` (string | null)
- `user_agent` (string | null)

## Version
- v1
