"use client";

import React, { useEffect, useRef } from "react";
import Globe, { GlobeInstance } from "globe.gl";
import * as d3 from "d3";
import * as GeoJSON from "geojson";
import { cn } from "@/lib/utils";

interface CountryProperties {
  GDP_MD_EST?: number;
  POP_EST?: number;
  ISO_A2: string;
  ADMIN: string;
}

type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, CountryProperties>;

export default function GlobeComponent() {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<GlobeInstance | null>(null); // برای ذخیره نمونه Globe

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentRef = globeRef.current;
    if (!currentRef) return;

    const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);
    const getVal = (feat: CountryFeature) =>
      (feat.properties?.GDP_MD_EST ?? 0) /
      Math.max(1e5, feat.properties?.POP_EST ?? 1);

    fetch("/data/ne_110m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then(
        (
          countries: GeoJSON.FeatureCollection<
            GeoJSON.Geometry,
            CountryProperties
          >
        ) => {
          const maxVal = Math.max(...countries.features.map(getVal));
          colorScale.domain([0, maxVal]);

          const world = new Globe(currentRef);
          globeInstance.current = world; // ذخیره نمونه Globe برای استفاده بعدی

          world
            .globeImageUrl("/Globle-Gray.png")
            .backgroundImageUrl("")
            .backgroundColor("rgba(255, 255, 255, 0.15)")
            .lineHoverPrecision(0)
            .polygonsData(
              countries.features.filter((d) => d.properties?.ISO_A2 !== "AQ")
            )
            .width(600)
            .height(600)
            .polygonAltitude(0.06)
            .polygonCapColor(() => "#F4F4F4")
            .polygonSideColor(() => "#0085D426")
            .polygonStrokeColor(() => "#C2C2C2")
            // .polygonLabel((data: object) => {
            //   const country = data as CountryFeature;
            //   const properties = country.properties;
            //   if (!properties) return "";
            //   const countryFlagUrl = `https://GlobalArtInc.github.io/round-flags/flags/${properties.ISO_A2.toLowerCase()}.svg`;
            //   return `
            //     <span className="flex items-center justify-start" style="display:flex;align-items:center;gap:8px;background-color : rgb(37, 150, 190); padding : 8px; margin : 0;">
            //       <img src="${countryFlagUrl}" alt="Flag of ${properties.ADMIN}" style="width: 35px; height: 35px; margin-bottom: 2px; border-radius:50%;" />
            //       <p style="color:black;font-size:15px;font-weight:600;color:white">${properties.ADMIN} (${properties.ISO_A2})</p>
            //     </span>
            //   `;
            // })
            .onPolygonHover((hoverD: object | null) => {
              const countryHover = hoverD as CountryFeature | null;
              world
                .polygonAltitude((d: object) =>
                  d === countryHover ? 0.12 : 0.06
                )
                .polygonCapColor((d: object) => {
                  return d === countryHover ? "#0085D4" : "white";
                });
            })
            .onPolygonClick((clickedD: object) => {
              const countryClicked = clickedD as CountryFeature;
              const properties = countryClicked.properties;
              if (properties) {
                console.log(
                  `کلیک بر روی کشور: ${properties.ADMIN} (${properties.ISO_A2})`
                );
              }
            })
            .polygonsTransitionDuration(300);

          // تنظیمات کنترل‌ها برای چرخش خودکار
          // const controls = world.controls();
          // controls.autoRotate = true; // فعال کردن چرخش خودکار
          // controls.autoRotateSpeed = 0.75; // سرعت چرخش کم (می‌تونی این مقدار رو تنظیم کنی)

          // // توقف چرخش هنگام هاور
          // currentRef.addEventListener("mouseenter", () => {
          //   controls.autoRotate = false;
          // });

          // // ادامه چرخش بعد از خروج ماوس
          // currentRef.addEventListener("mouseleave", () => {
          //   controls.autoRotate = true;
          // });
        }
      );

    // cleanup برای حذف event listenerها موقع unmount
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("mouseenter", () => {});
        currentRef.removeEventListener("mouseleave", () => {});
      }
    };
  }, []);

  return (
    <div
      ref={globeRef}
      className={cn(
        "w-fit h-auto bg-[#f0f0f0] overflow-hidden flex items-center justify-center relative rounded-xl"
      )}
    />
  );
}
