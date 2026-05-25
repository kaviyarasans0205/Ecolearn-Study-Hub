import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import LandingPage from "./pages/LandingPage";
import SchoolsPage from "./pages/SchoolsPage";
import SchoolsStudyPage from "./pages/SchoolsStudyPage";
import SchoolsQuizPage from "./pages/SchoolsQuizPage";
import SchoolsExamPage from "./pages/SchoolsExamPage";
import SchoolGamesPage from "./pages/SchoolGamesPage";
import SchoolsBooksPage from "./pages/SchoolsBooksPage";
import CollegeAttitudeQuizPage from "./pages/CollegeAttitudeQuizPage";
import CollegeAttitudeLearnPage from "./pages/CollegeAttitudeLearnPage";
import CollegeBooksPage from "./pages/CollegeBooksPage";
import CollegeGamesPage from "./pages/CollegeGamesPage";
import CollegesPage from "./pages/CollegesPage";

import LeaderboardPage from "./pages/LeaderboardPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/schools" element={<SchoolsPage />} />
            <Route path="/schools/study" element={<SchoolsStudyPage />} />
            <Route path="/schools/quiz" element={<SchoolsQuizPage />} />
            <Route path="/schools/exam" element={<SchoolsExamPage />} />
            <Route path="/schools/games" element={<SchoolGamesPage />} />
            <Route path="/schools/books" element={<SchoolsBooksPage />} />
            <Route path="/colleges" element={<CollegesPage />} />
            <Route path="/colleges/quizzes" element={<CollegesPage />} />
            <Route path="/colleges/attitude-quiz" element={<CollegeAttitudeQuizPage />} />
            <Route path="/colleges/attitude-learn" element={<CollegeAttitudeLearnPage />} />
            <Route path="/colleges/books" element={<CollegeBooksPage />} />
            <Route path="/colleges/games" element={<CollegeGamesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
