# NEX Marketing Rev2 - Agent Run Schema v1

## Purpose
กำหนดโครงสร้างข้อมูลการรัน Agent ต่อรอบ เพื่อใช้ติดตามสถานะ ผลลัพธ์ และต้นทุน

## Core Fields
- `run_id` (string)
- `agent_name` (string)
- `workflow_name` (string)
- `trigger_type` (`manual` | `schedule` | `event`)
- `status` (`queued` | `running` | `success` | `failed` | `cancelled`)
- `started_at` (datetime)
- `ended_at` (datetime | null)
- `duration_ms` (number | null)
- `input_payload` (json)
- `output_payload` (json | null)
- `error_message` (string | null)

## Version
- v1
