🚀 Sambit Swain | Personal Portfolio
https://img.shields.io/badge/demo-online-brightgreen?style=for-the-badge&logo=githubpages
https://img.shields.io/badge/CI%252FCD-GitHub%2520Actions-blue?style=for-the-badge&logo=githubactions
https://img.shields.io/badge/docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white
https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge

A modern, fully automated personal portfolio website — built with a robust CI/CD pipeline that deploys to GitHub Pages in under 60 seconds. Zero-touch updates, container-ready, and built to impress.

🌐 Live Demo
👉 Visit My Portfolio — See the live version in action.

Project Structure
text
portfolio/
├── .github/
│   └── workflows/
│       └── deploy.yml      #  CI/CD automation workflow
├── src/
│   └── index.html          #  Main portfolio entry point
├── Dockerfile              #  Container configuration
├── nginx.conf              #  Web server settings
└── README.md               #  You are here
CI/CD Pipeline — How It Works
This project leverages GitHub Actions for seamless, automated deployment. Every time you push to main, the pipeline triggers automatically.

Step	Action
1️	Push code to main branch
2️	GitHub Actions workflow starts
3️	Pipeline picks up files from /src
4️	Deploys directly to GitHub Pages
5️	Site updates within ~60 seconds 
Zero manual intervention — just push and your portfolio is live.

Run Locally with Docker
Want to spin up a local copy instantly? Use Docker:

bash
# Build the image
docker build -t sambit-portfolio .

# Run the container
docker run -p 8080:80 sambit-portfolio

# Open your browser and visit:
# http://localhost:8080
No local server setup required — Docker handles everything.

🛠 Technology Stack
Category	Tools
Frontend	HTML5 · CSS3 · JavaScript (Vanilla)
CI/CD	GitHub Actions — automated workflows
Hosting	GitHub Pages — fast, free, reliable
Container	Docker + Nginx — production-grade serving
Version Control	Git · GitHub
👤 Author
Sambit Swain
A passionate developer committed to clean code and automation.

https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white
https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white

📄 License
This project is open-source and available under the MIT License.
Show Your Support
If you found this useful, please give it a star  — it helps others discover this project!

Built with ❤️ and automation.

Key Improvements I Made:
Visual Badges — At the top for instant credibility and status.

Clear Hierarchy — Using headers, emojis, and tables for skimmability.

Professional Tone — More confident, polished language.

Step-by-Step Pipeline — Easy-to-follow numbered breakdown.

Tech Stack Table — Clean, organized, and scannable.

Docker Instructions — Clear commands with output hints.

Social Buttons — Styled badges for LinkedIn/GitHub.

Call to Action — Encourages stars and engagement.

Consistent Formatting — Proper code blocks, spacing, and dividers
