# Market Comparison — NEX Solar Care vs Deye, SolisCloud, SOLARMAN

วันที่จัดทำ: 2026-05-30

เอกสารนี้ใช้สำหรับเปรียบเทียบตำแหน่งทางการตลาด จุดแข็ง จุดอ่อน และโอกาสของ
**NEX Solar Care** เมื่อเทียบกับแพลตฟอร์ม inverter monitoring / solar O&M ที่มีอยู่ในตลาด ได้แก่
Deye Cloud, SolisCloud และ SOLARMAN

## Executive Summary

NEX Solar Care ไม่ได้แข่งตรงแบบ 1:1 กับ Deye, SolisCloud หรือ SOLARMAN
เพราะแพลตฟอร์มเหล่านั้นมีจุดแข็งหลักเป็น **real-time inverter monitoring, data logger,
energy flow, alarm และ remote device management** ที่ผูกกับ hardware ecosystem ของตนเอง
หรือ ecosystem ด้าน monitoring โดยตรง

ตำแหน่งที่เหมาะสมของ NEX Solar Care คือ:

> After-sales OS สำหรับบริษัทโซลาร์ ที่รวม customer portal, service workflow,
> documents, warranty, support tickets, bill estimation และ AI assistant
> โดยสามารถเชื่อมข้อมูลจาก inverter cloud หลายยี่ห้อในอนาคต

กล่าวแบบสั้น:

- Deye, SolisCloud และ SOLARMAN เก่งเรื่องข้อมูลสดจากอุปกรณ์
- NEX Solar Care ควรเก่งเรื่องดูแลลูกค้า งานบริการ เอกสาร ticket และ AI หลังการขาย

## Product Positioning

| Product | Primary Positioning |
|---|---|
| NEX Solar Care | Customer portal + after-sales service management + AI assistant |
| Deye Cloud | Deye inverter cloud monitoring + logger + smart PV management |
| SolisCloud | Solis inverter monitoring, alarms, O&M, remote settings |
| SOLARMAN | Multi-device PV monitoring, Smart O&M, energy management platform |

## Feature Comparison

| Feature | NEX Solar Care | Deye Cloud | SolisCloud | SOLARMAN |
|---|---:|---:|---:|---:|
| Multi-tenant company management | Yes | Platform-level | Organization/team | Business platform |
| Customer portal | Yes | Yes | Yes | Yes |
| Real-time inverter telemetry | Partial / future integration | Strong | Strong | Strong |
| Energy flow visualization | Basic / future | Yes | Yes | Yes |
| Data logger integration | Connector scaffold / mock | Strong | Strong | Strong |
| Remote inverter settings/control | Not yet | Yes, via logger/cloud features | Yes, with installer permissions | Yes, device dependent |
| Fault alarms from inverter data | Not yet real-time | Yes | Yes | Yes |
| AI assistant | Yes | Not core public positioning | Not core public positioning | AI-powered analytics mentioned |
| Support ticket workflow | Strong | O&M dispatch features | O&M features | Smart O&M features |
| Technician workflow | Strong | Partial | Partial | Partial |
| Service record history | Strong | Not the main public focus | Not the main public focus | O&M oriented |
| Customer documents and warranty | Strong | Limited / not main focus | Limited / not main focus | Limited / not main focus |
| Bill estimation / tariff support | Strong MVP focus | Not main focus | Yield/earnings oriented | Energy analytics oriented |
| White-label / company branding | Yes | Not main focus | Not main focus | Not clear |
| Vendor-neutral strategy | Yes, intended | Mostly Deye ecosystem | Mostly Solis ecosystem | Broader device ecosystem |
| Native mobile app | Not yet | Yes | Yes | Yes |
| Localized service workflow for Thailand | Strong opportunity | Generic/global | Generic/global | Generic/global |

## NEX Solar Care Strengths

1. **After-sales workflow is the core product**
   - Customer profiles
   - Solar system profiles
   - Equipment records
   - Documents, warranty, invoices, manuals
   - Support tickets
   - Technician workflow
   - Service records
   - Maintenance reminders

2. **Multi-tenant SaaS architecture**
   - Company-scoped data
   - RBAC by role
   - Audit logs
   - Soft delete
   - White-label brand color support

3. **AI assistant is built into the customer experience**
   - Provider abstraction for Claude, OpenAI, or mock
   - Usage limits
   - Context retrieval from tenant-scoped data
   - Can become a Thai-language solar support assistant

4. **Business workflow is more flexible than inverter apps**
   - Can support multiple inverter brands
   - Can become the central system for installer operations
   - Can connect to Deye, SolisCloud, SOLARMAN, or manual records later

5. **Thailand-focused opportunity**
   - Bill estimation
   - Tariff profiles
   - Customer service and warranty processes
   - Thai/English i18n
   - Local installer workflows

## NEX Solar Care Weaknesses / Gaps

1. **No production-grade real-time telemetry yet**
   - No live inverter production, load, grid import/export, battery SOC, or fault code stream
   - Current production records are mainly manual / scaffolded

2. **No remote inverter control**
   - No remote parameter setting
   - No firmware update
   - No device command audit flow yet

