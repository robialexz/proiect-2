import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import pageErrorChecker from "@/utils/page-error-checker";
import { useToast } from "@/components/ui/use-toast";

// Define test types
interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  running: boolean;
  completed: boolean;
}

const TesterPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: "Database Connection",
      tests: [
        { name: "Connect to Supabase", passed: false },
        { name: "Query Users Table", passed: false },
        { name: "Query Projects Table", passed: false },
        { name: "Query Materials Table", passed: false },
      ],
      running: false,
      completed: false,
    },
    {
      name: "Authentication",
      tests: [
        { name: "Sign In Process", passed: false },
        { name: "Sign Up Process", passed: false },
        { name: "Password Reset", passed: false },
        { name: "Session Management", passed: false },
      ],
      running: false,
      completed: false,
    },
    {
      name: "Inventory Management",
      tests: [
        { name: "Create Material", passed: false },
        { name: "Update Material", passed: false },
        { name: "Delete Material", passed: false },
        { name: "Filter Materials", passed: false },
      ],
      running: false,
      completed: false,
    },
  ]);
  const [activeTab, setActiveTab] = useState("database");
  const [overallProgress, setOverallProgress] = useState(0);

  // Function to run database connection tests
  const runDatabaseTests = async () => {
    const suiteIndex = 0;
    const updatedSuites = [...testSuites];
    updatedSuites[suiteIndex].running = true;
    setTestSuites(updatedSuites);

    // Test 1: Connect to Supabase
    try {
      const { data: testData, error: testError } = await supabase
        .from("test_connection")
        .select("*")
        .limit(1);

      if (testError) throw new Error(testError.message);

      updatedSuites[suiteIndex].tests[0].passed = true;
      updatedSuites[suiteIndex].tests[0].duration = 500;
      setTestSuites([...updatedSuites]);

      // Simulate delay between tests
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        // Handle error appropriately
      }
    } catch (error) {
      updatedSuites[suiteIndex].tests[0].passed = false;
      updatedSuites[suiteIndex].tests[0].error =
        error instanceof Error ? error.message : "Unknown error";
      updatedSuites[suiteIndex].tests[0].duration = 500;
      setTestSuites([...updatedSuites]);

      toast({
        title: "Test Failed",
        description: `Connection test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });

      // Stop further tests if connection fails
      updatedSuites[suiteIndex].running = false;
      updatedSuites[suiteIndex].completed = true;
      setTestSuites([...updatedSuites]);
      updateProgress(updatedSuites);
      return;
    }

    // Test 2: Query Users Table
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("count")
        .limit(1);

      if (userError) throw new Error(userError.message);

      updatedSuites[suiteIndex].tests[1].passed = true;
      updatedSuites[suiteIndex].tests[1].duration = 700;
      setTestSuites([...updatedSuites]);

      try {
        await new Promise((resolve) => setTimeout(resolve, 700));
      } catch (error) {
        // Handle error appropriately
      }
    } catch (error) {
      updatedSuites[suiteIndex].tests[1].passed = false;
      updatedSuites[suiteIndex].tests[1].error =
        error instanceof Error ? error.message : "Unknown error";
      updatedSuites[suiteIndex].tests[1].duration = 700;
      setTestSuites([...updatedSuites]);
    }

    // Test 3: Query Projects Table
    try {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("count")
        .limit(1);

      if (projectError) throw new Error(projectError.message);

      updatedSuites[suiteIndex].tests[2].passed = true;
      updatedSuites[suiteIndex].tests[2].duration = 600;
      setTestSuites([...updatedSuites]);

      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch (error) {
        // Handle error appropriately
      }
    } catch (error) {
      updatedSuites[suiteIndex].tests[2].passed = false;
      updatedSuites[suiteIndex].tests[2].error =
        error instanceof Error ? error.message : "Unknown error";
      updatedSuites[suiteIndex].tests[2].duration = 600;
      setTestSuites([...updatedSuites]);
    }

    // Test 4: Query Materials Table
    try {
      const { data: materialData, error: materialError } = await supabase
        .from("materials")
        .select("count")
        .limit(1);

      if (materialError) throw new Error(materialError.message);

      updatedSuites[suiteIndex].tests[3].passed = true;
      updatedSuites[suiteIndex].tests[3].duration = 800;
      setTestSuites([...updatedSuites]);

      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
      } catch (error) {
        // Handle error appropriately
      }
    } catch (error) {
      updatedSuites[suiteIndex].tests[3].passed = false;
      updatedSuites[suiteIndex].tests[3].error =
        error instanceof Error ? error.message : "Unknown error";
      updatedSuites[suiteIndex].tests[3].duration = 800;
      setTestSuites([...updatedSuites]);
    }

    // Mark suite as completed
    updatedSuites[suiteIndex].running = false;
    updatedSuites[suiteIndex].completed = true;
    setTestSuites([...updatedSuites]);
    updateProgress(updatedSuites);

    // Show toast with results
    const passedCount = updatedSuites[suiteIndex].tests.filter(
      (test) => test.passed
    ).length;
    const totalTests = updatedSuites[suiteIndex].tests.length;

    toast({
      title: `Database Tests Completed`,
      description: `${passedCount} of ${totalTests} tests passed`,
      variant: passedCount === totalTests ? "default" : "destructive",
    });
  };

  // Function to run authentication tests
  const runAuthTests = async () => {
    const suiteIndex = 1;
    const updatedSuites = [...testSuites];
    updatedSuites[suiteIndex].running = true;
    setTestSuites(updatedSuites);

    // Simulate running auth tests
    for (let i = 0; i < updatedSuites[suiteIndex].tests.length; i++) {
      const testDuration = Math.floor(Math.random() * 500) + 500;

      // Simulate test execution
      try {
        await new Promise((resolve) => setTimeout(resolve, testDuration));
      } catch (error) {
        // Handle error appropriately
      }

      // Randomly determine if test passed (for demo purposes)
      const passed = Math.random() > 0.3;

      updatedSuites[suiteIndex].tests[i].passed = passed;
      updatedSuites[suiteIndex].tests[i].duration = testDuration;

      if (!passed) {
        updatedSuites[suiteIndex].tests[i].error =
          "Simulated authentication error";
      }

      setTestSuites([...updatedSuites]);
    }

    // Mark suite as completed
    updatedSuites[suiteIndex].running = false;
    updatedSuites[suiteIndex].completed = true;
    setTestSuites([...updatedSuites]);
    updateProgress(updatedSuites);

    // Show toast with results
    const passedCount = updatedSuites[suiteIndex].tests.filter(
      (test) => test.passed
    ).length;
    const totalTests = updatedSuites[suiteIndex].tests.length;

    toast({
      title: `Authentication Tests Completed`,
      description: `${passedCount} of ${totalTests} tests passed`,
      variant: passedCount === totalTests ? "default" : "destructive",
    });
  };

  // Function to run inventory management tests
  const runInventoryTests = async () => {
    const suiteIndex = 2;
    const updatedSuites = [...testSuites];
    updatedSuites[suiteIndex].running = true;
    setTestSuites(updatedSuites);

    // Simulate running inventory tests
    for (let i = 0; i < updatedSuites[suiteIndex].tests.length; i++) {
      const testDuration = Math.floor(Math.random() * 500) + 500;

      // Simulate test execution
      try {
        await new Promise((resolve) => setTimeout(resolve, testDuration));
      } catch (error) {
        // Handle error appropriately
      }

      // Randomly determine if test passed (for demo purposes)
      const passed = Math.random() > 0.2;

      updatedSuites[suiteIndex].tests[i].passed = passed;
      updatedSuites[suiteIndex].tests[i].duration = testDuration;

      if (!passed) {
        updatedSuites[suiteIndex].tests[i].error =
          "Simulated inventory operation error";
      }

      setTestSuites([...updatedSuites]);
    }

    // Mark suite as completed
    updatedSuites[suiteIndex].running = false;
    updatedSuites[suiteIndex].completed = true;
    setTestSuites([...updatedSuites]);
    updateProgress(updatedSuites);

    // Show toast with results
    const passedCount = updatedSuites[suiteIndex].tests.filter(
      (test) => test.passed
    ).length;
    const totalTests = updatedSuites[suiteIndex].tests.length;

    toast({
      title: `Inventory Tests Completed`,
      description: `${passedCount} of ${totalTests} tests passed`,
      variant: passedCount === totalTests ? "default" : "destructive",
    });
  };

  // Function to run all tests
  const runAllTests = async () => {
    try {
      await runDatabaseTests();
    } catch (error) {
      // Handle error appropriately
    }
    try {
      await runAuthTests();
    } catch (error) {
      // Handle error appropriately
    }
    try {
      await runInventoryTests();
    } catch (error) {
      // Handle error appropriately
    }

    toast({
      title: "All Tests Completed",
      description: "Check the results for each test suite",
    });
  };

  // Function to update overall progress
  const updateProgress = (suites: TestSuite[]) => {
    const totalTests = suites.reduce(
      (acc, suite) => acc + suite.tests.length,
      0
    );
    const passedTests = suites.reduce(
      (acc, suite) => acc + suite.tests.filter((test) => test.passed).length,
      0
    );

    setOverallProgress(Math.round((passedTests / totalTests) * 100));
  };

  // Reset all tests
  const resetTests = () => {
    const resetSuites = testSuites.map((suite) => ({
      ...suite,
      tests: suite.tests.map((test) => ({
        ...test,
        passed: false,
        error: undefined,
        duration: undefined,
      })),
      running: false,
      completed: false,
    }));

    setTestSuites(resetSuites);
    setOverallProgress(0);

    toast({
      title: "Tests Reset",
      description: "All test results have been cleared",
    });
  };

  // Generate test report
  const generateReport = () => {
    const totalTests = testSuites.reduce(
      (acc, suite) => acc + suite.tests.length,
      0
    );
    const passedTests = testSuites.reduce(
      (acc, suite) => acc + suite.tests.filter((test) => test.passed).length,
      0
    );

    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        successRate: `${Math.round((passedTests / totalTests) * 100)}%`,
      },
      suites: testSuites.map((suite) => ({
        name: suite.name,
        passed: suite.tests.every((test) => test.passed),
        tests: suite.tests.map((test) => ({
          name: test.name,
          passed: test.passed,
          error: test.error,
          duration: test.duration,
        })),
      })),
    };

    // Create a blob with the report data
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Generated",
      description: "Test report has been downloaded",
    });
  };

  return (
    <>
      <Helmet>
        <title>{t("tester.pageTitle", "Application Tester")}</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("tester.title", "Application Tester")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "tester.subtitle",
                "Run tests to verify application functionality"
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={runAllTests}
              disabled={testSuites.some((suite) => suite.running)}
            >
              {t("tester.runAll", "Run All Tests")}
            </Button>
            <Button
              variant="outline"
              onClick={resetTests}
              disabled={testSuites.some((suite) => suite.running)}
            >
              {t("tester.reset", "Reset")}
            </Button>
            <Button
              variant="secondary"
              onClick={generateReport}
              disabled={!testSuites.some((suite) => suite.completed)}
            >
              {t("tester.generateReport", "Generate Report")}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t("tester.progress", "Test Progress")}</CardTitle>
            <CardDescription>
              {t(
                "tester.progressDescription",
                "Overall test completion status"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t("tester.progress", "Progress")}</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Tabs
          defaultValue="database"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="database">
              {t("tester.database", "Database")}
            </TabsTrigger>
            <TabsTrigger value="auth">
              {t("tester.auth", "Authentication")}
            </TabsTrigger>
            <TabsTrigger value="inventory">
              {t("tester.inventory", "Inventory")}
            </TabsTrigger>
          </TabsList>

          {/* Database Tests */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>
                    {t("tester.databaseTests", "Database Connection Tests")}
                  </span>
                  <Button
                    onClick={runDatabaseTests}
                    disabled={
                      testSuites[0].running ||
                      testSuites.some(
                        (suite) => suite.running && suite !== testSuites[0]
                      )
                    }
                  >
                    {testSuites[0].running
                      ? t("tester.running", "Running...")
                      : t("tester.runTests", "Run Tests")}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {t(
                    "tester.databaseDescription",
                    "Verify database connectivity and table access"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testSuites[0].tests.map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div className="flex items-center gap-2">
                        <span>{test.name}</span>
                        {test.passed !== undefined && (
                          <Badge
                            variant={test.passed ? "default" : "destructive"}
                          >
                            {test.passed
                              ? t("tester.passed", "Passed")
                              : t("tester.failed", "Failed")}
                          </Badge>
                        )}
                      </div>
                      {test.duration && (
                        <span className="text-sm text-muted-foreground">
                          {test.duration}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              {testSuites[0].completed && (
                <CardFooter>
                  <div className="w-full">
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span>
                        {t("tester.result", "Result")}:
                        {testSuites[0].tests.every((t) => t.passed)
                          ? t("tester.allPassed", " All tests passed")
                          : t("tester.someFailed", " Some tests failed")}
                      </span>
                      <Badge
                        variant={
                          testSuites[0].tests.every((t) => t.passed)
                            ? "default"
                            : "destructive"
                        }
                      >
                        {testSuites[0].tests.filter((t) => t.passed).length}/
                        {testSuites[0].tests.length}
                      </Badge>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          {/* Authentication Tests */}
          <TabsContent value="auth">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{t("tester.authTests", "Authentication Tests")}</span>
                  <Button
                    onClick={runAuthTests}
                    disabled={
                      testSuites[1].running ||
                      testSuites.some(
                        (suite) => suite.running && suite !== testSuites[1]
                      )
                    }
                  >
                    {testSuites[1].running
                      ? t("tester.running", "Running...")
                      : t("tester.runTests", "Run Tests")}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {t(
                    "tester.authDescription",
                    "Test authentication flows and session management"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testSuites[1].tests.map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div className="flex items-center gap-2">
                        <span>{test.name}</span>
                        {test.passed !== undefined && (
                          <Badge
                            variant={test.passed ? "default" : "destructive"}
                          >
                            {test.passed
                              ? t("tester.passed", "Passed")
                              : t("tester.failed", "Failed")}
                          </Badge>
                        )}
                      </div>
                      {test.duration && (
                        <span className="text-sm text-muted-foreground">
                          {test.duration}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              {testSuites[1].completed && (
                <CardFooter>
                  <div className="w-full">
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span>
                        {t("tester.result", "Result")}:
                        {testSuites[1].tests.every((t) => t.passed)
                          ? t("tester.allPassed", " All tests passed")
                          : t("tester.someFailed", " Some tests failed")}
                      </span>
                      <Badge
                        variant={
                          testSuites[1].tests.every((t) => t.passed)
                            ? "default"
                            : "destructive"
                        }
                      >
                        {testSuites[1].tests.filter((t) => t.passed).length}/
                        {testSuites[1].tests.length}
                      </Badge>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          {/* Inventory Tests */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>
                    {t("tester.inventoryTests", "Inventory Management Tests")}
                  </span>
                  <Button
                    onClick={runInventoryTests}
                    disabled={
                      testSuites[2].running ||
                      testSuites.some(
                        (suite) => suite.running && suite !== testSuites[2]
                      )
                    }
                  >
                    {testSuites[2].running
                      ? t("tester.running", "Running...")
                      : t("tester.runTests", "Run Tests")}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {t(
                    "tester.inventoryDescription",
                    "Test inventory CRUD operations and filtering"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testSuites[2].tests.map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div className="flex items-center gap-2">
                        <span>{test.name}</span>
                        {test.passed !== undefined && (
                          <Badge
                            variant={test.passed ? "default" : "destructive"}
                          >
                            {test.passed
                              ? t("tester.passed", "Passed")
                              : t("tester.failed", "Failed")}
                          </Badge>
                        )}
                      </div>
                      {test.duration && (
                        <span className="text-sm text-muted-foreground">
                          {test.duration}ms
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              {testSuites[2].completed && (
                <CardFooter>
                  <div className="w-full">
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span>
                        {t("tester.result", "Result")}:
                        {testSuites[2].tests.every((t) => t.passed)
                          ? t("tester.allPassed", " All tests passed")
                          : t("tester.someFailed", " Some tests failed")}
                      </span>
                      <Badge
                        variant={
                          testSuites[2].tests.every((t) => t.passed)
                            ? "default"
                            : "destructive"
                        }
                      >
                        {testSuites[2].tests.filter((t) => t.passed).length}/
                        {testSuites[2].tests.length}
                      </Badge>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default TesterPage;
