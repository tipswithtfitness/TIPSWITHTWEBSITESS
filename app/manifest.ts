import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tips With T Athlete App",
    short_name: "Tips With T",
    description:
      "Athlete training plans, workout sections, progress, videos, and coach updates from Tips With T.",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#020713",
    theme_color: "#020713",
    categories: ["health", "fitness", "sports"],
    icons: [
      {
        src: "/logo.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
