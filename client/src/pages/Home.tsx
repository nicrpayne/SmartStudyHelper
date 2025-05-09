import HeroSection from "@/components/home/HeroSection";
import ExampleSection from "@/components/home/ExampleSection";
import FeatureHighlights from "@/components/home/FeatureHighlights";
import GetStartedCTA from "@/components/home/GetStartedCTA";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>HomeworkHelper - Interactive Learning Platform</title>
        <meta name="description" content="Upload or capture your homework problems and receive AI-powered step-by-step guidance, not just answers. Learn as you solve!" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <HeroSection />
        
        <div className="flex items-center my-12">
          <div className="flex-grow h-px bg-gray-200"></div>
          <div className="mx-4 text-gray-500 font-medium font-heading">OR SEE HOW IT WORKS</div>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>
        
        <ExampleSection />
        <FeatureHighlights />
        <GetStartedCTA />
      </div>
    </>
  );
}
