interface NeoAsteroid {
  id: string;
  name: string;
  nasa_jpl_url: string;
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: {
    close_approach_date: string;
    relative_velocity: { kilometers_per_hour: string };
    miss_distance: { kilometers: string };
  }[];
}

interface NeoFeedResponse {
  near_earth_objects: Record<string, NeoAsteroid[]>;
}

export function mapNeoToEvents(asteroids: NeoAsteroid[]) {
  return asteroids.map((a) => {
    const approach = a.close_approach_data[0];
    const isHazardous = a.is_potentially_hazardous_asteroid;
    const distanceKm = parseFloat(approach?.miss_distance.kilometers || "0");
    const velocityKmh = parseFloat(
      approach?.relative_velocity.kilometers_per_hour || "0"
    );
    const diameterMin = a.estimated_diameter.meters.estimated_diameter_min;
    const diameterMax = a.estimated_diameter.meters.estimated_diameter_max;

    return {
      channel: "nasa-neo",
      title: `Asteroid ${a.name.replace(/[()]/g, "")}`,
      description: `Close approach: ${Math.round(distanceKm).toLocaleString()} km away, traveling at ${Math.round(velocityKmh).toLocaleString()} km/h. Diameter: ${Math.round(diameterMin)}-${Math.round(diameterMax)}m.${isHazardous ? " Potentially hazardous!" : ""}`,
      tags: [
        "nasa",
        "neo",
        "asteroid",
        ...(isHazardous ? ["hazardous"] : []),
      ],
      metadata: {
        asteroidId: a.id,
        name: a.name,
        missDistanceKm: distanceKm,
        velocityKmh: velocityKmh,
        diameterMinM: diameterMin,
        diameterMaxM: diameterMax,
        isHazardous: isHazardous,
        closeApproachDate: approach?.close_approach_date,
        nasaUrl: a.nasa_jpl_url,
      },
      icon: isHazardous ? "alert-triangle" : "globe",
      importance: isHazardous ? "critical" : "normal",
    };
  });
}

export async function fetchNeoFeed(): Promise<NeoAsteroid[]> {
  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";
  const today = new Date().toISOString().split("T")[0];

  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${apiKey}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error("NEO API error:", res.status, await res.text());
    return [];
  }

  const data: NeoFeedResponse = await res.json();
  return Object.values(data.near_earth_objects).flat();
}
