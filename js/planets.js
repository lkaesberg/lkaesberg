// Planet data with information about each section
const planets = [
  {
    name: "Mercury",
    title: "About Me",
    distance: 100,
    size: 8,
    color: "#B7B8B9",
    speed: 0.004,
    textureUrl: null,
    // Mercury has no atmosphere
    content: `
      <h3>Hello, I'm Lars Kaesberg</h3>
      <p>I'm a software developer with a passion for creating interactive and immersive digital experiences.</p>
      <p>With a background in both front-end and back-end development, I enjoy building applications that combine beautiful interfaces with powerful functionality.</p>
      <p>When I'm not coding, you can find me exploring the latest technologies, contributing to open-source projects, or enjoying outdoor activities.</p>
    `,
  },
  {
    name: "Venus",
    title: "Skills",
    distance: 150,
    size: 14,
    color: "#E6E2AF",
    speed: 0.0035,
    textureUrl: null,
    atmosphereColor: "rgba(230, 190, 110, 0.2)",
    content: `
      <h3>Technical Skills</h3>
      <ul>
        <li><strong>Languages:</strong> JavaScript, TypeScript, Python, Java, HTML5/CSS3</li>
        <li><strong>Frameworks:</strong> React, Vue.js, Node.js, Express, Django</li>
        <li><strong>3D & Graphics:</strong> Three.js, WebGL, D3.js, Canvas</li>
        <li><strong>Data:</strong> SQL, MongoDB, GraphQL, REST APIs</li>
        <li><strong>Tools:</strong> Git, Docker, AWS, Firebase</li>
        <li><strong>Design:</strong> Figma, Adobe XD, responsive design principles</li>
      </ul>
    `,
  },
  {
    name: "Earth",
    title: "Experience",
    distance: 200,
    size: 15,
    color: "#6B93D6",
    speed: 0.003,
    textureUrl: null,
    atmosphereColor: "rgba(100, 150, 230, 0.25)",
    content: `
      <h3>Senior Developer at TechCorp</h3>
      <p>Developed and maintained multiple client-facing web applications, implementing modern front-end architectures and optimizing performance.</p>
      
      <h3>Frontend Engineer at WebSolutions</h3>
      <p>Created responsive, cross-browser compatible websites and applications for various clients in the e-commerce and finance sectors.</p>
      
      <h3>Full Stack Developer at StartupX</h3>
      <p>Built RESTful APIs and interactive user interfaces for a startup focused on social networking and content sharing.</p>
    `,
  },
  {
    name: "Mars",
    title: "Projects",
    distance: 250,
    size: 12,
    color: "#E27B58",
    speed: 0.0025,
    textureUrl: null,
    atmosphereColor: "rgba(220, 100, 70, 0.2)",
    content: `
      <h3>Interactive Data Visualization Dashboard</h3>
      <p>A real-time analytics platform using D3.js and React, allowing users to explore complex datasets through intuitive visualizations.</p>
      
      <h3>E-commerce Platform</h3>
      <p>A full-featured online store with product management, user accounts, and payment processing using Node.js and MongoDB.</p>
      
      <h3>3D Portfolio Experience</h3>
      <p>This very website you're exploring now, built with Three.js to create an immersive, interactive solar system portfolio.</p>
    `,
  },
  {
    name: "Jupiter",
    title: "Publications",
    distance: 330,
    size: 30,
    color: "#C3A992",
    speed: 0.0018,
    textureUrl: null,
    atmosphereColor: "rgba(195, 169, 146, 0.2)",
    content: `
      <h3>CiteAssist: A System for Automated Preprint Citation and BibTeX Generation (2024)</h3>
      <p>A system for automated citation generation for preprints, co-authored with T. Ruas, J.P. Wahle, and B. Gipp.</p>
      <p><a href="https://arxiv.org/abs/2407.03192" target="_blank">View on arXiv</a></p>
      
      <h3>Stay Focused: Problem Drift in Multi-Agent Debate (2025)</h3>
      <p>Research on multi-agent debates, co-authored with J. Becker, A. Stephan, J.P. Wahle, T. Ruas, and B. Gipp.</p>
      <p><a href="https://arxiv.org/abs/2502.19559" target="_blank">View on arXiv</a></p>
      
      <h3>Voting or Consensus? Decision-Making in Multi-Agent Debate (2025)</h3>
      <p>Study on decision-making processes in multi-agent LLM systems, co-authored with J. Becker, J.P. Wahle, T. Ruas, and B. Gipp.</p>
      <p><a href="https://arxiv.org/abs/2502.19130" target="_blank">View on arXiv</a></p>
      
      <h3>SPaRC: A Spatial Pathfinding Reasoning Challenge (2025)</h3>
      <p>A benchmark for evaluating spatial reasoning capabilities of AI systems, co-authored with J.P. Wahle, T. Ruas, and B. Gipp.</p>
      <p><a href="https://arxiv.org/abs/2505.16686" target="_blank">View on arXiv</a></p>
      
      <h3>Decision Protocols in Multi-Agent Large Language Model Conversations (2024)</h3>
      <p>Thesis work at Georg August University of Göttingen focusing on coordination mechanisms for multi-agent LLM systems.</p>
    `,
  },
  {
    name: "Saturn",
    title: "Education",
    distance: 420,
    size: 26,
    color: "#DAD6CA",
    speed: 0.0014,
    hasRing: true,
    ringSize: 2.0, // Multiplier for ring size relative to planet
    textureUrl: null,
    atmosphereColor: "rgba(218, 214, 202, 0.2)",
    content: `
      <h3>Master's in Computer Science</h3>
      <p>University of Technology, specializing in Interactive Media and Graphics</p>
      
      <h3>Bachelor's in Software Engineering</h3>
      <p>Tech Institute, with a focus on Web Technologies and Systems Design</p>
      
      <h3>Certifications</h3>
      <p>Advanced JavaScript, Cloud Architecture, UX Design Fundamentals</p>
    `,
  },
  {
    name: "Uranus",
    title: "Awards",
    distance: 500,
    size: 20,
    color: "#D1E7E7",
    speed: 0.001,
    textureUrl: null,
    atmosphereColor: "rgba(190, 230, 230, 0.2)",
    content: `
      <h3>Best Web Experience Award</h3>
      <p>Received for innovative use of WebGL in an interactive museum exhibit website.</p>
      
      <h3>Hackathon Winner</h3>
      <p>First place in the annual TechFest competition for a real-time collaborative coding platform.</p>
      
      <h3>Innovation in Digital Media</h3>
      <p>Recognized for contributions to open-source graphics libraries and visualization tools.</p>
    `,
  },
  {
    name: "Neptune",
    title: "Contact",
    distance: 570,
    size: 19,
    color: "#5B9BD5",
    speed: 0.0008,
    textureUrl: null,
    atmosphereColor: "rgba(90, 155, 213, 0.25)",
    content: `
      <h3>Get In Touch</h3>
      <p><strong>Email:</strong> <a href="mailto:lars.kaesberg@example.com">lars.kaesberg@example.com</a></p>
      <p><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/larskaesberg" target="_blank">linkedin.com/in/larskaesberg</a></p>
      <p><strong>GitHub:</strong> <a href="https://github.com/lkaesberg" target="_blank">github.com/lkaesberg</a></p>
      <p><strong>Twitter:</strong> <a href="https://twitter.com/larskaesberg" target="_blank">@larskaesberg</a></p>
      <p>I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.</p>
    `,
  },
];

export { planets }; 