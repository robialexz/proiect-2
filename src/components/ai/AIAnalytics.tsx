import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Bot,
  BarChart2,
  PieChart as PieChartIcon,
  MessageSquare,
  Clock,
  Download,
  RefreshCw,
} from "lucide-react";
import { AnimatedContainer } from "@/components/ui/animated-container";

interface AIAnalyticsProps {
  className?: string;
}

interface ConversationData {
  id: string;
  user_id: string;
  messages: {
    role: string;
    content: string;
    timestamp: string;
  }[];
  context: Record<string, any>;
  created_at: string;
}

interface TopicData {
  name: string;
  count: number;
}

interface UserData {
  id: string;
  name: string;
  conversationCount: number;
  messageCount: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

export const AIAnalytics: React.FC<AIAnalyticsProps> = ({ className }) => {
  const { t } = useTranslation();
  const supabase = useSupabaseClient();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [topicData, setTopicData] = useState<TopicData[]>([]);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [timeData, setTimeData] = useState<{ name: string; count: number }[]>([]);

  // Funcție pentru încărcarea datelor
  const loadData = async () => {
    setLoading(true);
    try {
      // Încărcăm conversațiile
      const { data: conversationsData, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setConversations(conversationsData || []);

      // Procesăm datele pentru grafice
      processData(conversationsData || []);
    } catch (error) {
      console.error("Error loading AI analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Procesăm datele pentru grafice
  const processData = (data: ConversationData[]) => {
    // Procesăm datele pentru topicuri
    const topics: Record<string, number> = {};
    data.forEach((conversation) => {
      // Extragem topicurile din mesajele utilizatorilor
      conversation.messages
        .filter((msg) => msg.role === "user")
        .forEach((msg) => {
          const content = msg.content.toLowerCase();
          if (content.includes("inventar") || content.includes("stoc")) {
            topics["Inventar"] = (topics["Inventar"] || 0) + 1;
          } else if (content.includes("proiect")) {
            topics["Proiecte"] = (topics["Proiecte"] || 0) + 1;
          } else if (content.includes("furnizor")) {
            topics["Furnizori"] = (topics["Furnizori"] || 0) + 1;
          } else if (content.includes("raport")) {
            topics["Rapoarte"] = (topics["Rapoarte"] || 0) + 1;
          } else if (content.includes("ajutor") || content.includes("cum")) {
            topics["Ajutor"] = (topics["Ajutor"] || 0) + 1;
          } else {
            topics["Altele"] = (topics["Altele"] || 0) + 1;
          }
        });
    });

    // Convertim topicurile în format pentru grafic
    const topicDataArray = Object.entries(topics).map(([name, count]) => ({
      name,
      count,
    }));
    setTopicData(topicDataArray);

    // Procesăm datele pentru utilizatori
    const users: Record<string, { name: string; conversationCount: number; messageCount: number }> = {};
    data.forEach((conversation) => {
      const userId = conversation.user_id;
      if (!users[userId]) {
        users[userId] = {
          name: userId.substring(0, 8) + "...",
          conversationCount: 0,
          messageCount: 0,
        };
      }
      users[userId].conversationCount += 1;
      users[userId].messageCount += conversation.messages.filter((msg) => msg.role === "user").length;
    });

    // Convertim utilizatorii în format pentru grafic
    const userDataArray = Object.entries(users).map(([id, data]) => ({
      id,
      name: data.name,
      conversationCount: data.conversationCount,
      messageCount: data.messageCount,
    }));
    setUserData(userDataArray);

    // Procesăm datele pentru timp
    const timeDistribution: Record<string, number> = {
      "00-06": 0,
      "06-12": 0,
      "12-18": 0,
      "18-24": 0,
    };
    data.forEach((conversation) => {
      const createdAt = new Date(conversation.created_at);
      const hour = createdAt.getHours();
      if (hour >= 0 && hour < 6) {
        timeDistribution["00-06"] += 1;
      } else if (hour >= 6 && hour < 12) {
        timeDistribution["06-12"] += 1;
      } else if (hour >= 12 && hour < 18) {
        timeDistribution["12-18"] += 1;
      } else {
        timeDistribution["18-24"] += 1;
      }
    });

    // Convertim distribuția timpului în format pentru grafic
    const timeDataArray = Object.entries(timeDistribution).map(([name, count]) => ({
      name,
      count,
    }));
    setTimeData(timeDataArray);
  };

  // Încărcăm datele la montarea componentei
  useEffect(() => {
    loadData();
  }, []);

  return (
    <AnimatedContainer animation="fade" className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Bot className="mr-2 h-6 w-6 text-primary" />
                {t("ai.analytics.title", "Analiză AI")}
              </CardTitle>
              <CardDescription>
                {t(
                  "ai.analytics.description",
                  "Analiză și statistici despre utilizarea asistentului AI"
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("ai.analytics.refresh", "Reîmprospătează")}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t("ai.analytics.export", "Exportă")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">
                <BarChart2 className="h-4 w-4 mr-2" />
                {t("ai.analytics.overview", "Prezentare generală")}
              </TabsTrigger>
              <TabsTrigger value="topics">
                <PieChartIcon className="h-4 w-4 mr-2" />
                {t("ai.analytics.topics", "Topicuri")}
              </TabsTrigger>
              <TabsTrigger value="conversations">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t("ai.analytics.conversations", "Conversații")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t("ai.analytics.totalConversations", "Total conversații")}
                        </p>
                        <h3 className="text-2xl font-bold">{conversations.length}</h3>
                      </div>
                      <MessageSquare className="h-8 w-8 text-primary opacity-80" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t("ai.analytics.totalMessages", "Total mesaje")}
                        </p>
                        <h3 className="text-2xl font-bold">
                          {conversations.reduce(
                            (total, conv) => total + conv.messages.length,
                            0
                          )}
                        </h3>
                      </div>
                      <MessageSquare className="h-8 w-8 text-blue-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t("ai.analytics.activeUsers", "Utilizatori activi")}
                        </p>
                        <h3 className="text-2xl font-bold">{userData.length}</h3>
                      </div>
                      <Bot className="h-8 w-8 text-green-500 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {t("ai.analytics.topicDistribution", "Distribuția topicurilor")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={topicData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {topicData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {t("ai.analytics.timeDistribution", "Distribuția în timp")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="count"
                            name={t("ai.analytics.conversations", "Conversații")}
                            fill="#8884d8"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="topics">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {t("ai.analytics.topicAnalysis", "Analiza topicurilor")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topicData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="count"
                          name={t("ai.analytics.frequency", "Frecvență")}
                          fill="#8884d8"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {topicData.map((topic, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {topic.name}
                          </p>
                          <h3 className="text-2xl font-bold">{topic.count}</h3>
                        </div>
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: COLORS[index % COLORS.length] + "40" }}
                        >
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="conversations">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {t("ai.analytics.recentConversations", "Conversații recente")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {conversations.slice(0, 10).map((conversation, index) => (
                        <Card key={index}>
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-sm">
                                  {t("ai.analytics.conversation", "Conversație")} #{index + 1}
                                </CardTitle>
                                <CardDescription>
                                  {new Date(conversation.created_at).toLocaleString()}
                                </CardDescription>
                              </div>
                              <Badge>
                                {conversation.messages.length}{" "}
                                {t("ai.analytics.messages", "mesaje")}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="space-y-2">
                              {conversation.messages.slice(0, 3).map((message, msgIndex) => (
                                <div key={msgIndex} className="text-sm">
                                  <span className="font-medium">
                                    {message.role === "user"
                                      ? t("ai.analytics.user", "Utilizator")
                                      : t("ai.analytics.assistant", "Asistent")}
                                    :
                                  </span>{" "}
                                  {message.content.length > 100
                                    ? message.content.substring(0, 100) + "..."
                                    : message.content}
                                </div>
                              ))}
                              {conversation.messages.length > 3 && (
                                <div className="text-sm text-muted-foreground">
                                  {t("ai.analytics.moreMessages", "... și încă")} {conversation.messages.length - 3} {t("ai.analytics.messages", "mesaje")}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            {t(
              "ai.analytics.footer",
              "Datele sunt actualizate în timp real. Ultima actualizare: "
            )}{" "}
            {new Date().toLocaleString()}
          </p>
        </CardFooter>
      </Card>
    </AnimatedContainer>
  );
};
