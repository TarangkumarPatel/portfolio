const ogImage = (repo) => `https://opengraph.githubassets.com/1/TarangkumarPatel/${repo}`;

export const INITIAL_PROJECTS = [
  {
    id: 'portfolio',
    title: 'Personal Portfolio',
    description: 'This site — a personal portfolio built with Next.js, Tailwind CSS, and Framer Motion, featuring a custom Firebase-backed admin dashboard for dynamic project management.',
    techStack: ['Next.js', 'React', 'Tailwind CSS', 'Framer Motion', 'Firebase'],
    liveLink: 'https://portfolio-dun-mu-20.vercel.app',
    githubLink: 'https://github.com/TarangkumarPatel/portfolio',
    imageUrl: ogImage('portfolio'),
    featured: true,
    order: 1
  },
  {
    id: 'library-management-system',
    title: 'Library Management System',
    description: 'A full-stack library management application with secure JWT authentication, persistent storage in MongoDB, and real-time book data retrieval via the OpenLibrary API.',
    techStack: ['Next.js', 'React-Bootstrap', 'Jotai', 'MongoDB', 'JWT'],
    liveLink: 'https://library-management-system-five-delta.vercel.app',
    githubLink: 'https://github.com/TarangkumarPatel/library-management-system',
    imageUrl: ogImage('library-management-system'),
    featured: true,
    order: 2
  },
  {
    id: 'library-management-system-api',
    title: 'Library Management API',
    description: 'A secure RESTful API managing user registration, authentication, and personalized book collections, with stateless JWT auth via Passport.js and MongoDB Atlas persistence.',
    techStack: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Passport.js'],
    liveLink: 'https://library-management-system-api-five.vercel.app',
    githubLink: 'https://github.com/TarangkumarPatel/library-management-system-api',
    imageUrl: ogImage('library-management-system-api'),
    featured: true,
    order: 3
  },
  {
    id: 'web-hoster',
    title: 'Web Hoster',
    description: 'A web hosting management platform built with Node.js and Express, using Handlebars for server-rendered views, Sequelize/PostgreSQL for persistence, and session-based auth with bcrypt.',
    techStack: ['Node.js', 'Express', 'Handlebars', 'PostgreSQL', 'Sequelize'],
    liveLink: 'https://web-hoster-delta.vercel.app',
    githubLink: 'https://github.com/TarangkumarPatel/web-hoster',
    imageUrl: ogImage('web-hoster'),
    featured: false,
    order: 4
  },
  {
    id: 'calculator-with-cypressTest-and-CI',
    title: 'Calculator + Cypress CI',
    description: 'A calculator web app built with Next.js and React, covered by end-to-end Cypress tests wired into a GitHub Actions CI pipeline.',
    techStack: ['Next.js', 'React', 'Cypress', 'CI/CD'],
    liveLink: 'https://calculator-with-cypress-test-and-ci.vercel.app',
    githubLink: 'https://github.com/TarangkumarPatel/calculator-with-cypressTest-and-CI',
    imageUrl: ogImage('calculator-with-cypressTest-and-CI'),
    featured: false,
    order: 5
  },
  {
    id: 'spotify-clone',
    title: 'Spotify Clone',
    description: 'A static clone of the Spotify web interface, built to practice pixel-perfect frontend development — focused on the structural layout of a modern media player.',
    techStack: ['HTML5', 'CSS3'],
    liveLink: 'https://spotify-clone-virid-eta.vercel.app',
    githubLink: 'https://github.com/TarangkumarPatel/spotify-clone',
    imageUrl: ogImage('spotify-clone'),
    featured: false,
    order: 6
  },
  {
    id: 'photography-portfolio',
    title: 'Photography Portfolio',
    description: 'Bridging the gap between optics and code — a minimalist gallery site for showcasing professional photography captures.',
    techStack: ['HTML5', 'CSS3'],
    liveLink: 'https://photography-portfolio-lilac-one.vercel.app',
    githubLink: 'https://github.com/TarangkumarPatel/photography-portfolio',
    imageUrl: ogImage('photography-portfolio'),
    featured: false,
    order: 7
  }
];
