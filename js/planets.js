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
      <p>I'm studying Computer Science at the University of Göttingen.</p>
      <p>I'm interested in machine learning, deep learning, and robotics.</p>
      <p>I'm enthusiastic about quadcopters and drone technology.</p>
      <p>I'm also interested in rockets, space, and astronomy.</p>
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
        <li><strong>Natural Language Processing & LLMs:</strong> Text understanding, generation, evaluation</li>
        <li><strong>Deep Learning & Data Analysis:</strong> PyTorch/TensorFlow pipelines, experiment tracking</li>
        <li><strong>Software Engineering:</strong> Full-stack Python/TypeScript, CI/CD, open-source workflow</li>
        <li><strong>Autonomous Drones & Embedded AI:</strong> Thermal imaging, real-time inference</li>
        <li><strong>Scientific Writing & Reviewing:</strong> Author of peer-reviewed NLP papers</li>
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
      <h3>Doctoral Researcher, University of Göttingen</h3>
      <p>01/2025 – present</p>
      
      <h3>Academic Tutor, CS Dept., University of Göttingen</h3>
      <p>2021 – 2025 (algorithms & ML courses)</p>
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
      <h3>FawnRescue</h3>
      <p>Open-hardware drone, thermal camera and YOLO-based detection stack that debuted at IdeenExpo 2024.</p>
      
      <h3>CiteAssist</h3>
      <p>ACL-published web service that auto-generates BibTeX for arXiv/Zenodo preprints.</p>
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
      <h3>M.Sc. Computer Science – Artificial Intelligence</h3>
      <p>University of Göttingen, 10/2022 – 12/2024</p>
      
      <h3>B.Sc. Computer Science – Computational Neuroscience</h3>
      <p>University of Göttingen, 10/2019 – 10/2022</p>
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
      <h3>Best Student</h3>
      <p>Currently place 1 and 6 on the StudIP ranking for University of Göttingen.</p>
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
      <p><strong>Email:</strong> <a href="mailto:l.kaesberg@uni-goettingen.de">l.kaesberg@uni-goettingen.de</a></p>
      <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/lars-kaesberg-351664217/" target="_blank">linkedin.com/in/lars-kaesberg</a> (quickest for networking)</p>
      <p><strong>GitHub:</strong> <a href="https://github.com/lkaesberg" target="_blank">github.com/lkaesberg</a></p>
      <p>I'm always open to discussing new projects, creative ideas, or opportunities.</p>
    `,
  },
];

export { planets }; 