import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Image,
  FileSpreadsheet,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { useRole } from "@/contexts/RoleContext";

interface SupplierAnnouncementListProps {
  projectId: string | null;
  refreshTrigger: number;
}

interface AnnouncementFile {
  id: string;
  announcement_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface Announcement {
  id: string;
  project_id: string;
  supplier_name: string;
  notes: string | null;
  status: "pending" | "confirmed" | "rejected";
  created_at: string;
  files?: AnnouncementFile[];
}

const SupplierAnnouncementList: React.FC<SupplierAnnouncementListProps> = ({
  projectId,
  refreshTrigger,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isManager } = useRole();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchAnnouncements();
    } else {
      setAnnouncements([]);
      setLoading(false);
    }
  }, [projectId, refreshTrigger]);

  const fetchAnnouncements = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      // Fetch announcements
      const { data: announcementsData, error: announcementsError } =
        try {
  await supabase.from("supplier_announcements")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
} catch (error) {
  // Handle error appropriately
};

      if (announcementsError) throw announcementsError;

      if (announcementsData) {
        // Fetch files for each announcement
        try {
        const announcementsWithFiles = await Promise.all(
        } catch (error) {
          // Handle error appropriately
        }
          announcementsData.map(async (announcement) => {
            try {
            const { data: filesData, error: filesError } = await supabase
            } catch (error) {
              // Handle error appropriately
            }
              .from("supplier_announcement_files")
              .select("*")
              .eq("announcement_id", announcement.id);

            if (filesError) throw filesError;

            return {
              ...announcement,
              files: filesData || [],
            };
          }),
        );

        setAnnouncements(announcementsWithFiles);
      }
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t(
          "inventory.errors.fetchAnnouncementsFailed",
          "Failed to fetch announcements",
        ),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = async (
    announcementId: string,
    newStatus: "confirmed" | "rejected",
  ) => {
    try {
      const { error } = await supabase
        .from("supplier_announcements")
        .update({ status: newStatus })
        .eq("id", announcementId);

      if (error) throw error;

      // Update local state
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === announcementId ? { ...a, status: newStatus } : a,
        ),
      );

      if (selectedAnnouncement?.id === announcementId) {
        setSelectedAnnouncement((prev) =>
          prev ? { ...prev, status: newStatus } : null,
        );
      }

      toast({
        title:
          newStatus === "confirmed"
            ? t(
                "inventory.toasts.announcementConfirmed",
                "Announcement confirmed",
              )
            : t(
                "inventory.toasts.announcementRejected",
                "Announcement rejected",
              ),
      });
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t(
          "inventory.errors.updateStatusFailed",
          "Failed to update status",
        ),
        description: error.message,
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes("excel")) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    } else if (fileType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <FileText className="h-5 w-5 text-slate-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            {t("inventory.supplierAnnouncement.pending", "Pending")}
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("inventory.supplierAnnouncement.confirmed", "Confirmed")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            {t("inventory.supplierAnnouncement.rejected", "Rejected")}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-500/20 text-slate-500 border-slate-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleDownloadFile = async (file: AnnouncementFile) => {
    try {
      const { data, error } = await supabase.storage
        .from("supplier-files")
        .download(file.file_path);

      if (error) throw error;

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("inventory.errors.downloadFailed", "Failed to download file"),
        description: error.message,
      });
    }
  };

  const viewFile = async (file: AnnouncementFile) => {
    try {
      // For images, we can create a signed URL and open it
      if (file.file_type.includes("image")) {
        const { data, error } = await supabase.storage
          .from("supplier-files")
          .createSignedUrl(file.file_path, 60);

        if (error) throw error;
        if (data?.signedUrl) {
          window.open(data.signedUrl, "_blank");
        }
      } else {
        // For other files, we'll download them
        handleDownloadFile(file);
      }
    } catch (error: any) {
      // Removed console statement
      toast({
        variant: "destructive",
        title: t("inventory.errors.viewFailed", "Failed to view file"),
        description: error.message,
      });
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle>
          {t(
            "inventory.supplierAnnouncement.listTitle",
            "Supplier Announcements",
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-slate-400">
              {t("common.loading", "Loading...")}
            </p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">
              {projectId
                ? t(
                    "inventory.supplierAnnouncement.noAnnouncements",
                    "No supplier announcements found",
                  )
                : t(
                    "inventory.supplierAnnouncement.selectProject",
                    "Select a project to view announcements",
                  )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("inventory.supplierAnnouncement.supplier", "Supplier")}
                  </TableHead>
                  <TableHead>
                    {t("inventory.supplierAnnouncement.date", "Date")}
                  </TableHead>
                  <TableHead>
                    {t("inventory.supplierAnnouncement.files", "Files")}
                  </TableHead>
                  <TableHead>
                    {t("inventory.supplierAnnouncement.status", "Status")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("common.actions", "Actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">
                      {announcement.supplier_name}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(announcement.created_at),
                        "dd MMM yyyy, HH:mm",
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {announcement.files?.slice(0, 3).map((file) => (
                          <div
                            key={file.id}
                            className="w-6 h-6 flex items-center justify-center"
                            title={file.file_name}
                          >
                            {getFileIcon(file.file_type)}
                          </div>
                        ))}
                        {(announcement.files?.length || 0) > 3 && (
                          <span className="text-xs text-slate-400">
                            +{(announcement.files?.length || 0) - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(announcement.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAnnouncement(announcement)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t("common.view", "View")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* View Announcement Dialog */}
        <Dialog
          open={isViewDialogOpen}
          onOpenChange={(open) => {
            setIsViewDialogOpen(open);
            if (!open) setSelectedAnnouncement(null);
          }}
        >
          <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
            {selectedAnnouncement && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-center">
                    <DialogTitle>
                      {t(
                        "inventory.supplierAnnouncement.viewTitle",
                        "Supplier Announcement",
                      )}
                    </DialogTitle>
                    {getStatusBadge(selectedAnnouncement.status)}
                  </div>
                  <DialogDescription className="text-slate-400">
                    {t(
                      "inventory.supplierAnnouncement.from",
                      "From {{supplier}} on {{date}}",
                      {
                        supplier: selectedAnnouncement.supplier_name,
                        date: format(
                          new Date(selectedAnnouncement.created_at),
                          "dd MMMM yyyy, HH:mm",
                        ),
                      },
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {selectedAnnouncement.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        {t("inventory.supplierAnnouncement.note", "Note")}
                      </h4>
                      <p className="text-sm text-slate-300 bg-slate-700 p-3 rounded-md">
                        {selectedAnnouncement.notes}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      {t("inventory.supplierAnnouncement.files", "Files")}
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {selectedAnnouncement.files?.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-slate-700 p-3 rounded-md"
                        >
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.file_type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {file.file_name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatFileSize(file.file_size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white"
                              onClick={() => viewFile(file)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white"
                              onClick={() => handleDownloadFile(file)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  {selectedAnnouncement.status === "pending" && isManager && (
                    <div className="flex space-x-2 w-full justify-between sm:justify-end">
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleUpdateStatus(
                            selectedAnnouncement.id,
                            "rejected",
                          )
                        }
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t(
                          "inventory.supplierAnnouncement.reject",
                          "Reject Delivery",
                        )}
                      </Button>
                      <Button
                        onClick={() =>
                          handleUpdateStatus(
                            selectedAnnouncement.id,
                            "confirmed",
                          )
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t(
                          "inventory.supplierAnnouncement.confirm",
                          "Confirm Delivery",
                        )}
                      </Button>
                    </div>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SupplierAnnouncementList;
