export default function ThemePreviewPage() {
  const palette = {
    cyan: '#12B8C8',
    cyanDeep: '#0A7F92',
    cyanSoft: '#E6FAFD',
    orange: '#F28B30',
    orangeSoft: '#FFF3E8',
    green: '#8ED9B5',
    greenSoft: '#ECFAF3',
    ink: '#07343B',
  };

  return (
    <main
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(145deg, #E6FAFD 0%, #CFF5FA 35%, #B5EEF5 65%, #A4E8F1 100%)',
        color: palette.ink,
        fontFamily: "'Plus Jakarta Sans', 'Sarabun', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sarabun:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
        <div
          className="rounded-3xl border p-4 sm:p-5"
          style={{
            backgroundColor: 'rgba(255,255,255,0.62)',
            borderColor: 'rgba(10,127,146,0.25)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: palette.cyanDeep }}>
                Theme Preview
              </p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">พรีวิวโทนสี ฟ้าคราม 70 / ส้ม 20 / เขียวอ่อน 10</h1>
            </div>
            <button
              className="rounded-full px-5 py-2 text-sm font-bold text-white shadow-md"
              style={{
                backgroundColor: palette.orange,
                boxShadow: '0 10px 24px rgba(242,139,48,0.38)',
              }}
            >
              ปุ่มหลัก (CTA)
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-full" style={{ border: '1px solid rgba(7,52,59,0.12)' }}>
            <div className="flex h-5 w-full">
              <div className="h-full" style={{ width: '70%', backgroundColor: palette.cyan }} />
              <div className="h-full" style={{ width: '20%', backgroundColor: palette.orange }} />
              <div className="h-full" style={{ width: '10%', backgroundColor: palette.green }} />
            </div>
          </div>
          <p className="mt-2 text-xs font-semibold" style={{ color: 'rgba(7,52,59,0.78)' }}>
            Color Ratio: Cyan 70% | Orange 20% | Light Green 10%
          </p>
        </div>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <article
            className="rounded-3xl border p-6 sm:p-8"
            style={{
              background:
                'linear-gradient(160deg, rgba(18,184,200,0.18) 0%, rgba(10,127,146,0.14) 45%, rgba(255,255,255,0.68) 100%)',
              borderColor: 'rgba(10,127,146,0.2)',
            }}
          >
            <p className="inline-flex rounded-full px-3 py-1 text-xs font-bold"
              style={{ backgroundColor: palette.orangeSoft, color: palette.orange }}>
              ไฮไลต์ด้วยสีส้ม 20%
            </p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
              หน้าตาเว็บจะสดขึ้น
              <span className="block" style={{ color: palette.cyanDeep }}>แต่ยังดูมืออาชีพ</span>
            </h2>
            <p className="mt-4 max-w-2xl text-sm sm:text-base" style={{ color: 'rgba(7,52,59,0.78)' }}>
              โทนหลักใช้ฟ้าครามเพื่อความชัดเจนและเทคโนโลยี, ส้มใช้ดึงสายตาเฉพาะจุดที่ต้องการให้คลิก,
              และเขียวอ่อนใช้กับสถานะเชิงบวกเพื่อไม่แย่งความเด่นจาก CTA หลัก.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                style={{ backgroundColor: palette.orange }}
              >
                เริ่มใช้งาน
              </button>
              <button
                className="rounded-xl border px-5 py-2.5 text-sm font-semibold"
                style={{ borderColor: 'rgba(10,127,146,0.35)', color: palette.cyanDeep, backgroundColor: 'rgba(255,255,255,0.65)' }}
              >
                ดูตัวอย่าง
              </button>
            </div>
          </article>

          <aside
            className="rounded-3xl border p-5"
            style={{
              backgroundColor: 'rgba(255,255,255,0.74)',
              borderColor: 'rgba(10,127,146,0.22)',
            }}
          >
            <h3 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: palette.cyanDeep }}>
              UI Tokens
            </h3>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Primary Surface', color: palette.cyan, use: 'พื้นหลังหลัก / Header' },
                { label: 'Action Accent', color: palette.orange, use: 'ปุ่ม CTA / Badge' },
                { label: 'Success Accent', color: palette.green, use: 'สถานะสำเร็จ / จุดยืนยัน' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border p-3"
                  style={{ borderColor: 'rgba(7,52,59,0.12)', backgroundColor: '#ffffff' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-xl" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs" style={{ color: 'rgba(7,52,59,0.66)' }}>{item.use}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'rgba(142,217,181,0.45)', backgroundColor: palette.greenSoft }}>
              <p className="text-sm font-semibold" style={{ color: '#2E6E53' }}>
                ตัวอย่างสถานะสำเร็จ: บันทึกข้อมูลเรียบร้อย
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
