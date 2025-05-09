import { Card } from "@/components/ui/card";
import { Eye, MessageSquare, Code } from "lucide-react";

export default function FeatureHighlights() {
  const features = [
    {
      icon: <Eye className="h-8 w-8 text-primary" />,
      bgColor: "bg-blue-100",
      title: "Smart Problem Analysis",
      description: "Our AI analyzes your homework problems and identifies the key concepts and methods needed to solve them."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-secondary" />,
      bgColor: "bg-orange-100",
      title: "Interactive Guidance",
      description: "Learn through guided steps, hints, and explanations that help you understand concepts, not just memorize solutions."
    },
    {
      icon: <Code className="h-8 w-8 text-accent" />,
      bgColor: "bg-green-100",
      title: "Multiple Subjects",
      description: "Get help with math, physics, chemistry, and more. Our system adapts to different types of problems across subjects."
    }
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold font-heading text-center mb-8">How HomeworkHelper Supports Your Learning</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index} className="p-6 transition hover:shadow-lg">
            <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center ${feature.bgColor}`}>
              {feature.icon}
            </div>
            <h3 className="font-heading font-bold text-lg mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
