import Link from "next/link";

const contactNumber = "0556215107";
const internationalNumber = "966556215107";
const email = "klosrg89tt@gmail.com";
const instagram = "zeta_12123";

export default function AccountsPage() {
  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#08070d] px-4 pb-16 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-32 h-[480px] w-[480px] rounded-full bg-violet-700/20 blur-[145px]" />
        <div className="absolute -bottom-44 -left-40 h-[500px] w-[500px] rounded-full bg-fuchsia-700/15 blur-[150px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black shadow-lg shadow-violet-950/40">
            Z
          </div>

          <div>
            <h1 className="text-lg font-black tracking-wider">ZETA</h1>
            <p className="text-[10px] text-gray-500">حساباتنا الرسمية</p>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-[11px] font-black text-gray-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 active:scale-95"
        >
          <span>الرئيسية</span>
          <span>←</span>
        </Link>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl pt-8 sm:pt-14">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-[11px] font-black text-violet-300">
            تواصل معنا مباشرة
          </span>

          <h2 className="mt-5 text-3xl font-black sm:text-5xl">
            حسابات ZETA الرسمية
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-400">
            هذه وسائل التواصل الرسمية للمتجر. اضغط على الحساب الذي
            يناسبك وسيفتح لك مباشرة.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <article className="group relative overflow-hidden rounded-[30px] border border-emerald-400/15 bg-gradient-to-br from-emerald-500/10 via-[#12131a] to-[#0d0c12] p-5 transition hover:-translate-y-1 hover:border-emerald-400/35">
            <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12.04 2a9.83 9.83 0 0 0-8.47 14.82L2 22l5.32-1.52A9.97 9.97 0 1 0 12.04 2Zm0 17.84a7.82 7.82 0 0 1-3.99-1.09l-.29-.17-3.16.9.92-3.08-.19-.31a7.73 7.73 0 0 1-1.2-4.14 7.91 7.91 0 1 1 7.91 7.89Zm4.34-5.93c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1-.37-1.91-1.18-.7-.63-1.18-1.41-1.32-1.65-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-emerald-400">
                  واتساب ورقم التواصل
                </p>
                <h3 className="mt-1 text-lg font-black">{contactNumber}</h3>
                <p className="mt-2 text-xs leading-6 text-gray-500">
                  للتواصل والاستفسارات عبر الواتساب.
                </p>
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${internationalNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-black text-[#07110c] transition hover:brightness-110 active:scale-95"
              >
                فتح واتساب
              </a>

              <a
                href={`tel:+${internationalNumber}`}
                className="flex items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-xs font-black text-emerald-300 transition hover:bg-emerald-500/15 active:scale-95"
              >
                اتصال
              </a>
            </div>
          </article>

          <a
            href={`mailto:${email}`}
            className="group relative overflow-hidden rounded-[30px] border border-violet-400/15 bg-gradient-to-br from-violet-500/10 via-[#12131a] to-[#0d0c12] p-5 transition hover:-translate-y-1 hover:border-violet-400/35"
          >
            <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-violet-300">
                  البريد الإلكتروني
                </p>
                <h3 className="mt-1 break-all text-base font-black">
                  {email}
                </h3>
                <p className="mt-2 text-xs leading-6 text-gray-500">
                  اضغط على البطاقة لإرسال رسالة عبر البريد.
                </p>
              </div>
            </div>
          </a>

          <a
            href={`https://www.instagram.com/${instagram}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-[30px] border border-fuchsia-400/15 bg-gradient-to-br from-fuchsia-500/10 via-[#12131a] to-[#0d0c12] p-5 transition hover:-translate-y-1 hover:border-fuchsia-400/35"
          >
            <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-fuchsia-500/10 blur-3xl" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-fuchsia-300">
                  إنستغرام
                </p>
                <h3 className="mt-1 text-lg font-black">@{instagram}</h3>
                <p className="mt-2 text-xs leading-6 text-gray-500">
                  تابع حسابنا الرسمي وآخر الإعلانات.
                </p>
              </div>
            </div>
          </a>

          <article className="relative overflow-hidden rounded-[30px] border border-sky-400/15 bg-gradient-to-br from-sky-500/10 via-[#12131a] to-[#0d0c12] p-5">
            <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M21.7 3.4 18.8 20c-.22 1.17-.8 1.46-1.62.91l-4.42-3.26-2.13 2.05c-.24.24-.44.44-.9.44l.32-4.5 8.19-7.4c.36-.32-.08-.5-.55-.18L7.57 14.43 3.2 13.06c-.95-.3-.97-.95.2-1.4L20.5 5.08c.79-.29 1.48.18 1.2 1.32Z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-sky-300">
                  تليجرام
                </p>
                <h3 className="mt-1 text-lg font-black">قريبًا</h3>
                <p className="mt-2 text-xs leading-6 text-gray-500">
                  سيتم إضافة حساب التليجرام هنا عند توفره.
                </p>
              </div>
            </div>
          </article>
        </div>

        <div className="mx-auto mt-7 max-w-2xl rounded-[24px] border border-amber-400/15 bg-amber-500/[0.06] px-5 py-4 text-center">
          <p className="text-xs leading-6 text-amber-100/70">
            تأكد دائمًا أنك تتواصل مع الحسابات المعروضة في هذه
            الصفحة فقط.
          </p>
        </div>
      </section>
    </main>
  );
}