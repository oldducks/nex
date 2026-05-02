import Link from "next/link";
import { ArrowRight, BookOpen, Image as ImageIcon, Mic, Video } from "lucide-react";
import type { ComponentType } from "react";
import ManageTopBar from "@/components/ManageTopBar";

type CategoryCard = {
  key: string;
  title: string;
  description: string;
  status: "active" | "coming-soon";
  href?: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const CATEGORY_CARDS: CategoryCard[] = [
  {
    key: "examples",
    title: "ตัวอย่างร้านค้า",
    description: "ดูตัวอย่างหน้าขายสำหรับธุรกิจต่าง ๆ เพื่อใช้เป็นแนวทางในการสร้างหน้าของคุณ",
    status: "active",
    href: "/manage/learning-media/examples",
    icon: BookOpen,
  },
  {
    key: "images",
    title: "ภาพ",
    description: "ตัวอย่างภาพสำหรับใช้ประกอบหน้าขาย",
    status: "coming-soon",
    icon: ImageIcon,
  },
  {
    key: "audio",
    title: "เสียง",
    description: "ตัวอย่างเสียงแนะนำธุรกิจ หรือเสียงประกอบสำหรับหน้าขาย",
    status: "coming-soon",
    icon: Mic,
  },
  {
    key: "video",
    title: "วิดีโอ",
    description: "ตัวอย่างวิดีโอโปรโมทธุรกิจสำหรับใช้เป็นแนวทาง",
    status: "coming-soon",
    icon: Video,
  },
];

export default function LearningMediaPage() {
  return (
    <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
      <ManageTopBar backHref="/manage/control" title="สื่อการเรียนรู้" subtitle="Learning Media" />

      <main className="mx-auto w-full max-w-md px-4 py-5">
        <section className="rounded-[24px] border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.2)]">
          <h1 className="text-xl font-black text-[#050579]">สื่อการเรียนรู้</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#475569]">
            รวมตัวอย่างและแนวทางการสร้างหน้าขายด้วย NEX Solution เพื่อช่วยให้คุณออกแบบหน้าของตัวเองได้ง่ายขึ้น
          </p>
        </section>

        <section className="mt-4 space-y-3">
          {CATEGORY_CARDS.map((card) => {
            const Icon = card.icon;

            if (card.status === "active" && card.href) {
              return (
                <Link
                  key={card.key}
                  href={card.href}
                  className="block rounded-[20px] border border-[#D9E1F2] bg-white p-4 transition hover:border-[#C7D2E5]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F8FF] text-[#050579]">
                        <Icon size={20} />
                      </span>
                      <div>
                        <p className="text-base font-bold text-[#0F172A]">{card.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#475569]">{card.description}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="mt-1 shrink-0 text-[#475569]" />
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={card.key}
                className="rounded-[20px] border border-[#D9E1F2] bg-[#F8FAFF] p-4 opacity-80"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#94A3B8]">
                    <Icon size={20} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-[#334155]">{card.title}</p>
                      <span className="rounded-full border border-[#F6D5BF] bg-[#FFF1E8] px-2 py-0.5 text-[10px] font-bold text-[#C2410C]">
                        เร็ว ๆ นี้
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[#64748B]">{card.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
