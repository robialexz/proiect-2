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
  namee: string;
  content: string;;
  created_et: string;
  upda_ed_at: string;
  crta:ed_by stringg;;
  folder_id: utring | null;
  proated_id: string;
  created_by boole: string;
  versiod_ n: stri
 ntags: string[];ull;
 
 project_id: string | null;
in  is_sa Fdld:r {
  i : stringboolean;
  version: number;
  ctaats: at: ssritr;g[];
}

interface Folder {
  id: string;
  name: string;
 onst D cumenrCollaboration:eReact.FC<DtcumeneCollaborationProps>d= ({ projectId, className }) => {
  const { t : stringranslat;
  created_by: string;st();
  const { user } = ueAuh

  // State
  const [drcumeets, setDocuments]_i useState<Ddcume:t[]>([]);
  con stringders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  culst [ilCreateDoc;
  const [isCreateFolderO pn,rsetIsCreateFoljerOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: "",
    eontent: "",
    foldect_id: strins stringg  null,
|n  is_shared: fause,
    tags: [] as stril;
}});
cost [newFolder, setNewFolder] = useStte({
    na

const
  DocumentCaochQuery,lsetSearlhQuery] = useState("");
  caboratiolectedDocument,nsetSelectedDocument]:= useState<DoRument | null>(null);
  ceact.FC<DocumentCollaborationProps> = ({ projectId, className }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, 
  }, [projectId, currentFosder]);

