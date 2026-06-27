import { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import BMICalculator from "./BMICalculator";
import SymptomChecker from "./SymptomChecker";
import EmergencyContacts from "./EmergencyContacts";
import HospitalMap from "./HospitalMap";
import HealthTips from "./HealthTips";
import HealthInsights from "./HealthInsights";
import UserProfile from "./UserProfile";
import Chatbot from "./Chatbot";
import Footer from "./Footer";

const SECTIONS = ["Home", "Insights", "BMI", "Symptoms", "Emergency", "Hospitals", "Tips", "Profile"];

export default function Dashboard({ user, onLogout, darkMode, toggleDark }) {
  const [activeSection, setActiveSection] = useState("Home");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar
        user={user}
        sections={SECTIONS}
        active={activeSection}
        setActive={setActiveSection}
        onLogout={onLogout}
        darkMode={darkMode}
        toggleDark={toggleDark}
      />

      <main className="pt-20 sm:pt-16">
        {activeSection === "Home" && <Hero user={user} setActive={setActiveSection} />}
        {activeSection === "Insights" && <HealthInsights user={user} />}
        {activeSection === "BMI" && <BMICalculator user={user} />}
        {activeSection === "Symptoms" && <SymptomChecker />}
        {activeSection === "Emergency" && <EmergencyContacts />}
        {activeSection === "Hospitals" && <HospitalMap />}
        {activeSection === "Tips" && <HealthTips />}
        {activeSection === "Profile" && <UserProfile user={user} />}
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}