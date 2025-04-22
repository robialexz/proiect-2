import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Mail,
  Send,
  Paperclip,
  X,
  Check,
  AlertCircle,
  Inbox,
  Clock,
  Star,
  FileText,
  Trash,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface EmailWidgetProps {
  className?: string;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  starred: boolean;
}

const EmailWidget: React.FC<EmailWidgetProps> = ({ className = "" }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "drafts">(
    "inbox",
  );

  // Mock emails for demonstration
  const mockEmails: Email[] = [
    {
      id: "1",
      from: "john.doe@example.com",
      subject: "Project Update: Phase 1 Complete",
      preview:
        "I'm pleased to inform you that we have successfully completed Phase 1 of the project...",
      date: "10:30 AM",
      read: false,
      starred: true,
    },
    {
      id: "2",
      from: "maria.smith@example.com",
      subject: "Meeting Reminder: Budget Review",
      preview:
        "This is a reminder that we have scheduled a budget review meeting tomorrow at 2 PM...",
      date: "Yesterday",
      read: true,
      starred: false,
    },
    {
      id: "3",
      from: "procurement@supplier.com",
      subject: "Order Confirmation #12345",
      preview:
        "Thank you for your order. This email confirms that we have received your purchase order...",
      date: "Jul 12",
      read: true,
      starred: false,
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleSendEmail = async () => {
    if (!to || !subject || !message) {
      toast({
        variant: "destructive",
        title: t("Missing Information"),
        description: t("Please fill in all required fields."),
      });
      return;
    }

    setIsSending(true);

    // Simulate sending email
    setTimeout(() => {
      setIsSending(false);
      setIsComposeOpen(false);
      setTo("");
      setSubject("");
      setMessage("");
      setAttachments([]);

      toast({
        title: t("Email Sent"),
        description: t("Your email has been sent successfully."),
      });
    }, 2000);
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t("Email")}</h2>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Mail className="h-4 w-4" />
              {t("Compose")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>{t("Compose Email")}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {t("Create and send a new email message.")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="to">{t("To")}:</Label>
                <Input
                  id="to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">{t("Subject")}:</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t("Email subject")}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t("Message")}:</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("Type your message here")}
                  className="min-h-[200px] bg-slate-700 border-slate-600"
                />
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>{t("Attachments")}:</Label>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-700 p-2 rounded-md"
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-slate-400" />
                          <span className="text-sm truncate max-w-[300px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 cursor-pointer"
                >
                  <Paperclip className="h-4 w-4" />
                  {t("Attach Files")}
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button onClick={handleSendEmail} disabled={isSending}>
                {isSending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {t("Sending...")}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t("Send Email")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-slate-800/50 rounded-lg overflow-hidden">
        <div className="flex border-b border-slate-700">
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === "inbox" ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-700/50"}`}
            onClick={() => setActiveTab("inbox")}
          >
            <div className="flex items-center justify-center gap-2">
              <Inbox className="h-4 w-4" />
              {t("Inbox")}
            </div>
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === "sent" ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-700/50"}`}
            onClick={() => setActiveTab("sent")}
          >
            <div className="flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              {t("Sent")}
            </div>
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === "drafts" ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-700/50"}`}
            onClick={() => setActiveTab("drafts")}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              {t("Drafts")}
            </div>
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {activeTab === "inbox" && mockEmails.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {mockEmails.map((email) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`p-3 hover:bg-slate-700/50 cursor-pointer ${!email.read ? "bg-slate-700/30" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <button className="mt-1">
                      {email.starred ? (
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ) : (
                        <Star className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4
                          className={`font-medium truncate ${!email.read ? "text-white" : "text-slate-300"}`}
                        >
                          {email.from}
                        </h4>
                        <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">
                          {email.date}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${!email.read ? "font-medium" : "text-slate-400"}`}
                      >
                        {email.subject}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {email.preview}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              {activeTab === "inbox" ? (
                <>
                  <Inbox className="h-12 w-12 text-slate-600 mb-2" />
                  <p className="text-slate-400">{t("Your inbox is empty")}</p>
                </>
              ) : activeTab === "sent" ? (
                <>
                  <Send className="h-12 w-12 text-slate-600 mb-2" />
                  <p className="text-slate-400">{t("No sent emails")}</p>
                </>
              ) : (
                <>
                  <Clock className="h-12 w-12 text-slate-600 mb-2" />
                  <p className="text-slate-400">{t("No draft emails")}</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-700 flex justify-between items-center">
          <div className="text-xs text-slate-400">
            {activeTab === "inbox" &&
            mockEmails.filter((e) => !e.read).length > 0
              ? t("{{count}} unread", {
                  count: mockEmails.filter((e) => !e.read).length,
                })
              : t("No unread messages")}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Trash className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailWidget;
