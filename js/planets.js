// Planet data for the Space Explorer Easter Egg
const planets = [
  {
    name: "Mercury",
    title: "The Swift Messenger",
    distance: 100,
    size: 8,
    color: "#B7B8B9",
    speed: 0.004,
    textureUrl: null,
    content: `
      <h3>🌡️ Mercury</h3>
      <p><strong>Temperature:</strong> -180°C to 430°C</p>
      <p><strong>Year length:</strong> 88 Earth days</p>
      <p>Mercury has almost no atmosphere, so heat escapes quickly at night. A single day-night cycle on Mercury takes about 176 Earth days.</p>
      <p><strong>Fun fact:</strong> A day on Mercury is longer than its year.</p>
    `,
  },
  {
    name: "Venus",
    title: "The Morning Star",
    distance: 150,
    size: 14,
    color: "#E6E2AF",
    speed: 0.0035,
    textureUrl: null,
    atmosphereColor: "rgba(230, 190, 110, 0.2)",
    content: `
      <h3>☁️ Venus</h3>
      <p><strong>Temperature:</strong> 465°C (hotter than Mercury!)</p>
      <p><strong>Atmosphere:</strong> 96% Carbon Dioxide</p>
      <p>Venus rotates backwards compared to most planets, so the Sun appears to rise in the west there.</p>
      <p><strong>Fun fact:</strong> Surface pressure is about 90 times Earth’s, similar to being deep under Earth’s oceans.</p>
    `,
  },
  {
    name: "Earth",
    title: "The Blue Marble",
    distance: 200,
    size: 15,
    color: "#6B93D6",
    speed: 0.003,
    textureUrl: null,
    atmosphereColor: "rgba(100, 150, 230, 0.25)",
    content: `
      <h3>🌍 Earth</h3>
      <p><strong>Age:</strong> ~4.5 billion years</p>
      <p><strong>Water Coverage:</strong> 71% of surface</p>
      <p>Earth’s magnetic field and atmosphere help protect life from harmful solar radiation.</p>
      <p><strong>Fun fact:</strong> Earth is the only planet in our solar system not named after a Greek or Roman god.</p>
    `,
  },
  {
    name: "Mars",
    title: "The Red Planet",
    distance: 250,
    size: 12,
    color: "#E27B58",
    speed: 0.0025,
    textureUrl: null,
    atmosphereColor: "rgba(220, 100, 70, 0.2)",
    content: `
      <h3>🔴 Mars</h3>
      <p><strong>Tallest Mountain:</strong> Olympus Mons (21km high!)</p>
      <p><strong>Moons:</strong> Phobos & Deimos</p>
      <p>Scientists have found signs of ancient rivers and lakes, showing Mars was likely wetter in the distant past.</p>
      <p><strong>Fun fact:</strong> Mars has solar-system-wide dust storms that can cover the whole planet.</p>
    `,
  },
  {
    name: "Jupiter",
    title: "King of Planets",
    distance: 330,
    size: 30,
    color: "#C3A992",
    speed: 0.0018,
    textureUrl: null,
    atmosphereColor: "rgba(195, 169, 146, 0.2)",
    content: `
      <h3>👑 Jupiter</h3>
      <p><strong>Size:</strong> 1,300 Earths could fit inside!</p>
      <p><strong>Great Red Spot:</strong> A storm larger than Earth, raging for 400+ years</p>
      <p><strong>Moons:</strong> 95 known moons including Europa (possible alien life!)</p>
      <p>Jupiter’s gravity helps deflect or capture many comets and asteroids, influencing the whole solar system.</p>
      <p><strong>Fun fact:</strong> The Great Red Spot is a giant storm that has lasted for centuries.</p>
    `,
  },
  {
    name: "Saturn",
    title: "The Ringed Wonder",
    distance: 420,
    size: 26,
    color: "#DAD6CA",
    speed: 0.0014,
    hasRing: true,
    ringSize: 2.0,
    textureUrl: null,
    atmosphereColor: "rgba(218, 214, 202, 0.2)",
    content: `
      <h3>💍 Saturn</h3>
      <p><strong>Ring Span:</strong> 282,000 km wide but only ~10m thick!</p>
      <p><strong>Density:</strong> So low it would float in water!</p>
      <p><strong>Moons:</strong> 146 moons - Titan has lakes of liquid methane!</p>
      <p>Saturn’s rings are made mostly of ice particles, from dust-sized grains to pieces as big as houses.</p>
      <p><strong>Fun fact:</strong> Saturn is less dense than water.</p>
    `,
  },
  {
    name: "Uranus",
    title: "The Ice Giant",
    distance: 500,
    size: 20,
    color: "#D1E7E7",
    speed: 0.001,
    textureUrl: null,
    atmosphereColor: "rgba(190, 230, 230, 0.2)",
    content: `
      <h3>🧊 Uranus</h3>
      <p><strong>Tilt:</strong> 98° - it rolls around the Sun on its side!</p>
      <p><strong>Temperature:</strong> -224°C (coldest planetary atmosphere)</p>
      <p>Its extreme axial tilt likely came from an ancient giant impact early in solar-system history.</p>
      <p><strong>Fun fact:</strong> Uranus rotates almost on its side, unlike any other major planet.</p>
    `,
  },
  {
    name: "Neptune",
    title: "The Windiest World",
    distance: 570,
    size: 19,
    color: "#5B9BD5",
    speed: 0.0008,
    textureUrl: null,
    atmosphereColor: "rgba(90, 155, 213, 0.25)",
    content: `
      <h3>🌊 Neptune</h3>
      <p><strong>Wind Speed:</strong> Up to 2,100 km/h - fastest in the solar system!</p>
      <p><strong>Year Length:</strong> 165 Earth years</p>
      <p>Neptune was discovered after astronomers predicted its position mathematically from orbital anomalies.</p>
      <p><strong>Fun fact:</strong> It has the fastest winds measured on any planet in our solar system.</p>
    `,
  },
];

export { planets }; 
