import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ModernNavbar from "@/components/layout/ModernNavbar";
import Footer from "@/components/layout/Footer";

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for small businesses just getting started",
    features: [
      "Up to 1,000 inventory items",
      "Basic analytics",
      "Excel import/export",
      "Email support",
      "1 user account",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "$79",
    description: "Ideal for growing businesses with multiple users",
    features: [
      "Up to 10,000 inventory items",
      "Advanced analytics",
      "Excel & CSV integration",
      "Priority email support",
      "5 user accounts",
      "API access",
      "Custom fields",
    ],
    cta: "Try Free for 14 Days",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    description: "For large organizations with complex needs",
    features: [
      "Unlimited inventory items",
      "Real-time analytics",
      "Full data integration",
      "24/7 phone & email support",
      "Unlimited user accounts",
      "Advanced API access",
      "Custom fields & workflows",
      "Dedicated account manager",
      "On-premise deployment option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <ModernNavbar />
      <div className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for your business. All plans include
              a 14-day free trial.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Card
                  className={`h-full flex flex-col ${plan.popular ? "border-primary shadow-lg relative" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground"> /month</span>
                    </div>
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-muted rounded-xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              We offer tailored solutions for businesses with specific
              requirements. Contact our sales team to discuss your needs.
            </p>
            <Button size="lg" variant="default" asChild>
              <a href="/contact">Contact Sales</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <h2 className="text-2xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
              {[
                {
                  question: "Can I upgrade or downgrade my plan at any time?",
                  answer:
                    "Yes, you can change your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, the new rate will apply to your next billing cycle.",
                },
                {
                  question: "Is there a setup fee?",
                  answer:
                    "No, there are no setup fees for any of our plans. You only pay the monthly subscription fee.",
                },
                {
                  question: "Do you offer discounts for annual billing?",
                  answer:
                    "Yes, we offer a 15% discount when you choose annual billing instead of monthly.",
                },
                {
                  question: "What payment methods do you accept?",
                  answer:
                    "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
                },
              ].map((faq, index) => (
                <div key={index} className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage;

