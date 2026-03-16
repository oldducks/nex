# NEX Marketing Rev2 - Follow-up Domain Model v1

## Purpose
กำหนด domain model สำหรับ workflow การติดตาม lead ไปจนถึงปิดการขาย

## Entity: Lead
- `lead_id`
- `name`
- `email`
- `phone`
- `source`
- `created_at`

## Entity: FollowUpTask
- `task_id`
- `lead_id`
- `owner_user_id`
- `channel` (`call` | `chat` | `email`)
- `due_at`
- `status` (`pending` | `done` | `skipped`)
- `note`

## Entity: FollowUpTimelineEvent
- `event_id`
- `lead_id`
- `event_type` (`created` | `contacted` | `replied` | `qualified` | `closed`)
- `event_time`
- `metadata`

## Version
- v1
