# Beacon Frontend (Client)

The frontend for Beacon is a modern, high-performance web application built using React 19 and Vite. It provides a sleek user interface for managing incidents, visualizing analytics, and collaborating with team members.

## 🚀 Technology Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [GSAP](https://greensock.com/gsap/)
- **Charts**: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Workflow Visualization**: [@xyflow/react](https://reactflow.dev/)
- **Notifications**: [Sonner](https://sonner.steveney.com/)

## 📦 Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `client` root:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

## 🛠️ Development and Build

- **Start development server**:
  ```bash
  npm run dev
  ```
- **Build for production**:
  ```bash
  npm run build
  ```
- **Lint code**:
  ```bash
  npm run lint
  ```
- **Preview production build**:
  ```bash
  npm run preview
  ```

## 📂 Directory Structure

- `src/admin/`: Admin-specific pages and components for user and role management.
- `src/auth/`: Authentication logic, components (Sign In/Up, Google OAuth), and Context.
- `src/components/`: Reusable UI components like Navigation Bars and Sidebars.
- `src/incident/`: Incident-related API calls and logic.
- `src/landing/`: Landing page components and assets.
- `src/pages/`: Main application views (Dashboard, Analytics, Incidents, Profile).
- `src/router/`: Application routing configuration.
- `src/assets/`: Static images and global styles.

## 🔑 Key Features

- **Dynamic Dashboards**: Real-time incident tracking and analytics.
- **Organization Management**: Tools to create, join, and manage team organizations.
- **Incident Lifecycle**: Comprehensive flow from incident creation to resolution.
- **Google OAuth Integration**: Seamless sign-in experience.
- **Responsive Design**: Optimized for both desktop and mobile viewing.

## 🌐 Deployment

This project is configured for easy deployment on [Vercel](https://vercel.com/). Use the provided `vercel.json` for configuration.

```bash
npm install -g vercel
vercel
```

## 🤝 Contribution Guidelines

Please follow the coding standards defined in the `eslint.config.js` and use descriptive commit messages.

## 📄 License

This project is private and intended for use by the Beacon development team.
