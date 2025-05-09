import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function ExampleSection() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [showHint, setShowHint] = useState(false);

  return (
    <section className="mb-16 fade-in" id="example">
      <h2 className="text-2xl font-bold font-heading text-center mb-8">Example: Solving a Math Problem</h2>
      
      <Card className="overflow-hidden shadow-custom">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'analysis' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}
              onClick={() => setActiveTab('analysis')}
            >
              Problem Analysis
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'steps' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}
              onClick={() => setActiveTab('steps')}
            >
              Step-by-Step Guide
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'solution' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}
              onClick={() => setActiveTab('solution')}
            >
              Solution
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem Image */}
            <div>
              <div className="rounded-custom overflow-hidden border border-gray-200 mb-4">
                <img 
                  src="https://images.pexels.com/photos/6238050/pexels-photo-6238050.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Math problem showing a quadratic equation on paper" 
                  className="w-full h-auto"
                />
              </div>
              <div className="bg-blue-50 rounded-custom p-4">
                <h3 className="font-heading font-bold text-primary mb-2">Problem Detection</h3>
                <p className="text-gray-700">We've detected a quadratic equation: <span className="font-mono bg-white px-2 py-1 rounded">x² - 5x + 6 = 0</span></p>
                <div className="mt-4">
                  <button className="text-sm text-primary font-medium flex items-center">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Edit if incorrect
                  </button>
                </div>
              </div>
            </div>
            
            {/* Analysis & Guidance */}
            <div>
              {activeTab === 'analysis' && (
                <>
                  <h3 className="font-heading font-bold text-lg mb-4">Understanding The Approach</h3>
                  <p className="text-gray-700 mb-4">This is a quadratic equation which can be solved by factoring or using the quadratic formula. Let's solve it step-by-step.</p>
                  
                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex">
                      <div className="step-number mr-3 w-[30px] h-[30px] rounded-full flex items-center justify-center bg-primary text-white font-bold">1</div>
                      <div>
                        <h4 className="font-heading font-bold">Identify the form</h4>
                        <p className="text-gray-700">The standard form of a quadratic equation is ax² + bx + c = 0. In this problem:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                          <li>a = 1</li>
                          <li>b = -5</li>
                          <li>c = 6</li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* Step 2 */}
                    <div className="flex">
                      <div className="step-number mr-3 w-[30px] h-[30px] rounded-full flex items-center justify-center bg-primary text-white font-bold">2</div>
                      <div>
                        <h4 className="font-heading font-bold">Try to factor the equation</h4>
                        <p className="text-gray-700">We need to find two numbers that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                          <li>Multiply to give c (6)</li>
                          <li>Add up to b (-5)</li>
                        </ul>
                        
                        <div className="mt-3 bg-gray-50 p-3 rounded-custom">
                          <p className="text-gray-700">What two numbers multiply to 6 and add up to -5?</p>
                          <div className="mt-2">
                            <Button
                              variant="ghost"
                              className="text-primary font-medium hover:underline"
                              onClick={() => setShowHint(!showHint)}
                            >
                              {showHint ? "Hide Hint" : "Show Hint"}
                            </Button>

                            {showHint && (
                              <div className="mt-2 p-2 bg-white rounded border">
                                Think about the factors of 6: 1×6 and 2×3. Which pair adds up to -5?
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        className="bg-primary text-white font-medium py-3 px-6 rounded-custom hover:bg-blue-600 transition"
                        onClick={() => setActiveTab('steps')}
                      >
                        Continue to Next Step
                      </Button>
                      <Button 
                        variant="outline"
                        className="ml-3 text-gray-600 font-medium py-3 px-6 rounded-custom border border-gray-300 hover:bg-gray-50 transition"
                        onClick={() => setActiveTab('solution')}
                      >
                        Skip to Solution
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'steps' && (
                <>
                  <h3 className="font-heading font-bold text-lg mb-4">Step-by-Step Solution</h3>
                  <div className="space-y-6">
                    <div className="flex">
                      <div className="step-number mr-3 w-[30px] h-[30px] rounded-full flex items-center justify-center bg-primary text-white font-bold">3</div>
                      <div>
                        <h4 className="font-heading font-bold">Find the factors</h4>
                        <p className="text-gray-700">We need two numbers that multiply to 6 and sum to -5.</p>
                        <p className="text-gray-700 mt-2">Let's check all possible factors of 6:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                          <li>1 × 6 = 6, 1 + 6 = 7 (not right)</li>
                          <li>2 × 3 = 6, 2 + 3 = 5 (not right)</li>
                          <li>-1 × -6 = 6, -1 + (-6) = -7 (not right)</li>
                          <li>-2 × -3 = 6, -2 + (-3) = -5 (this works!)</li>
                        </ul>
                        <p className="text-gray-700 mt-2">So our factors are -2 and -3.</p>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="step-number mr-3 w-[30px] h-[30px] rounded-full flex items-center justify-center bg-primary text-white font-bold">4</div>
                      <div>
                        <h4 className="font-heading font-bold">Write in factored form</h4>
                        <p className="text-gray-700">Using the factors we found:</p>
                        <div className="bg-gray-50 p-3 rounded-custom mt-2">
                          <p className="font-mono">x² - 5x + 6 = 0</p>
                          <p className="font-mono">= (x - 2)(x - 3) = 0</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="step-number mr-3 w-[30px] h-[30px] rounded-full flex items-center justify-center bg-primary text-white font-bold">5</div>
                      <div>
                        <h4 className="font-heading font-bold">Solve for x</h4>
                        <p className="text-gray-700">When a product equals zero, at least one factor must be zero:</p>
                        <div className="bg-gray-50 p-3 rounded-custom mt-2">
                          <p className="font-mono">Either (x - 2) = 0 or (x - 3) = 0</p>
                          <p className="font-mono">x = 2 or x = 3</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        className="bg-primary text-white font-medium py-3 px-6 rounded-custom hover:bg-blue-600 transition"
                        onClick={() => setActiveTab('solution')}
                      >
                        See the Solution
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'solution' && (
                <>
                  <h3 className="font-heading font-bold text-lg mb-4">Complete Solution</h3>
                  <div className="bg-blue-50 p-4 rounded-custom">
                    <p className="text-gray-700 mb-2">The solution to the quadratic equation x² - 5x + 6 = 0 is:</p>
                    <div className="bg-white p-3 rounded-custom font-mono text-center font-bold text-primary text-lg">
                      x = 2 or x = 3
                    </div>
                    <p className="mt-4 text-gray-700">You can verify this by substituting these values back into the original equation:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-700">
                      <li>For x = 2: 2² - 5·2 + 6 = 4 - 10 + 6 = 0 ✓</li>
                      <li>For x = 3: 3² - 5·3 + 6 = 9 - 15 + 6 = 0 ✓</li>
                    </ul>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      variant="outline"
                      className="w-full text-gray-600 font-medium py-3 px-6 rounded-custom border border-gray-300 hover:bg-gray-50 transition"
                      onClick={() => setActiveTab('analysis')}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Start Over
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
