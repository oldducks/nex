# NEX Marketing Rev2 - Event Dictionary v1

## Purpose
นิยาม event กลางสำหรับ tracking พฤติกรรมผู้ใช้และ conversion ของระบบ NEX Marketing Rev2

## Base Event Schema
- `event_name` (string)
- `event_time` (ISO8601)
- `user_id` (string | null)
- `session_id` (string)
- `source` (`web` | `app` | `api`)
- `metadata` (object)

## Event Catalog
| event_name | trigger | required fields | note |
|---|---|---|---|
| page_view | เปิดหน้า | `page_path` | วัด traffic พื้นฐาน |
| click_cta | คลิกปุ่ม CTA | `cta_id`, `page_path` | วัด engagement |
| form_submit | กดส่งฟอร์ม | `form_id`, `status` | วัด conversion ขั้นฟอร์ม |
| lead_created | สร้าง lead สำเร็จ | `lead_id`, `channel` | วัด lead generation |
| purchase_complete | ชำระเงินสำเร็จ | `order_id`, `amount` | วัดรายได้ |

## Version
- v1
