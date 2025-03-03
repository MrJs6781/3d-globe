"use client";

import dynamic from "next/dynamic";

const GlobeComponent = dynamic(() => import("./globe"), {
  ssr: false,
});

export default function DynamicGlobe() {
  return <GlobeComponent />;
}
