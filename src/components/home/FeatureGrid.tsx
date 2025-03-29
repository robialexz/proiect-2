import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileSpreadsheet,
  Users,
  Package,
  Clock,
  Shield,
  Zap,
  LineChart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

interface FeatureGridProps {
  features?: FeatureItem[];
  className?: string;
}

const defaultFeatures: FeatureItem[] = [
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: "Real-time Analytics",
    description:
      "Monitor your inventory with powerful real-time analytics and customizable dashboards.",
    link: "/dashboard",
  },
  {
    icon: <FileSpreadsheet className="h-10 w-10 text-primary" />,
    title: "Excel Integration",
    description:
      "Seamlessly import and export data with our advanced Excel integration tools.",
    link: "/upload",
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Team Collaboration",
    description:
      "Collaborate effectively with role-based permissions for design and procurement teams.",
    link: "/users",
  },
  {
    icon: <Package className="h-10 w-10 text-primary" />,
    title: "Inventory Management",
    description:
      "Track materials, manage stock levels, and automate reordering processes.",
    link: "/inventory",
  },
  {
    icon: <Clock className="h-10 w-10 text-primary" />,
    title: "Order Tracking",
    description:
      "Monitor order status and delivery timelines with our comprehensive tracking system.",
    link: "/orders",
  },
  {
    icon: <Shield className="h-10 w-10 text-primary" />,
    title: "Secure Access",
    description:
      "Enterprise-grade security with role-based access control and data encryption.",
    link: "/security",
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Fast Performance",
    description:
      "Lightning-fast performance even with large datasets and complex operations.",
    link: "/performance",
  },
  {
    icon: <LineChart className="h-10 w-10 text-primary" />,
    title: "Trend Analysis",
    description:
      "Identify patterns and forecast future needs with our advanced trend analysis tools.",
    link: "/trends",
  },
];

const FeatureCard = ({ feature }: { feature: FeatureItem }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className="h-full bg-card border-2 border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all">
        <CardHeader>
          <motion.div
            className="mb-2"
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            {feature.icon}
          </motion.div>
          <CardTitle className="text-xl">{feature.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm text-muted-foreground">
            {feature.description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const FeatureGrid = ({
  features = defaultFeatures,
  className,
}: FeatureGridProps) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className={cn("py-16 px-4 bg-background", className)}>
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl font-bold tracking-tight mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Powerful Features for Inventory Management
          </motion.h2>
          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Everything you need to manage your project materials efficiently in
            one place
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              custom={index}
            >
              <a href={feature.link} className="block h-full">
                <FeatureCard feature={feature} />
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureGrid;
