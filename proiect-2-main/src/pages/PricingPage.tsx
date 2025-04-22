import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Check,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
  Clock,
} from "lucide-react";
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
    monthlyPrice: "$29",
    annualPrice: "$24",
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
    color: "from-blue-500 to-cyan-400",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    name: "Professional",
    monthlyPrice: "$79",
    annualPrice: "$67",
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
    color: "from-purple-500 to-pink-500",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    name: "Enterprise",
    monthlyPrice: "$199",
    annualPrice: "$169",
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
    color: "from-amber-500 to-orange-500",
    icon: <Shield className="h-5 w-5" />,
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Operations Manager",
    company: "TechCorp Inc.",
    image: "{process.env.URL_1}",
    content:
      "This platform has completely transformed how we manage our inventory. The interface is intuitive and the features are exactly what we needed.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Supply Chain Director",
    company: "Global Logistics",
    image: "{process.env.URL_2}",
    content:
      "After trying several inventory management solutions, this one stands out for its performance and reliability. The Professional plan offers excellent value.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Small Business Owner",
    company: "Craft Supplies Co.",
    image: "{process.env.URL_3}",
    content:
      "As a small business, the Starter plan gives us everything we need at an affordable price. The customer support has been exceptional.",
    rating: 4,
  },
];

const keyFeatures = [
  {
    title: "Real-time Tracking",
    description:
      "Monitor your inventory levels in real-time with automated alerts",
    icon: <Clock className="h-6 w-6" />,
    color: "from-blue-400 to-cyan-500",
  },
  {
    title: "Advanced Security",
    description:
      "Enterprise-grade security to keep your inventory data protected",
    icon: <Shield className="h-6 w-6" />,
    color: "from-emerald-400 to-teal-500",
  },
  {
    title: "Powerful Analytics",
    description:
      "Gain insights with comprehensive reporting and analytics tools",
    icon: <Zap className="h-6 w-6" />,
    color: "from-purple-400 to-pink-500",
  },
];

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const calculateSavings = (monthly: string, annual: string) => {
    const monthlyValue = parseFloat(monthly.replace("$", ""));
    const annualValue = parseFloat(annual.replace("$", ""));
    return Math.round((1 - annualValue / monthlyValue) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <ModernNavbar />

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [100, 50, 100],
                  y: [-100, -50, -100],
                  scale: [1, 1.1, 1],
                }
          }
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [-50, -100, -50],
                  y: [50, 100, 50],
                  scale: [1, 1.2, 1],
                }
          }
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="pt-28 pb-16 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center relative"
            style={{
              perspective: 1000,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              className="relative z-10"
              style={{
                rotateX: prefersReducedMotion ? 0 : rotateX,
                rotateY: prefersReducedMotion ? 0 : rotateY,
                transformStyle: "preserve-3d",
              }}
            >
              <motion.div
                className="inline-block mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              >
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text text-lg font-medium px-4 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                  Pricing Plans
                </span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-white dark:to-blue-100 text-transparent bg-clip-text">
                  Simple, Transparent
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  Pricing for Everyone
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Choose the plan that's right for your business. All plans
                include a 14-day free trial with no credit card required.
              </motion.p>

              <motion.div
                className="inline-flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !isAnnual
                      ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                  onClick={() => setIsAnnual(false)}
                  aria-pressed={!isAnnual}
                >
                  Monthly
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isAnnual
                      ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                  onClick={() => setIsAnnual(true)}
                  aria-pressed={isAnnual}
                >
                  Annual{" "}
                  <span className="text-green-500 font-semibold">-15%</span>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                whileHover={prefersReducedMotion ? {} : { y: -8 }}
                className="h-full"
              >
                <Card
                  className={`h-full flex flex-col relative overflow-hidden border-2 ${
                    plan.popular
                      ? "border-primary shadow-lg dark:shadow-primary/20"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {plan.popular && (
                    <motion.div
                      className="absolute top-0 right-0 transform translate-x-2 -translate-y-2"
                      animate={
                        prefersReducedMotion
                          ? {}
                          : {
                              scale: [1, 1.05, 1],
                            }
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <span className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        MOST POPULAR
                      </span>
                    </motion.div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 opacity-50" />

                  <CardHeader className="relative z-10">
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center mr-2 shadow-sm`}
                      >
                        {plan.icon}
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    </div>

                    <div className="mt-2">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isAnnual ? "annual" : "monthly"}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-end"
                        >
                          <span className="text-4xl font-bold">
                            {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 ml-1 mb-1">
                            {" "}
                            /month
                          </span>
                        </motion.div>
                      </AnimatePresence>

                      {isAnnual && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-1 text-sm text-green-600 dark:text-green-400 font-medium"
                        >
                          Save{" "}
                          {calculateSavings(
                            plan.monthlyPrice,
                            plan.annualPrice
                          )}
                          % with annual billing
                        </motion.div>
                      )}
                    </div>

                    <CardDescription className="mt-3">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-grow relative z-10">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                        >
                          <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-1 mr-2 mt-0.5">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-slate-700 dark:text-slate-300">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="relative z-10">
                    <motion.div
                      className="w-full"
                      whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                    >
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-md shadow-primary/20"
                            : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                        size="lg"
                      >
                        {plan.cta}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              <span className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-white dark:to-slate-200 text-transparent bg-clip-text">
                All Plans Include These Powerful Features
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {keyFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={prefersReducedMotion ? {} : { y: -5 }}
                >
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300`}
                    aria-hidden="true"
                  />
                  <div className="relative bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 h-full">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 text-white`}
                      aria-hidden="true"
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              <span className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-white dark:to-slate-200 text-transparent bg-clip-text">
                What Our Customers Say
              </span>
            </h2>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto shadow-md"
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3 flex flex-col items-center md:items-start">
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-200 dark:border-slate-700">
                        <img
                          src={testimonials[currentTestimonial].image}
                          alt={`${testimonials[currentTestimonial].name}'s profile`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-semibold mb-1">
                        {testimonials[currentTestimonial].name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                        {testimonials[currentTestimonial].role}
                      </p>
                      <p className="text-primary text-sm">
                        {testimonials[currentTestimonial].company}
                      </p>
                      <div
                        className="flex mt-4"
                        aria-label={`Rating: ${testimonials[currentTestimonial].rating} out of 5 stars`}
                      >
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < testimonials[currentTestimonial].rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <div className="relative">
                        <div
                          className="absolute -top-4 -left-4 text-4xl text-primary opacity-50"
                          aria-hidden="true"
                        >
                          "
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 text-lg italic relative z-10 mb-6">
                          {testimonials[currentTestimonial].content}
                        </p>
                        <div
                          className="absolute -bottom-4 -right-4 text-4xl text-primary opacity-50"
                          aria-hidden="true"
                        >
                          "
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-center mt-8 space-x-2">
                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                  className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary shadow-sm"
                  onClick={() =>
                    setCurrentTestimonial(
                      (prev) =>
                        (prev - 1 + testimonials.length) % testimonials.length
                    )
                  }
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>

                <div className="flex items-center space-x-2" role="tablist">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentTestimonial === index
                          ? "bg-primary"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                      onClick={() => setCurrentTestimonial(index)}
                      aria-label={`Show testimonial ${index + 1}`}
                      aria-selected={currentTestimonial === index}
                      role="tab"
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                  className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary shadow-sm"
                  onClick={() =>
                    setCurrentTestimonial(
                      (prev) => (prev + 1) % testimonials.length
                    )
                  }
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="relative mb-16 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <motion.div
                className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        x: [50, 100, 50],
                        y: [-50, -100, -50],
                        scale: [1, 1.2, 1],
                      }
                }
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                aria-hidden="true"
              />
              <motion.div
                className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        x: [-50, -100, -50],
                        y: [50, 100, 50],
                        scale: [1, 1.2, 1],
                      }
                }
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                aria-hidden="true"
              />
            </div>

            <div className="relative z-10 p-8 md:p-12 text-center">
              <motion.h2
                className="text-2xl md:text-3xl font-bold mb-4 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Need a custom solution?
              </motion.h2>
              <motion.p
                className="text-lg mb-6 max-w-2xl mx-auto text-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                We offer tailored solutions for businesses with specific
                requirements. Contact our sales team to discuss your needs.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="default"
                  asChild
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                >
                  <a href="/contact">Contact Sales</a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage;