3. **No data logger provisioning workflow**
   - No bind logger / bind serial number flow
   - No installer setup flow for WiFi, 4G, Bluetooth, or local commissioning

4. **No advanced performance diagnostics**
   - No string-level analysis
   - No I-V curve scan
   - No weather station or irradiance correlation
   - No automatic performance ratio diagnostics yet

5. **No native mobile app**
   - Current product is web-first
   - Market users are familiar with native monitoring apps

6. **Alarm engine is still a future opportunity**
   - Tickets exist, but automatic fault-to-ticket flow from inverter alarms is not yet implemented

## Competitor Notes

### Deye Cloud

Deye's smart PV management platform focuses on cloud monitoring, O&M, troubleshooting,
data analysis, energy flow visualization and data center collaboration. Public Deye
materials also describe logger capabilities such as WiFi / 4G / Ethernet communication,
cloud upload, remote firmware upgrade, parameter adjustment, remote debugging, OTA,
encrypted transmission and data backfill.

**Strengths**

- Strong integration with Deye inverter and logger ecosystem
- Real-time device data and cloud monitoring
- Remote maintenance and debugging
- Hardware-backed monitoring workflow

**Weaknesses vs NEX Solar Care**

- More Deye-centric
- Less focused on cross-brand after-sales CRM
- Customer documents, warranty, technician records and localized service workflow are not the main product story

### SolisCloud

SolisCloud is positioned as a Solis monitoring and O&M platform with real-time data,
alarm messaging, alarm recommendations, in-depth analysis, I-V curve scan, live power
flow and remote control/settings for installers.

**Strengths**

- Strong Solis inverter monitoring
- Alarm and recommendation workflow
- Remote settings/control for installers
- I-V curve and deeper system analysis

**Weaknesses vs NEX Solar Care**

- Mostly Solis ecosystem
- Less suitable as a vendor-neutral customer service operating system
- Not primarily designed around documents, warranties, support tickets and local after-sales workflows

### SOLARMAN

SOLARMAN Business is positioned as a PV plant management platform for distributors,
installers and O&M teams. Public materials describe plant visibility from portfolio
level down to device or string level, energy flow, generation, consumption, weather,
video surveillance, third-party inverter support, smart loads, Smart O&M alerts and
AI-powered data analysis.

**Strengths**

- Broad monitoring platform
- Supports many device types and third-party inverter scenarios
- Strong O&M analytics
- More advanced monitoring depth than a basic customer portal

**Weaknesses vs NEX Solar Care**

- Still primarily a monitoring / energy management platform
- Customer service operations may require separate business workflows
- Less tailored to individual installer processes such as Thai documents, warranty, service tickets and customer support history

## Strategic Recommendation

NEX Solar Care should not try to replace inverter monitoring platforms in the short term.
The better strategy is to become the **service and customer-care layer above monitoring platforms**.

Recommended positioning:

> One portal for solar companies to manage every customer, every system,
> every warranty, every ticket and every service visit, with AI support and
> optional inverter monitoring integrations.

## Suggested Roadmap

### Phase 1 — Strengthen Current Differentiation

1. Improve customer portal UX
2. Improve service ticket and technician workflow
3. Add monthly customer report
4. Add warranty expiration and maintenance reminders
5. Make AI assistant answer from customer-specific system, ticket, document and usage context

### Phase 2 — Add Monitoring Integrations

1. Add inverter account binding per customer / solar system
2. Add integration adapters for Deye, SolisCloud and SOLARMAN where API access is available
3. Import daily production automatically
4. Store normalized telemetry snapshots
5. Show live or near-live system status in the customer portal

### Phase 3 — Build Smart O&M Layer

1. Convert inverter alarms into suggested support tickets
2. Add offline system detection
3. Add abnormal production detection
4. Add technician assignment recommendations
5. Add AI explanations such as "why did production drop this month?"

### Phase 4 — Mobile / PWA

1. Make customer portal mobile-first
2. Add PWA install support
3. Add push notifications
4. Add technician field-service mobile views

## Recommended Differentiators for Sales

Use these points when explaining NEX Solar Care to customers or investors:

1. Not another inverter app
2. Works as the after-sales operating system for solar companies
3. Helps installers manage customers after installation
4. Reduces support workload with AI assistant and structured tickets
5. Keeps warranty, documents and service history in one place
6. Can integrate with multiple inverter platforms over time
7. Designed for local business workflows, including Thai language and tariff logic

## References

- Deye Smart PV Management Platform: https://au.deyeinverter.com/product/accessory-monitoring-1/smart-pv-management-platform.html
- Deye Wireless Energy Management System / Data Logger: https://www.deyeinverter.com/product/accessory-monitoring-1/Wireless-energy-management-system-2960.html
- SolisCloud product page: https://www.solisinverters.com/us/accessories6/SolisCloud_us.html
- SolisCloud monitoring overview: https://solis-service.solisinverters.com/en/support/solutions/articles/44002492965-soliscloud-monitoring-platform-overview
- SolisCloud remote control settings: https://solis-service.solisinverters.com/en/support/solutions/articles/44002638862-solis-cloud-remote-control-settings-desktop-version
- SOLARMAN Business: https://www.solarmanpv.com/products/solarman-business/
- SOLARMAN official site: https://www.solarmanpv.com/
