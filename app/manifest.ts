import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tips With T",
    short_name: "Tips With T",
    description: "Athlete coaching dashboard for Tips With T.",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    background_color: "#020713",
    theme_color: "#020713",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/bluetipswitht.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["health", "fitness", "sports", "productivity"],
  };
}
