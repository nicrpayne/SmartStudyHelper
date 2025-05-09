import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function GetStartedCTA() {
  return (
    <section className="bg-blue-50 rounded-custom p-8 text-center">
      <h2 className="text-2xl font-bold font-heading mb-4">Ready to Learn Smarter?</h2>
      <p className="text-gray-600 max-w-xl mx-auto mb-6">
        Upload your first homework problem and experience the difference between getting answers and truly understanding concepts.
      </p>
      <Link href="/solve">
        <Button size="lg" className="font-medium px-8">
          Try HomeworkHelper Free
        </Button>
      </Link>
      <p className="text-sm text-gray-500 mt-4">No credit card required. Free for basic problems.</p>
    </section>
  );
}
