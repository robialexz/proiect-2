import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  File,
  FileText,
  FilePlus,
  FolderPlus,
  Upload,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Share,
  Users,
  Clock,
  Search,
  Filter,
  Eye,
  Lock,
  Unlock,
  FileEdit,
} from "lucide-react";

interface DocumentCollaborationProps {
  projectId?: string | null;
  className?: string;
}

interface Document {
  id: string;
  title: string;
  content: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  folder_id: string | null;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  project_id: string | null;
  is_public: boolean;
  shared_with: string[] | null;
  tags: string[] | null;
  version: number;
  status: "draft" | "published" | "archived";
}

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  project_id: string | null;
  created_by: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  user_name?: string;
  content: string;
  created_at: string;
}

const DocumentCollaboration: React.FC<DocumentCollaborationProps> = ({
  projectId = null,
  className,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string | null, name: string}[]>([]);
  
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [isViewDocumentOpen, setIsViewDocumentOpen] = useState(false);
  const [isEditDocumentOpen, setIsEditDocumentOpen] = useState(false);
  const [isShareDocumentOpen, setIsShareDocumentOpen] = useState(false);
  
  const [documentToView, setDocumentToView] = useState<Document | null>(null);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);
  const [documentToShare, setDocumentToShare] = useState<Document | null>(null);
  const [documentComments, setDocumentComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  
  // New document form state
  const [newDocument, setNewDocument] = useState({
    title: "",
    content: "",
    is_public: false,
    tags: [] as string[],
    status: "draft" as const,
  });
  
  // New folder form state
  const [newFolder, setNewFolder] = useState({
    name: "",
  });
  
  // File upload state
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated_at");
  
  // Load documents, folders and users when component mounts or projectId/currentFolder changes
  useEffect(() => {
    loadDocuments();
    loadFolders();
    loadUsers();
    updateBreadcrumbs();
  }, [projectId, currentFolder]);

  // Apply filters when documents or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [documents, searchQuery, statusFilter, sortBy]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("documents")
        .select("*, profiles(full_name)")
        .order(sortBy === "title" ? "title" : sortBy, { ascending: sortBy === "title" });

      // Filter by project if provided
      if (projectId) {
        query = query.eq("project_id", projectId);
      }
      
      // Filter by current folder
      if (currentFolder) {
        query = query.eq("folder_id", currentFolder);
      } else {
        query = query.is("folder_id", null);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedDocs = data.map(doc => ({
          ...doc,
          created_by_name: doc.profiles?.full_name || null
        }));
        setDocuments(formattedDocs);
        setFilteredDocuments(formattedDocs);
      }
    } catch (error: any) {
      console.error("Error loading documents:", error);
      toast({
        variant: "destructive",
        title: t("documents.loadError", "Error Loading Documents"),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      let query = supabase
        .from("document_folders")
        .select("*")
        .order("name");

      // Filter by project if provided
      if (projectId) {
        query = query.eq("project_id", projectId);
      }
      
      // Filter by current folder
      if (currentFolder) {
        query = query.eq("parent_id", currentFolder);
      } else {
        query = query.is("parent_id", null);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setFolders(data);
      }
    } catch (error: any) {
      console.error("Error loading folders:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("full_name");

      if (error) throw error;

      if (data) {
        setUsers(data);
      }
    } catch (error: any) {
      console.error("Error loading users:", error);
    }
  };

  const loadComments = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from("document_comments")
        .select("*, profiles(full_name)")
        .eq("document_id", documentId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedComments = data.map(comment => ({
          ...comment,
          user_name: comment.profiles?.full_name || null
        }));
        setDocumentComments(formattedComments);
      }
    } catch (error: any) {
      console.error("Error loading comments:", error);
    }
  };

  const updateBreadcrumbs = async () => {
    const breadcrumbsArray = [{ id: null, name: t("documents.root", "Root") }];
    
    if (currentFolder) {
      try {
        // Get the current folder
        const { data: folderData, error: folderError } = await supabase
          .from("document_folders")
          .select("*")
          .eq("id", currentFolder)
          .single();

        if (folderError) throw folderError;

        if (folderData) {
          // Add current folder to breadcrumbs
          breadcrumbsArray.push({ id: folderData.id, name: folderData.name });
          
          // If there's a parent folder, recursively add parents
          let parentId = folderData.parent_id;
          while (parentId) {
            const { data: parentData, error: parentError } = await supabase
              .from("document_folders")
              .select("*")
              .eq("id", parentId)
              .single();

            if (parentError) break;

            if (parentData) {
              breadcrumbsArray.splice(1, 0, { id: parentData.id, name: parentData.name });
              parentId = parentData.parent_id;
            } else {
              break;
            }
          }
        }
      } catch (error) {
        console.error("Error building breadcrumbs:", error);
      }
    }
    
    setBreadcrumbs(breadcrumbsArray);
  };

  const applyFilters = () => {
    let filtered = [...documents];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        doc => 
          doc.title.toLowerCase().includes(query) || 
          (doc.content && doc.content.toLowerCase().includes(query)) ||
          (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    setFilteredDocuments(filtered);
  };

  const createDocument = async () => {
    if (!newDocument.title.trim()) {
      toast({
        variant: "destructive",
        title: t("documents.validation.titleRequired", "Title Required"),
        description: t("documents.validation.pleaseEnterTitle", "Please enter a document title."),
      });
      return;
    }

    try {
      let fileUrl = null;
      let fileType = null;
      let fileSize = null;
      
      // If there's a file to upload, upload it first
      if (fileToUpload) {
        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `documents/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, fileToUpload);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
          
        fileUrl = urlData.publicUrl;
        fileType = fileToUpload.type;
        fileSize = fileToUpload.size;
      }
      
      const { data, error } = await supabase
        .from("documents")
        .insert([{
          title: newDocument.title,
          content: newDocument.content || null,
          file_url: fileUrl,
          file_type: fileType,
          file_size: fileSize,
          folder_id: currentFolder,
          project_id: projectId,
          created_by: user?.id,
          is_public: newDocument.is_public,
          tags: newDocument.tags.length > 0 ? newDocument.tags : null,
          status: newDocument.status,
          version: 1
        }])
        .select();

      if (error) throw error;

      toast({
        title: t("documents.createSuccess", "Document Created"),
        description: t("documents.createSuccessDesc", "Document has been created successfully."),
      });

      // Reset form and close dialog
      setNewDocument({
        title: "",
        content: "",
        is_public: false,
        tags: [],
        status: "draft",
      });
      setFileToUpload(null);
      setIsAddDocumentOpen(false);
      
      // Reload documents
      loadDocuments();
    } catch (error: any) {
      console.error("Error creating document:", error);
      toast({
        variant: "destructive",
        title: t("documents.createError", "Error Creating Document"),
        description: error.message,
      });
    }
  };

  const createFolder = async () => {
    if (!newFolder.name.trim()) {
      toast({
        variant: "destructive",
        title: t("documents.validation.nameRequired", "Name Required"),
        description: t("documents.validation.pleaseEnterFolderName", "Please enter a folder name."),
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("document_folders")
        .insert([{
          name: newFolder.name,
          parent_id: currentFolder,
          project_id: projectId,
          created_by: user?.id
        }])
        .select();

      if (error) throw error;

      toast({
        title: t("documents.folderCreateSuccess", "Folder Created"),
        description: t("documents.folderCreateSuccessDesc", "Folder has been created successfully."),
      });

      // Reset form and close dialog
      setNewFolder({ name: "" });
      setIsAddFolderOpen(false);
      
      // Reload folders
      loadFolders();
    } catch (error: any) {
      console.error("Error creating folder:", error);
      toast({
        variant: "destructive",
        title: t("documents.folderCreateError", "Error Creating Folder"),
        description: error.message,
      });
    }
  };

  const updateDocument = async () => {
    if (!documentToEdit) return;
    
    if (!documentToEdit.title.trim()) {
      toast({
        variant: "destructive",
        title: t("documents.validation.titleRequired", "Title Required"),
        description: t("documents.validation.pleaseEnterTitle", "Please enter a document title."),
      });
      return;
    }

    try {
      // Increment version number
      const newVersion = (documentToEdit.version || 0) + 1;
      
      const { data, error } = await supabase
        .from("documents")
        .update({
          title: documentToEdit.title,
          content: documentToEdit.content,
          is_public: documentToEdit.is_public,
          tags: documentToEdit.tags,
          status: documentToEdit.status,
          updated_at: new Date().toISOString(),
          version: newVersion
        })
        .eq("id", documentToEdit.id)
        .select();

      if (error) throw error;

      toast({
        title: t("documents.updateSuccess", "Document Updated"),
        description: t("documents.updateSuccessDesc", "Document has been updated successfully."),
      });

      // Close dialog and reset state
      setIsEditDocumentOpen(false);
      setDocumentToEdit(null);
      
      // Reload documents
      loadDocuments();
    } catch (error: any) {
      console.error("Error updating document:", error);
      toast({
        variant: "destructive",
        title: t("documents.updateError", "Error Updating Document"),
        description: error.message,
      });
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;

      toast({
        title: t("documents.deleteSuccess", "Document Deleted"),
        description: t("documents.deleteSuccessDesc", "Document has been deleted successfully."),
      });

      // Update local state
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast({
        variant: "destructive",
        title: t("documents.deleteError", "Error Deleting Document"),
        description: error.message,
      });
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      // Check if folder has documents or subfolders
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .select("id")
        .eq("folder_id", folderId);
        
      if (docError) throw docError;
      
      const { data: folderData, error: folderError } = await supabase
        .from("document_folders")
        .select("id")
        .eq("parent_id", folderId);
        
      if (folderError) throw folderError;
      
      if ((docData && docData.length > 0) || (folderData && folderData.length > 0)) {
        toast({
          variant: "destructive",
          title: t("documents.folderNotEmpty", "Folder Not Empty"),
          description: t("documents.folderNotEmptyDesc", "Cannot delete folder that contains documents or subfolders."),
        });
        return;
      }

      const { error } = await supabase
        .from("document_folders")
        .delete()
        .eq("id", folderId);

      if (error) throw error;

      toast({
        title: t("documents.folderDeleteSuccess", "Folder Deleted"),
        description: t("documents.folderDeleteSuccessDesc", "Folder has been deleted successfully."),
      });

      // Update local state
      setFolders(folders.filter(folder => folder.i