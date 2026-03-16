# NEX Marketing Rev2 - Action Status Flow v1

## Purpose
กำหนดสถานะมาตรฐานของ Action ในระบบ เพื่อให้ workflow และ dashboard ติดตามงานได้ตรงกัน

## Status Lifecycle
1. `draft`
2. `queued`
3. `running`
4. `success`
5. `failed`
6. `cancelled`

## Allowed Transitions
- `draft -> queued`
- `queued -> running | cancelled`
- `running -> success | failed | cancelled`
- `failed -> queued` (retry)

## Version
- v1
