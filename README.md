# 🏦 Unity Trust Bank - Modern 3D Banking Application

![Unity Trust Bank Banner](https://raw.githubusercontent.com/Ravi8082/Unity-Trust-Front-End/main/public/placeholder-logo.png)

Unity Trust Bank is a cutting-edge, responsive digital banking web application built with **React 19** and **Next.js 15**. It features a modern UI/UX with integrated 3D elements, providing a seamless and secure experience for digital banking.

## ✨ Key Features

- **🚀 Modern 3D Interface**: Immersive banking experience using Three.js and React Three Fiber.
- **📱 Responsive Design**: Fully optimized for mobile, tablet, and desktop views.
- **💳 Account Management**: Open and manage multiple account types with ease.
- **💸 UPI & Payments**: Integrated UPI payment interface for quick transactions.
- **📊 Transaction Tracking**: Real-time tracking and visualization of your financial activities.
- **🏦 Loan Services**: Apply for Personal, Home, and Education loans directly from the dashboard.
- **🏧 ATM Services**: Request and manage ATM cards, PIN resets, and more.
- **🛡️ Secure Auth**: Protected routes and secure session management.
- **👤 Admin Dashboard**: Comprehensive administrative tools for managing users, accounts, and applications.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion
- **3D Graphics**: Three.js, React Three Fiber (@react-three/fiber, @react-three/drei)
- **State Management**: React Context API
- **Forms**: React Hook Form, Zod
- **Charts**: Recharts
- **Icons**: Lucide React

## 📸 Screenshots

| Dashboard | 3D Vault | UPI Payments |
| :---: | :---: | :---: |
| ![Dashboard](https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400&h=225) | ![3D Vault](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400&h=225) | ![UPI Payments](https://images.unsplash.com/photo-1593672715438-d88a75639eaa?auto=format&fit=crop&q=80&w=400&h=225) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm / yarn / pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ravi8082/Unity-Trust-Front-End.git
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file and add your API URL:
   ```env
   NEXT_PUBLIC_API_URL=your_backend_api_url
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```text
├── app/              # Next.js App Router
├── components/       # Reusable UI components
│   ├── 3d/           # 3D models and scenes
│   ├── dashboard/    # Dashboard-specific components
│   ├── home/         # Landing page sections
│   └── ui/           # Shadcn UI components
├── context/          # React Context providers
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and API clients
└── public/           # Static assets (images, icons)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---
Built with ❤️ by [Ravi8082](https://github.com/Ravi8082)
