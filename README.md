# Sambit Swain — Personal Portfolio

> Personal portfolio website with CI/CD pipeline automation deployed via GitHub Actions.

## 🌐 Live Site
[sambit-swain.github.io](https://ssambit635-svg.github.io)

## 🗂 Project Structure
```
portfolio/
├── .github/
│   └── workflows/
│       └── deploy.yml   # CI/CD pipeline
├── src/
│   └── index.html       # Portfolio website
├── Dockerfile           # Docker container config
├── nginx.conf           # Web server config
└── README.md            # You are here
```

## ⚙️ How the Pipeline Works
1. Push code to `main` branch
2. GitHub Actions automatically triggers
3. Picks up files from `/src`
4. Deploys live to GitHub Pages
5. Site updates within 60 seconds ✅

## 🐳 Run Locally with Docker
```bash
docker build -t sambit-portfolio .
docker run -p 8080:80 sambit-portfolio
# open http://localhost:8080
```

## 🛠 Tech Stack
- HTML · CSS · JavaScript
- GitHub Actions (CI/CD)
- GitHub Pages (Hosting)
- Docker + Nginx (Container)

## 👤 Author
**Sambit Swain** — [LinkedIn](https://www.linkedin.com/in/sambit-swain-7032a8378) · [GitHub](https://github.com/ssambit635-svg)
