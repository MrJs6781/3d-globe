// src/app/page.tsx
import dynamic from "next/dynamic";

// GlobeComponent رو به صورت داینامیک وارد می‌کنیم و SSR رو غیرفعال می‌کنیم
const GlobeComponent = dynamic(() => import("./components/globe"), {
  ssr: false, // غیرفعال کردن Server-Side Rendering
});

export default function Home() {
  return (
    <div className="w-full h-screen overscroll-none flex items-center justify-center">
      <GlobeComponent />
    </div>
  );
}