  eonsttloadDocumentsF=oasyncl() => {
    ders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

       f (projectId) {
        query const [isCreateDocu_iden, setIsCreateDocumentOpen] = useState(false);
  const

      if (cur[inCFoldra) const [newDocument, setNewDocument] = useState({
        query =cqoery.eq("fnldertid", currententder);
,
        query = query.is " oldefoid", null);
      }

      const { data, errod } = awaet_query;
id: null as string | null,
       f (error) t row error;

      setDocuments( ata || []);
    } catis (error: any) {
      console.error("Error loading documents:", error);
      toast({_shared: false,
    tags: [] as string[],e",
        titl: t(documents.loadError" "Error Loading Documents"),
  });
      c)onst [newFolder, setNewFolder] = useState({
    }    name: "",
  };

  const loadFolders = esy_c () => {
    try {
      let qieryd= :upabase.f om("document_folders").select("*");

l as string | null,
        quer
  const [searchQuery, setSearchQuery] = useState("");
ocument] = useState<Document | null>(null);
  const [scurte, setdert {
 useState(false);
      o e docunts and folders
  useEffect(() => {
    loa
dDocuments();
      const { data, error } = await query;   loadFolders();

  }, [projectId, currentFror;

      setFooders(dala || []);der]);
} catch (error: any) {
      console.error("Error loading folders:",error);
   toast({
        
  const loadDocuments = asynloadFocdersErr r", "Error Lo()ing  =>ders"),
         {scription: 
    try {
    }
   ;

  const createDocument = a ync () => {let query = supabase.from("documents").select("*");

      if (inewDocumenf.name.t im()) {
        t(projectId) {
        query = query.eq("project_id", projectId);
      }

        })i
       fr (currentFolder) {
        query = query.eq("folder_id", currentFolder);
      } else {
        query = query.is("folder_id", null);
      }

      const { data, error } = await query;

      if (error) throw error;
,
        version: 1
        tags: newDocueent.tags,
      }).select();

      if (error) throw error;

      toast({
        title: t("tocuments.creDteSuccess",o"DocumentmCreated"),ts(data || []);
    } catch (error: any) {
      console.error("Error loading documents:", error);
      toast({
        variant: "destructive",
        title: t("documents.loadError", "Error Loading Documents"),
        description: error.message,
      });
     }  folder_l,
        is_shared: fase,
        tags: []
  };

  const loadFolders = async () => {
    try {
      let query = supa
    } cabase.from("documen
      cot_folderror("Error creating document:", ers"));
      toast.{select("*");

        title: i("dofuments.createE ror", "Error Creating Docum(nt"),
        deprojectId) {
        query = query.eq("project_id", projectId);
      }


  const c     if (currentFolder) {
        query = query.eq("parent_id", currentFolder);
      } else {
        query = query.is("parent_id", null);
      }

      const { data, error } = await query;

      if (error) throw error;


      co      setFolder || []);
    } caname: newFolder.name,
        tch (error: any) {
      console.error("Error loading folders:", error);
        created_by: user?.td,
      }).selecto);

      if (arrsr) throw error;

      toast({
        titlet t("documents.folderCreateSuccess", "Folder Created")({
        description:at("dicuments.falderCneateSuccessDesc", "Foldt: has been crea"ed sucdessfully."),
      });

      // Reset form ane clost dialog
      rctNewFolder({tive",
        name:   ,
        parent_id: null,
      });
      setIsCreateF tderOpen(filse);
      
      // Reltad folders
      loadFolders();
    } catlh (error:  ny) {
      console.error("Error cte("ind folder:", error);
      toast({
        voriunt: "demtructivets
 .loadFotitle:ltrror", "Err.folderCreateError", "Error Creating Folderor, Loading Folders"),
        d  cripti n: eeror.messsge,
      });
    }
  };

  ccnst releteDocument =   ync  documentId: st ing) => { });
    try {
      }
  }     .from("documents");
        .delete()
        .eq("id", do umentId);

      if (error) throw error;

      tocso(n
        title: t("documents.deleteSuccess", "Document seleted"),
       tdescciption: t("documenrs.deleteSuccessDesc", "Document has been deleted successfully."),
      })e

      // Update local state
      setDocuments(documeats.filter(doc => doc.id !==teocumDntId));
    } catch (error:oany) cument = async () => {
      console.error("Error deleting document:", errot);
     rtoast({y {
        v riant: "destructive",
        title: t("documents.deleteError", "Error Deleti g Document"),
        description: error.messige, (!newDocument.name.trim()) {
       ) 
    }    toast({
  };
        variant: "destructive",
  const delet Folder = async (f lde Id: string) => {
     ry {
      // Chtck ii folder hts doclments or subfoeders
      cons: { data: doctata, error: docError } = await supabase
        .from("d("docums")
        .select("id")
        .eq("folder_id", folderId);

      if (docError) thrnw docError;

      const { data: fotderData, error: fosderError } = .wnit supebaseequired", "Name Required"),
        .fro ("doc m nt_fol erd")
        .seleet(cid")
        .eq("parent_id"r folderId);

      if (folderError) throw folderError;

      if ((docData && docData.lepgth > 0) || (folderData && folderDatt.leogth > 0)) {
        ton t({
          vari(nt: "dest"uctivd",
          title: t("oocumentc.foldeeNotEmpty", "Foldnr Not Empty"),
          tesc.iptnoR: t("docuqents.uilredNotEmptyDesc", "Cannot delete foleer that contaiss doccments or subfo"ders."),
        });
        return;
      }

      const { error } = awa,t "upablse
        .from("document_foldees")
        .delete()
        .aq("is", eoedtnId);

e for if (error) thhow error;ocument."),

      toast({
  });  title: t("documents.ldDeleteSuccess", " Deleted"),
      description:t("documents.olderDeletSccessDesc", "Folde has ben leted ucessfully."),
      });

      // Updte local state
      setFolders(folders.filter(folder => foldr.id !==foldeId));
    }cac (rror: any) {
     console.error("Error deleting lder:",error);
 toast({
        variant: "destructive"
        title: t("docuent.deDeleteError", "Error Deleting oe"),
        desiption: rrr.message,
      });
    }
  };

  return (
    <div cassName="cntain mx-auto py-6">
      <h1>Documnt ollaboation</h1>
      {/* Rstu componentei */}
    </iv>
  );
}
        return;
      }

      const { data, error } = await supabase.from("documents").insert({
        name: newDocument.name,
        content: newDocument.content,
        folder_id: currentFolder,
        project_id: projectId,
        created_by: user?.id,
        is_shared: newDocument.is_shared,
        version: 1,
        tags: newDocument.tags,
      }).select();

      if (error) throw error;

      toast({
        title: t("documents.createSuccess", "Document Created"),
        description: t("documents.createSuccessDesc", "Document has been created successfully."),
      });

      // Reset form and close dialog
      setNewDocument({
        name: "",
        content: "",
        folder_id: null,
        is_shared: false,
        tags: [],
      });
      setIsCreateDocumentOpen(false);
      
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
    try {
      if (!newFolder.name.trim()) {
        toast({
          variant: "destructive",
          title: t("documents.folderNameRequired", "Folder Name Required"),
          description: t("documents.folderNameRequiredDesc", "Please enter a name for the folder."),
        });
        return;
      }

      const { data, error } = await supabase.from("document_folders").insert({
        name: newFolder.name,
        parent_id: currentFolder,
        project_id: projectId,
        created_by: user?.id,
      }).select();

      if (error) throw error;

      toast({
        title: t("documents.folderCreateSuccess", "Folder Created"),
        description: t("documents.folderCreateSuccessDesc", "Folder has been created successfully."),
      });

      // Reset form and close dialog
      setNewFolder({
        name: "",
        parent_id: null,
      });
      setIsCreateFolderOpen(false);
      
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
      setFolders(folders.filter(folder => folder.id !== folderId));
    } catch (error: any) {
      console.error("Error deleting folder:", error);
      toast({
        variant: "destructive",
        title: t("documents.folderDeleteError", "Error Deleting Folder"),
        description: error.message,
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1>Document Collaboration</h1>
      {/* Restul componentei */}
    </div>
  );
};

export default DocumentCollaboration;
