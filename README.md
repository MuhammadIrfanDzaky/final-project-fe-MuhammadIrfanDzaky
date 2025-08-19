# Dribble  
**Book. Play. Score.**

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white" alt="Next.js"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white" alt="TailwindCSS"></a>
  <a href="https://jestjs.io/"><img src="https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white" alt="Jest"></a>
  <img src="https://img.shields.io/badge/Status-Production-brightgreen" alt="Status">
</p>

Dribble makes booking futsal courts quick and simple for players, teams, and organizers — from finding a court to scheduling a game in seconds. Designed to help field owners maximize utilization and give players a seamless booking experience.

> **Status:** Production  
> **Live Demo:** [Coming soon]  
> **Tech Stack:** React (19.1.1), Next.js (15.4.6), TypeScript, Tailwind CSS  

---

## 📋 Features
- **Search & View Courts** — Browse real-time availability of futsal courts.
- **Instant Booking** — Secure your spot with immediate confirmation.
- **Schedule Management** — Track your upcoming matches in one place.
- **User Accounts** — Separate portals for players and court owners.
- **Booking History** — Easily review past reservations.

---

## 🚫 Out of Scope / Limitations
- No in-app chat or messaging between players.
- No support for equipment rentals or other on-site services.
- Limited to futsal courts only (no other sports).
- Court availability accuracy depends on updates provided by owners.

---

## 🛠️ Tech Stack
| Category         | Technology |
|------------------|------------|
| Framework        | [React](https://react.dev/) 19.1.1 |
| Language         | TypeScript |
| Framework (SSR)  | [Next.js](https://nextjs.org/) 15.4.6 |
| Styling          | [Tailwind CSS](https://tailwindcss.com/) |
| State Management | React Context |
| Testing          | [Jest](https://jestjs.io/) |

---

## 📦 Prerequisites
- [Node.js](https://nodejs.org/) & npm installed.
- Recommended: Latest **LTS** version of Node.js.

---

## ⚙️ Installation & Local Setup

Clone the repository and install dependencies:
```bash
git clone https://github.com/Revou-FSSE-Feb25/final-project-fe-MuhammadIrfanDzaky.git
cd final-project-fe-MuhammadIrfanDzaky
npm install
```

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Run tests:
```bash
npm run test
```

Default Development Port: `http://localhost:3000`

---

## 🚀 Usage

Once the development server is running:

1. Open http://localhost:3000 in your browser.
2. Use the search feature to find available futsal courts.
3. Select a court, choose your time slot, and confirm your booking.
4. Manage upcoming matches and view booking history via your account dashboard.

---

## 🌐 API Reference
- The frontend consumes the [Dribble Backend API](../final-project-be-MuhammadIrfanDzaky/README.md) (NestJS, Swagger docs at `/api-docs`).
- All booking, court, and user management is handled via RESTful endpoints.

---

## 🏗️ Project Structure
```
final-project-fe-MuhammadIrfanDzaky/
├── src/
│   ├── app/           # App routes and pages
│   ├── components/    # UI and layout components
│   ├── contexts/      # React Context providers
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── public/            # Static assets
└── ...
```

---

## 🚀 Deployment
- Configure your environment variables for production (see `.env.example` if available).
- Build the project:
  ```bash
  npm run build
  ```
- Start with:
  ```bash
  npm start
  ```
- Deploy to Vercel, Netlify, or your preferred platform.

---

## 🖼️ Diagrams
> _Add UI or architecture diagrams here if available._

---

## 🤝 Contributing
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/feature-name`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📫 Contact & Support
- Project by Muhammad Irfan Dzaky
- For issues, use the GitHub Issues tab
- For questions, contact: [your-email@example.com]

---

## 📝 License
This project is licensed under the MIT License.