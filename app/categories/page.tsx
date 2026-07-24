"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  title: string;
  description: string;
  icon: string;
  slug: string;
  href: string;
};

const fallbackCategories: Category[] = [
  {
    id: "simulation",
    title: "ألعاب المحاكاة",
    description: "تجارب تحاكي حياة وواقع",
    icon: "🕹️",
    slug: "simulation",
    href: "/categories/simulation",
  },
  {
    id: "sports",
    title: "ألعاب الرياضة",
    description: "كرة قدم ورياضات متنوعة",
    icon: "⚽",
    slug: "sports",
    href: "/categories/sports",
  },
  {
    id: "action",
    title: "ألعاب الأكشن",
    description: "قتال، إطلاق نار وحماس",
    icon: "🔥",
    slug: "action",
    href: "/categories/action",
  },
  {
    id: "2d",
    title: "ألعاب 2D",
    description: "لعب خفيف وأجواء كلاسيكية",
    icon: "👾",
    slug: "2d",
    href: "/categories/2d",
  },
  {
    id: "adventure",
    title: "ألعاب المغامرات",
    description: "استكشاف وقصص وعوالم",
    icon: "🗺️",
    slug: "adventure",
    href: "/categories/adventure",
  },
  {
    id: "horror",
    title: "ألعاب الرعب",
    description: "رعب وتشويق وبقاء",
    icon: "👻",
    slug: "horror",
    href: "/categories/horror",
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      const { data, error } = await supabase
        .from("home_categories")
        .select(
          "id, name, icon, slug, link_url, page_description, sort_order, is_active, is_system"
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("تعذر تحميل التصنيفات:", error);
        return;
      }

      const mapped = (data ?? [])
        .filter((category) => {
          const isAllCategory =
            category.is_system === true && category.name === "الكل";

          return !isAllCategory && Boolean(category.slug || category.link_url);
        })
        .map((category): Category => {
          const slug = category.slug ?? "";
          const href = category.link_url || `/categories/${slug}`;

          return {
            id: category.id,
            title: category.name || "تصنيف",
            description:
              category.page_description || "الألعاب الموجودة في هذا التصنيف",
            icon: category.icon || "🎮",
            slug: slug || category.id,
            href,
          };
        });

      if (mounted && mapped.length > 0) {
        setCategories(mapped);
      }
    }

    loadCategories();

    const channel = supabase
      .channel("all-categories-page")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "home_categories",
        },
        () => {
          loadCategories();
        }
      )
      .subscribe();

    function refreshOnFocus() {
      loadCategories();
    }

    window.addEventListener("focus", refreshOnFocus);

    return () => {
      mounted = false;
      window.removeEventListener("focus", refreshOnFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-32 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-28 top-10 h-96 w-96 rounded-full bg-violet-700/15 blur-[120px]" />
        <div className="absolute -left-28 bottom-10 h-96 w-96 rounded-full bg-fuchsia-700/10 blur-[120px]" />
      </div>

      <header className="relative z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black shadow-lg shadow-violet-900/30">
              Z
            </div>

            <div>
              <h1 className="text-xl font-black tracking-wider">ZETA</h1>
              <p className="text-[10px] text-gray-500">
                متجر الألعاب الرقمية
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 text-[11px] font-black text-gray-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 active:scale-95"
          >
            <span>العودة للرئيسية</span>

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 fill-none stroke-current stroke-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15 6-6 6 6 6"
              />
            </svg>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-5">
        <div className="relative overflow-hidden rounded-[30px] border border-violet-400/15 bg-[radial-gradient(circle_at_50%_10%,rgba(59,130,246,0.32),transparent_48%),linear-gradient(135deg,#17142b,#0d0b16)] px-5 py-10 text-center shadow-2xl shadow-violet-950/20 sm:py-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/15 blur-[90px]" />

          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-600/15 blur-[90px]" />

          <div className="relative">
            <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-[11px] font-black text-violet-300">
              اختر لعبتك
            </span>

            <h2 className="mt-5 text-3xl font-black sm:text-4xl">
              كل التصنيفات
            </h2>

            <p className="mt-3 text-sm text-gray-400">
              اختر قسمًا لعرض الألعاب
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group flex min-h-[132px] items-center gap-4 rounded-[26px] border border-white/[0.08] bg-gradient-to-br from-[#181724] to-[#101019] p-4 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-violet-400/35 hover:shadow-2xl hover:shadow-violet-950/30 active:scale-[0.99]"
            >
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-600 text-4xl shadow-xl shadow-violet-900/30 transition duration-300 group-hover:scale-105">
                {category.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-black">
                  {category.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {category.description}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/10 transition group-hover:bg-violet-500/20">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 fill-none stroke-current stroke-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15 6-6 6 6 6"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}