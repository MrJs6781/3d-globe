"use client";

import React, { useEffect, useRef, useState } from "react";
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

interface CountryWithCoords extends CountryProperties {
  lat: number;
  lng: number;
}

export default function GlobeComponent() {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<GlobeInstance | null>(null);
  const [countriesList, setCountriesList] = useState<CountryWithCoords[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Initial setup of the globe, runs only once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentRef = globeRef.current;
    if (!currentRef) return;

    // Define color scale for potential future use (e.g., GDP visualization)
    const colorScale = d3.scaleSequentialSqrt(d3.interpolateYlOrRd);
    const getVal = (feat: CountryFeature) =>
      (feat.properties?.GDP_MD_EST ?? 0) /
      Math.max(1e5, feat.properties?.POP_EST ?? 1);

    // Fetch country data from GeoJSON
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

          // Extract country properties and coordinates for the list
          const filteredCountries = countries.features
            .filter((d) => d.properties?.ISO_A2 !== "AQ")
            .map((d) => {
              const centroid = d3.geoCentroid(d.geometry);
              return {
                ...d.properties!,
                lat: centroid[1],
                lng: centroid[0],
              };
            });
          setCountriesList(filteredCountries);

          // Initialize the globe
          const world = new Globe(currentRef);
          globeInstance.current = world;

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
            .polygonAltitude((d: object) => {
              const country = d as CountryFeature;
              return country.properties?.ISO_A2 === selectedCountry
                ? 0.15
                : 0.06;
            })
            .polygonCapColor((d: object) => {
              const country = d as CountryFeature;
              return country.properties?.ISO_A2 === selectedCountry
                ? "#FF5733"
                : "#F4F4F4";
            })
            .polygonSideColor(() => "#0085D426")
            .polygonStrokeColor(() => "#C2C2C2")
            .polygonLabel((data: object) => {
              const country = data as CountryFeature;
              const properties = country.properties;
              if (!properties) return "";
              const countryFlagUrl = `https://GlobalArtInc.github.io/round-flags/flags/${properties.ISO_A2.toLowerCase()}.svg`;
              return `
                <span className="flex items-center justify-start" style="display:flex;align-items:center;gap:8px;background-color : rgb(37, 150, 190); padding : 8px; margin : 0;">
                  <img src="${countryFlagUrl}" alt="Flag of ${properties.ADMIN}" style="width: 35px; height: 35px; margin-bottom: 2px; border-radius:50%;" />
                  <p style="color:black;font-size:15px;font-weight:600;color:white">${properties.ADMIN} (${properties.ISO_A2})</p>
                </span>
              `;
            })
            .onPolygonHover((hoverD: object | null) => {
              const countryHover = hoverD as CountryFeature | null;
              world
                .polygonAltitude((d: object) => {
                  const country = d as CountryFeature;
                  if (country.properties?.ISO_A2 === selectedCountry)
                    return 0.15;
                  return d === countryHover ? 0.12 : 0.06;
                })
                .polygonCapColor((d: object) => {
                  const country = d as CountryFeature;
                  if (country.properties?.ISO_A2 === selectedCountry)
                    return "#FF5733";
                  return d === countryHover ? "#0085D4" : "#F4F4F4";
                });
            })
            .onPolygonClick((clickedD: object) => {
              const countryClicked = clickedD as CountryFeature;
              const properties = countryClicked.properties;
              if (properties) {
                console.log(
                  `Clicked on country: ${properties.ADMIN} (${properties.ISO_A2})`
                );
              }
            })
            .polygonsTransitionDuration(300);

          // Enable auto-rotation with controls
          const controls = world.controls();
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.75;

          currentRef.addEventListener("mouseenter", () => {
            controls.autoRotate = false;
          });

          currentRef.addEventListener("mouseleave", () => {
            controls.autoRotate = true;
          });
        }
      );

    // Cleanup event listeners on unmount
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("mouseenter", () => {});
        currentRef.removeEventListener("mouseleave", () => {});
      }
    };
  }, []); // No dependencies, runs only once

  // Handle country click with smooth transition
  const handleCountryClick = (isoCode: string, lat: number, lng: number) => {
    if (!globeInstance.current) return;

    setSelectedCountry(isoCode);
    const controls = globeInstance.current.controls();
    controls.autoRotate = false; // Stop auto-rotation

    // Smoothly transition to the selected country
    globeInstance.current.pointOfView(
      {
        lat,
        lng,
        altitude: 1.5,
      },
      1000 // Duration in milliseconds for smooth transition
    );

    // Update altitude and color for the selected country
    globeInstance.current
      .polygonAltitude((d: object) => {
        const country = d as CountryFeature;
        return country.properties?.ISO_A2 === isoCode ? 0.15 : 0.06;
      })
      .polygonCapColor((d: object) => {
        const country = d as CountryFeature;
        return country.properties?.ISO_A2 === isoCode ? "#FF5733" : "#F4F4F4";
      });
  };

  return (
    <div className="flex flex-row gap-8 p-4">
      {/* Globe container */}
      <div
        ref={globeRef}
        className={cn(
          "w-fit h-auto bg-[#f0f0f0] overflow-hidden flex items-center justify-center relative rounded-xl"
        )}
      />
      {/* Country list container */}
      <div className="max-w-96 h-[600px] overflow-y-auto bg-white rounded-xl shadow-md p-4">
        <h2 className="text-lg font-bold mb-4">Countries</h2>
        <ul className="space-y-2 grid grid-cols-2 overflow-x-hidden p-1 gap-2">
          {countriesList.map((country, _index) => (
            <li
              key={_index}
              className="flex items-center gap-2 cursor-pointer hover:scale-[1.05] duration-200"
              onClick={() =>
                handleCountryClick(country.ISO_A2, country.lat, country.lng)
              }
            >
              <img
                src={`https://GlobalArtInc.github.io/round-flags/flags/${country.ISO_A2.toLowerCase()}.svg`}
                alt={`Flag of ${country.ADMIN}`}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm">
                {country.ADMIN} ({country.ISO_A2})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
