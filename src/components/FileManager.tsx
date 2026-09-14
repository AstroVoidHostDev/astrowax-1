import { useUpload } from "../context/UploadContext";
import React, { useEffect, useState, useRef } from "react";
import { LoadingOverlay } from "../components/LoadingOverlay";
import axios from "axios";
import {
  Folder, File, ArrowLeft, Upload, Trash2, Edit2, Save, Archive, Search, X,
  CheckSquare, Square, Download, FilePlus, FolderPlus, MoreVertical, FileText,
  FileArchive, FileCode, Check, AlertTriangle, ChevronRight, FolderDown, RefreshCw,
  Hexagon, Sparkles, Home, UploadCloud, Files, Loader2, XCircle,
  Copy, ClipboardPaste, PackageOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================
// AstroWax Panel V1.80 — File Manager
// Glass + Purple + Copy/Paste + Auto-Refresh
// ============================================

interface FileItem {
  name: string;
  isDirectory: boolean;
  size: number;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

interface QueueItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

interface ClipboardState {
  paths: string[];
  names: string[];
  sourceDir: string;
}

export default function FileManager({ serverId }: { serverId: string }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [path, setPath] = useState("/");
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const { startUpload } = useUpload();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(false);
  const [isUnzipping, setIsUnzipping] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPasting, setIsPasting] = useState(false);

  const [openMenuRow, setOpenMenuRow] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const [activeModal, setActiveModal] = useState<"create_file" | "create_folder" | "rename" | "delete" | "zip" | null>(null);
  const [modalInput, setModalInput] = useState("");
  const [targetItem, setTargetItem] = useState<{ name: string; isDirectory: boolean } | null>(null);

  // ---------- Clipboard State ----------
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);

  // ---------- Drag & Drop Upload State ----------
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<QueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const dragCounter = useRef(0);

  const menuRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuRow(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchFiles = async (delayMs = 0) => {
    if (delayMs > 0) {
      await new Promise(res => setTimeout(res, delayMs));
    }
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/servers/${serverId}/files?path=${encodeURIComponent(path)}`);
      if (res.data.isFile) {
        setFileContent(res.data.content);
      } else {
        setFiles(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e: any) {
      setFiles([]);
      showToast("Failed to fetch folder contents", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // SMART POLLING
  // ============================================
  const waitForFilesToAppear = async (filenames: string[], maxAttempts = 15) => {
    if (filenames.length === 0) return;

    const targetNames = filenames.map(n => n.toLowerCase());

    for (let i = 0; i < maxAttempts; i++) {
      if (i > 0) {
        await new Promise(res => setTimeout(res, 400));
      }

      try {
        const res = await axios.get(`/api/servers/${serverId}/files?path=${encodeURIComponent(path)}`);
        const currentFiles: FileItem[] = Array.isArray(res.data) ? res.data : [];
        const currentNames = new Set(currentFiles.map(f => f.name.toLowerCase()));

        setFiles(currentFiles);

        const arrivedCount = targetNames.filter(name => currentNames.has(name)).length;
        if (arrivedCount === targetNames.length) {
          return true;
        }
      } catch (e) {
        // Silent retry
      }
    }

    await fetchFiles();
    return false;
  };

  useEffect(() => {
    fetchFiles();
    setSelectedFiles(new Set());
    setSearchQuery("");
    setOpenMenuRow(null);
  }, [path, serverId]);

  const goUp = () => {
    if (editingFile) { setEditingFile(null); return; }
    if (path === "/") return;
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    setPath("/" + parts.join("/"));
  };

  const navigateToSegment = (index: number) => {
    if (editingFile) setEditingFile(null);
    const parts = path.split("/").filter(Boolean);
    if (index === -1) { setPath("/"); return; }
    const newParts = parts.slice(0, index + 1);
    setPath("/" + newParts.join("/"));
  };

  const traverse = (dirName: string) => {
    setPath(path.endsWith("/") ? path + dirName : path + "/" + dirName);
  };

  const openFile = async (name: string) => {
    if (!name.match(/\.(txt|json|yml|yaml|properties|log|conf|ini|sh|bat|cmd|env|toml|xml|md)$/i)) {
      showToast("Binary format cannot be directly edited in text editor.", "error");
      return;
    }
    const fullPath = path.endsWith("/") ? path + name : path + "/" + name;
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/servers/${serverId}/files?path=${encodeURIComponent(fullPath)}`);
      if (res.data.isFile) {
        setEditingFile(name);
        setFileContent(res.data.content);
      }
    } catch (e) {
      showToast("Failed to load file contents", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const saveFile = async () => {
    if (!editingFile) return;
    setIsSaving(true);
    try {
      const fullPath = path.endsWith("/") ? path + editingFile : path + "/" + editingFile;
      await axios.post(`/api/servers/${serverId}/files/save`, {
        filePath: fullPath,
        content: fileContent
      });
      showToast(`Saved ${editingFile} successfully`, "success");
    } catch (e) {
      showToast("Failed to save file", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = (itemName: string, isDirectory: boolean) => {
    const p = path.endsWith("/") ? path : path + "/";
    const fullPath = p + itemName;
    const downloadUrl = `/api/servers/${serverId}/files/download?path=${encodeURIComponent(fullPath)}`;
    window.open(downloadUrl, "_blank");
    showToast(`Downloading ${isDirectory ? itemName + ".zip" : itemName}...`, "success");
    setOpenMenuRow(null);
  };

  const handleDownloadSelected = () => {
    if (selectedFiles.size === 0) return;
    const p = path.endsWith("/") ? path : path + "/";
    const selectedList = Array.from(selectedFiles);

    if (selectedList.length === 1) {
      const item = files.find(f => f.name === selectedList[0]);
      handleDownload(selectedList[0], item?.isDirectory || false);
      return;
    }

    const queryPaths = selectedList.map(name => encodeURIComponent(p + name)).join("&paths=");
    const downloadUrl = `/api/servers/${serverId}/files/download?paths=${queryPaths}`;
    window.open(downloadUrl, "_blank");
    showToast(`Preparing download for ${selectedList.length} items...`, "success");
  };

  // ============================================
  // CLIPBOARD — Copy / Paste
  // ============================================

  const handleCopySelected = () => {
    if (selectedFiles.size === 0) return;
    const p = path.endsWith("/") ? path : path + "/";
    const names = Array.from(selectedFiles);
    const paths = names.map(n => p + n);

    setClipboard({
      paths,
      names,
      sourceDir: path,
    });

    showToast(`Copied ${names.length} item(s) to clipboard`, "success");
    setSelectedFiles(new Set());
  };

  const handlePaste = async () => {
    if (!clipboard || clipboard.paths.length === 0) return;
    if (clipboard.sourceDir === path) {
      showToast("Cannot paste into the same folder", "error");
      return;
    }

    setIsPasting(true);
    try {
      await axios.post(`/api/servers/${serverId}/files/copy`, {
        sourcePaths: clipboard.paths,
        targetPath: path,
      });

      showToast(`Copied ${clipboard.paths.length} item(s)`, "success");
      waitForFilesToAppear(clipboard.names, 12);
    } catch (e: any) {
      const errorMsg = e.response?.data?.error || e.message || "Paste failed";
      showToast(errorMsg, "error");
    } finally {
      setIsPasting(false);
    }
  };

  const handleClearClipboard = () => {
    setClipboard(null);
    showToast("Clipboard cleared", "success");
  };

  // ============================================
  // CREATE / RENAME / DELETE / ZIP / UNZIP
  // ============================================

  const submitCreateFile = async () => {
    if (!modalInput.trim()) return;
    const fileName = modalInput.trim();
    try {
      const fullPath = path.endsWith("/") ? path + fileName : path + "/" + fileName;
      await axios.post(`/api/servers/${serverId}/files/create`, { filePath: fullPath });
      showToast(`Created file '${fileName}'`, "success");
      setActiveModal(null);
      setModalInput("");
      if (!files.some(f => f.name === fileName)) {
        setFiles(prev => [...prev, { name: fileName, isDirectory: false, size: 0 }]);
      }
      waitForFilesToAppear([fileName], 8);
      if (fileName.match(/\.(txt|json|yml|yaml|properties|log|conf|ini|sh|bat|cmd|env|toml|xml|md)$/i)) {
        openFile(fileName);
      }
    } catch (e) {
      showToast("Failed to create file", "error");
    }
  };

  const submitCreateFolder = async () => {
    if (!modalInput.trim()) return;
    const folderName = modalInput.trim();
    try {
      const fullPath = path.endsWith("/") ? path + folderName : path + "/" + folderName;
      await axios.post(`/api/servers/${serverId}/files/mkdir`, { filePath: fullPath });
      showToast(`Created folder '${folderName}'`, "success");
      setActiveModal(null);
      setModalInput("");
      if (!files.some(f => f.name === folderName)) {
        setFiles(prev => [...prev, { name: folderName, isDirectory: true, size: 0 }]);
      }
      waitForFilesToAppear([folderName], 8);
    } catch (e) {
      showToast("Failed to create folder", "error");
    }
  };

  const openRenameModal = (item: { name: string; isDirectory: boolean }) => {
    setTargetItem(item);
    setModalInput(item.name);
    setActiveModal("rename");
    setOpenMenuRow(null);
  };

  const submitRename = async () => {
    if (!targetItem || !modalInput.trim() || modalInput.trim() === targetItem.name) {
      setActiveModal(null);
      return;
    }
    const newName = modalInput.trim();
    const oldName = targetItem.name;
    const p = path.endsWith("/") ? path : path + "/";

    setFiles(prev => prev.map(f => f.name === oldName ? { ...f, name: newName } : f));

    try {
      await axios.post(`/api/servers/${serverId}/files/rename`, {
        oldPath: p + oldName,
        newPath: p + newName
      });
      showToast(`Renamed to '${newName}'`, "success");
      setActiveModal(null);
      setTargetItem(null);
      setModalInput("");
      waitForFilesToAppear([newName], 8);
    } catch (e) {
      showToast("Failed to rename item", "error");
      setFiles(prev => prev.map(f => f.name === newName ? { ...f, name: oldName } : f));
    }
  };

  const openDeleteModal = (item?: { name: string; isDirectory: boolean }) => {
    if (item) setTargetItem(item);
    else setTargetItem(null);
    setActiveModal("delete");
    setOpenMenuRow(null);
  };

  const submitDelete = async () => {
    setIsDeleting(true);
    const p = path.endsWith("/") ? path : path + "/";
    let pathsToDelete: string[] = [];
    let namesToDelete: string[] = [];

    if (targetItem) {
      pathsToDelete = [p + targetItem.name];
      namesToDelete = [targetItem.name];
    } else {
      namesToDelete = Array.from(selectedFiles);
      pathsToDelete = namesToDelete.map(name => p + name);
    }

    setFiles(prev => prev.filter(f => !namesToDelete.includes(f.name)));

    try {
      await axios.delete(`/api/servers/${serverId}/files`, {
        data: { paths: pathsToDelete }
      });

      showToast(`Deleted ${pathsToDelete.length} item(s)`, "success");
      setSelectedFiles(new Set());
      setActiveModal(null);
      setTargetItem(null);
      fetchFiles(300);
    } catch (e) {
      showToast("Failed to delete item(s)", "error");
      fetchFiles(200);
    } finally {
      setIsDeleting(false);
    }
  };

  const openZipModal = (item?: { name: string; isDirectory: boolean }) => {
    if (item) {
      setSelectedFiles(new Set([item.name]));
      setModalInput(`${item.name}.zip`);
    } else {
      setModalInput("archive.zip");
    }
    setActiveModal("zip");
    setOpenMenuRow(null);
  };

  const submitZip = async () => {
    if (selectedFiles.size === 0 || !modalInput.trim()) return;
    const outputName = modalInput.trim().endsWith(".zip") ? modalInput.trim() : `${modalInput.trim()}.zip`;

    setIsZipping(true);
    try {
      const p = path.endsWith("/") ? path : path + "/";
      await axios.post(`/api/servers/${serverId}/files/zip`, {
        dirPath: p,
        fileNames: Array.from(selectedFiles),
        outputName
      });
      showToast(`Compressed into '${outputName}'`, "success");
      setSelectedFiles(new Set());
      setActiveModal(null);
      if (!files.some(f => f.name === outputName)) {
        setFiles(prev => [...prev, { name: outputName, isDirectory: false, size: 0 }]);
      }
      waitForFilesToAppear([outputName], 15);
    } catch (e) {
      showToast("Failed to zip items", "error");
    } finally {
      setIsZipping(false);
    }
  };

  const handleUnzipItem = async (itemName: string) => {
    setIsUnzipping(true);
    setOpenMenuRow(null);
    try {
      const p = path.endsWith("/") ? path : path + "/";
      await axios.post(`/api/servers/${serverId}/files/unzip`, { path: p + itemName });
      showToast(`Extracted '${itemName}' successfully`, "success");
      setSelectedFiles(new Set());
      await new Promise(res => setTimeout(res, 500));
      await fetchFiles();
      setTimeout(() => fetchFiles(), 1500);
    } catch (e: any) {
      const errorMsg = e.response?.data?.error || e.message || "Failed to extract archive";
      showToast(errorMsg, "error");
    } finally {
      setIsUnzipping(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const uploadFn = startUpload as any;
    try {
      uploadFn(file, serverId, path);
    } catch {}

    waitForFilesToAppear([file.name], 20);
    e.target.value = "";
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.name)));
    }
  };

  const toggleSelectFile = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedFiles);
    if (newSet.has(name)) newSet.delete(name);
    else newSet.add(name);
    setSelectedFiles(newSet);
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getFileIcon = (item: FileItem) => {
    if (item.isDirectory) {
      return <Folder className="shrink-0" size={20} style={{ color: '#c084fc', fill: 'rgba(168,85,247,.15)' }} />;
    }
    const ext = item.name.split(".").pop()?.toLowerCase() || "";
    if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) {
      return <FileArchive className="shrink-0" size={20} style={{ color: '#a855f7' }} />;
    }
    if (["json", "yml", "yaml", "properties", "conf", "toml", "xml", "js", "ts", "py", "sh"].includes(ext)) {
      return <FileCode className="shrink-0" size={20} style={{ color: '#c084fc' }} />;
    }
    if (["txt", "log", "md"].includes(ext)) {
      return <FileText className="shrink-0" size={20} style={{ color: '#e9d5ff' }} />;
    }
    return <File className="shrink-0" size={20} style={{ color: '#a1a1aa' }} />;
  };

  const pathSegments = path.split("/").filter(Boolean);

  // ============================================
  // Drag & Drop Upload Handlers
  // ============================================

  const openUploadModal = () => {
    setUploadQueue([]);
    setIsUploading(false);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    if (isUploading) return;
    setShowUploadModal(false);
    setUploadQueue([]);
    setIsUploading(false);
    setIsDragging(false);
    dragCounter.current = 0;
  };

  const addFilesToQueue = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const newItems: QueueItem[] = arr.map(f => ({
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file: f,
      status: 'pending',
    }));
    setUploadQueue(prev => [...prev, ...newItems]);
  };

  const removeFromQueue = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'done'));
  };

  const startQueueUpload = async () => {
    const pending = uploadQueue.filter(item => item.status === 'pending');
    if (pending.length === 0) return;

    setIsUploading(true);

    const uploadFn = startUpload as any;
    const uploadedFilenames: string[] = [];

    for (const item of pending) {
      setUploadQueue(prev => prev.map(q =>
        q.id === item.id ? { ...q, status: 'uploading' } : q
      ));

      try {
        uploadFn(item.file, serverId, path);
        uploadedFilenames.push(item.file.name);
        await new Promise(res => setTimeout(res, 350));
        setUploadQueue(prev => prev.map(q =>
          q.id === item.id ? { ...q, status: 'done' } : q
        ));
      } catch (err: any) {
        setUploadQueue(prev => prev.map(q =>
          q.id === item.id ? { ...q, status: 'error', error: err?.message || 'Failed' } : q
        ));
      }
    }

    await waitForFilesToAppear(uploadedFilenames, 20);
    setIsUploading(false);
    showToast(`Uploaded ${pending.length} file(s) to ${path}`, "success");
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files);
    }
  };

  const handleBrowseFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(e.target.files);
    }
    e.target.value = "";
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const pendingCount = uploadQueue.filter(f => f.status === 'pending').length;
  const uploadingCount = uploadQueue.filter(f => f.status === 'uploading').length;
  const doneCount = uploadQueue.filter(f => f.status === 'done').length;
  const errorCount = uploadQueue.filter(f => f.status === 'error').length;

  const canPaste = clipboard !== null && clipboard.paths.length > 0 && clipboard.sourceDir !== path;

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative min-h-0 h-full w-full bg-transparent p-3 sm:p-5">
      <style dangerouslySetInnerHTML={{__html: `
        .aw-fm-glass {
          background: linear-gradient(135deg, rgba(20,12,35,.7) 0%, rgba(13,8,25,.85) 100%);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
          border: 1px solid rgba(168,85,247,.2);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }
        .aw-fm-glass::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,.5), rgba(255,255,255,.2), rgba(168,85,247,.5), transparent);
          pointer-events: none;
          z-index: 2;
        }
        .aw-fm-row {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-fm-btn {
          transition: all .25s cubic-bezier(.16,1,.3,1);
        }
        .aw-fm-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .aw-fm-btn:active:not(:disabled) {
          transform: translateY(0) scale(.97);
        }
        .aw-fm-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .aw-fm-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,.3); }
        .aw-fm-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 4px;
        }
        .aw-fm-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #c084fc, #a855f7);
        }
        .aw-fm-input::placeholder { color: rgba(161,161,170,.5); }
        .aw-fm-input:focus { outline: none; }

        @keyframes awDropPulse {
          0%, 100% { transform: scale(1); opacity: .5; }
          50% { transform: scale(1.05); opacity: .8; }
        }
        .aw-drop-pulse { animation: awDropPulse 2s ease-in-out infinite; }

        @keyframes awDropBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .aw-drop-bounce { animation: awDropBounce 1.6s ease-in-out infinite; }

        @keyframes awFmRefresh {
          0% { opacity: 1; }
          50% { opacity: .6; }
          100% { opacity: 1; }
        }
        .aw-fm-refreshing { animation: awFmRefresh .6s ease-in-out; }

        @keyframes awBarShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .aw-bar-shine {
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent);
          animation: awBarShine 1.5s ease-in-out infinite;
        }

        @keyframes awClipboardPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168,85,247,.4); }
          50% { box-shadow: 0 0 0 6px rgba(168,85,247,0); }
        }
        .aw-clipboard-pulse { animation: awClipboardPulse 2s ease-in-out infinite; }
      `}} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: .95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: .95 }}
            className="fixed top-4 right-4 z-[80] flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold"
            style={
              toast.type === "success"
                ? {
                    background: 'linear-gradient(135deg, rgba(16,185,129,.95), rgba(16,185,129,.85))',
                    border: '1px solid rgba(16,185,129,.6)',
                    color: '#ecfdf5',
                    boxShadow: '0 12px 32px -8px rgba(16,185,129,.6)',
                    backdropFilter: 'blur(16px)',
                  }
                : {
                    background: 'linear-gradient(135deg, rgba(244,63,94,.95), rgba(244,63,94,.85))',
                    border: '1px solid rgba(244,63,94,.6)',
                    color: '#fff1f2',
                    boxShadow: '0 12px 32px -8px rgba(244,63,94,.6)',
                    backdropFilter: 'blur(16px)',
                  }
            }
          >
            {toast.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CLIPBOARD INDICATOR */}
      <AnimatePresence>
        {clipboard && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 p-3 rounded-xl flex items-center justify-between gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,.15), rgba(168,85,247,.05))',
              border: '1px solid rgba(168,85,247,.4)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 aw-clipboard-pulse"
                style={{
                  background: 'rgba(168,85,247,.15)',
                  border: '1px solid rgba(168,85,247,.4)',
                }}
              >
                <Copy size={16} style={{ color: '#c084fc' }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold flex items-center gap-2" style={{ color: '#c084fc' }}>
                  Copied {clipboard.paths.length} item(s)
                </p>
                <p className="text-[11px] font-mono truncate" style={{ color: 'rgba(161,161,170,.75)' }}>
                  From: <span style={{ color: '#c084fc' }}>{clipboard.sourceDir}</span>
                  {' • '}
                  {clipboard.names.slice(0, 2).join(', ')}
                  {clipboard.names.length > 2 && ` +${clipboard.names.length - 2} more`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePaste}
                disabled={!canPaste || isPasting}
                className="aw-fm-btn px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                  boxShadow: '0 4px 12px -4px rgba(168,85,247,.6)',
                }}
                title={clipboard.sourceDir === path ? "Cannot paste in same folder" : "Paste here"}
              >
                {isPasting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ClipboardPaste size={12} />
                )}
                {isPasting ? "Pasting..." : "Paste Here"}
              </button>
              <button
                onClick={handleClearClipboard}
                className="aw-fm-btn p-1.5 rounded-lg"
                style={{
                  background: 'rgba(0,0,0,.4)',
                  border: '1px solid rgba(168,85,247,.2)',
                  color: '#a1a1aa',
                }}
                title="Clear clipboard"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="p-4 md:p-5 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between aw-fm-glass shrink-0 gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto aw-fm-scroll py-1">
          <button
            onClick={goUp}
            disabled={path === "/" && !editingFile}
            className="p-2 rounded-xl aw-fm-btn shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(0,0,0,.4)',
              border: '1px solid rgba(168,85,247,.25)',
              color: '#c084fc',
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div
            className="flex items-center space-x-1 font-mono text-xs font-semibold px-3 py-2 rounded-xl"
            style={{
              background: 'rgba(0,0,0,.5)',
              border: '1px solid rgba(168,85,247,.2)',
            }}
          >
            <button
              onClick={() => navigateToSegment(-1)}
              className="flex items-center gap-1"
              style={{ color: '#c084fc' }}
            >
              <Home size={11} />
              Root
            </button>
            {pathSegments.map((seg, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={14} className="shrink-0" style={{ color: 'rgba(168,85,247,.4)' }} />
                <button
                  onClick={() => navigateToSegment(i)}
                  className="max-w-[120px] truncate"
                  style={{
                    color: i === pathSegments.length - 1 ? '#e9d5ff' : 'rgba(192,132,252,.8)',
                    fontWeight: i === pathSegments.length - 1 ? 700 : 500,
                  }}
                >
                  {seg}
                </button>
              </React.Fragment>
            ))}
            {editingFile && (
              <>
                <ChevronRight size={14} className="shrink-0" style={{ color: 'rgba(168,85,247,.4)' }} />
                <span className="font-bold max-w-[140px] truncate flex items-center gap-1.5" style={{ color: '#c084fc' }}>
                  <Sparkles size={11} />
                  {editingFile}
                </span>
              </>
            )}
          </div>
        </div>

        {!editingFile && (
          <div className="flex-1 w-full max-w-xs sm:max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: '#c084fc' }} />
              <input
                type="text"
                placeholder="Search files & folders..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="aw-fm-input w-full rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-100"
                style={{
                  background: 'rgba(0,0,0,.4)',
                  border: '1px solid rgba(168,85,247,.25)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 aw-fm-btn"
                  style={{ color: '#a1a1aa' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 shrink-0 justify-end">
          {!editingFile ? (
            <>
              <button
                onClick={() => { setModalInput(""); setActiveModal("create_file"); }}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold aw-fm-btn"
                style={{
                  background: 'rgba(0,0,0,.4)',
                  border: '1px solid rgba(168,85,247,.25)',
                  color: '#e9d5ff',
                }}
              >
                <FilePlus size={15} style={{ color: '#c084fc' }} />
                <span className="hidden md:inline">File</span>
              </button>
              <button
                onClick={() => { setModalInput(""); setActiveModal("create_folder"); }}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold aw-fm-btn"
                style={{
                  background: 'rgba(0,0,0,.4)',
                  border: '1px solid rgba(168,85,247,.25)',
                  color: '#e9d5ff',
                }}
              >
                <FolderPlus size={15} style={{ color: '#c084fc' }} />
                <span className="hidden md:inline">Folder</span>
              </button>
              <button
                onClick={openUploadModal}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white aw-fm-btn"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                  boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                }}
              >
                <UploadCloud size={15} />
                <span>Upload</span>
              </button>
              <button
                onClick={() => fetchFiles()}
                className="p-2 rounded-xl aw-fm-btn"
                style={{
                  background: 'rgba(0,0,0,.4)',
                  border: '1px solid rgba(168,85,247,.25)',
                  color: '#c084fc',
                }}
              >
                <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
              </button>
            </>
          ) : (
            <button
              disabled={isSaving}
              onClick={saveFile}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white aw-fm-btn disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
              }}
            >
              {isSaving ? <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,.5)', borderTopColor: '#fff' }} /> : <Save size={16} />}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main File List */}
      <div
        className={`flex-1 overflow-y-auto p-2 sm:p-4 aw-fm-scroll flex flex-col min-h-0 relative rounded-2xl ${isLoading ? 'aw-fm-refreshing' : ''}`}
        style={{
          background: 'rgba(0,0,0,.35)',
          border: '1px solid rgba(168,85,247,.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <AnimatePresence mode="wait">
          {editingFile ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="aw-fm-scroll flex-1 w-full h-full rounded-xl p-4 font-mono text-xs sm:text-sm resize-none min-h-0 leading-relaxed"
                style={{
                  background: 'rgba(0,0,0,.5)',
                  border: '1px solid rgba(168,85,247,.2)',
                  color: '#e9d5ff',
                  caretColor: '#c084fc',
                }}
                spellCheck={false}
              />
            </motion.div>
          ) : (
            <motion.div
              key="filelist"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1"
            >
              {filteredFiles.length > 0 && (
                <div
                  className="flex items-center px-4 py-2.5 mb-2 text-[10px] font-semibold uppercase tracking-widest"
                  style={{
                    borderBottom: '1px solid rgba(168,85,247,.15)',
                    color: '#a1a1aa',
                  }}
                >
                  <button onClick={toggleSelectAll} className="mr-3 aw-fm-btn">
                    {selectedFiles.size === filteredFiles.length ? (
                      <CheckSquare size={18} style={{ color: '#c084fc' }} />
                    ) : (
                      <Square size={18} style={{ color: '#a1a1aa' }} />
                    )}
                  </button>
                  <span className="flex-1">Name</span>
                  <span className="w-24 text-right hidden sm:block">Size</span>
                  <span className="w-32 text-right pr-2">Actions</span>
                </div>
              )}

              {filteredFiles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'rgba(168,85,247,.08)',
                      border: '1px solid rgba(168,85,247,.2)',
                    }}
                  >
                    <Folder className="w-8 h-8" style={{ color: 'rgba(192,132,252,.5)' }} />
                  </div>
                  <p className="text-sm" style={{ color: '#a1a1aa' }}>
                    This directory is empty or no items match your filter.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={openUploadModal}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white aw-fm-btn"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                        boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                      }}
                    >
                      <UploadCloud size={14} />
                      Upload Files
                    </button>
                    {canPaste && (
                      <button
                        onClick={handlePaste}
                        disabled={isPasting}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold aw-fm-btn disabled:opacity-50"
                        style={{
                          background: 'rgba(168,85,247,.15)',
                          border: '1px solid rgba(168,85,247,.4)',
                          color: '#c084fc',
                        }}
                      >
                        {isPasting ? <Loader2 size={14} className="animate-spin" /> : <ClipboardPaste size={14} />}
                        Paste Here
                      </button>
                    )}
                  </div>
                </div>
              )}

              {filteredFiles.map(f => {
                const isSelected = selectedFiles.has(f.name);
                const isMenuOpen = openMenuRow === f.name;
                const isCopySource = clipboard && clipboard.names.includes(f.name) && clipboard.sourceDir === path;

                return (
                  <div
                    key={f.name}
                    onClick={(e) => toggleSelectFile(f.name, e)}
                    className="aw-fm-row flex items-center justify-between p-3 rounded-xl group cursor-pointer mb-1"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(168,85,247,.15), rgba(168,85,247,.06))'
                        : 'rgba(255,255,255,.02)',
                      border: isSelected
                        ? '1px solid rgba(168,85,247,.5)'
                        : '1px solid transparent',
                    }}
                  >
                    <div className="flex items-center space-x-3 flex-1 overflow-hidden">
                      <button
                        onClick={(e) => toggleSelectFile(f.name, e)}
                        className="shrink-0 aw-fm-btn"
                      >
                        {isSelected ? (
                          <CheckSquare size={18} style={{ color: '#c084fc' }} />
                        ) : (
                          <Square size={18} style={{ color: 'rgba(161,161,170,.6)' }} />
                        )}
                      </button>

                      <div
                        className="flex items-center space-x-3 flex-1 overflow-hidden"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (f.isDirectory) traverse(f.name);
                          else openFile(f.name);
                        }}
                      >
                        {getFileIcon(f)}
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm truncate flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                            {f.name}
                            {isCopySource && (
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
                                style={{
                                  background: 'rgba(168,85,247,.2)',
                                  border: '1px solid rgba(168,85,247,.4)',
                                  color: '#c084fc',
                                }}
                              >
                                Copied
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 pl-2">
                      <span className="hidden sm:block text-xs font-mono w-20 text-right" style={{ color: 'rgba(161,161,170,.7)' }}>
                        {f.isDirectory ? "Folder" : `${(f.size / 1024).toFixed(1)} KB`}
                      </span>

                      <div className="flex items-center space-x-1">
                        {/\.(zip|tar|gz|tgz|rar|7z|jar)$/i.test(f.name) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUnzipItem(f.name); }}
                            className="p-1.5 rounded-lg aw-fm-btn hidden sm:flex items-center"
                            style={{ color: 'rgba(161,161,170,.7)' }}
                          >
                            <FolderDown size={15} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(f.name, f.isDirectory); }}
                          className="p-1.5 rounded-lg aw-fm-btn hidden sm:flex items-center"
                          style={{ color: 'rgba(161,161,170,.7)' }}
                        >
                          <Download size={15} />
                        </button>

                        <div className="relative" ref={isMenuOpen ? menuRef : null}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuRow(isMenuOpen ? null : f.name); }}
                            className="p-1.5 rounded-lg aw-fm-btn"
                            style={{ color: 'rgba(161,161,170,.7)' }}
                          >
                            <MoreVertical size={15} />
                          </button>

                          {isMenuOpen && (
                            <div
                              className="absolute right-0 top-full mt-1 w-52 rounded-xl z-30 py-1.5"
                              style={{
                                background: 'linear-gradient(135deg, rgba(20,12,35,.98), rgba(13,8,25,.98))',
                                border: '1px solid rgba(168,85,247,.35)',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 20px 48px -12px rgba(0,0,0,.8), 0 0 24px -8px rgba(168,85,247,.4)',
                              }}
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDownload(f.name, f.isDirectory); }}
                                className="aw-fm-btn w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2.5"
                                style={{ color: '#e9d5ff' }}
                              >
                                <Download size={14} style={{ color: '#c084fc' }} />
                                <span>Download {f.isDirectory ? "(as .zip)" : ""}</span>
                              </button>

                              <button
                                onClick={(e) => { e.stopPropagation(); openRenameModal(f); }}
                                className="aw-fm-btn w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2.5"
                                style={{ color: '#e9d5ff' }}
                              >
                                <Edit2 size={14} style={{ color: '#c084fc' }} />
                                <span>Rename</span>
                              </button>

                              <button
                                onClick={(e) => { e.stopPropagation(); openZipModal(f); }}
                                className="aw-fm-btn w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2.5"
                                style={{ color: '#e9d5ff' }}
                              >
                                <Archive size={14} style={{ color: '#c084fc' }} />
                                <span>Compress to .ZIP</span>
                              </button>

                              {/\.(zip|tar|gz|tgz|rar|7z|jar)$/i.test(f.name) && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleUnzipItem(f.name); }}
                                  className="aw-fm-btn w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2.5"
                                  style={{ color: '#fbbf24' }}
                                >
                                  <FolderDown size={14} style={{ color: '#fbbf24' }} />
                                  <span>Extract Archive</span>
                                </button>
                              )}

                              <div className="my-1" style={{ borderTop: '1px solid rgba(168,85,247,.15)' }} />

                              <button
                                onClick={(e) => { e.stopPropagation(); openDeleteModal(f); }}
                                className="aw-fm-btn w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2.5"
                                style={{ color: '#fda4af' }}
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FLOATING SELECTION BAR */}
        <AnimatePresence>
          {selectedFiles.size > 0 && !editingFile && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-2xl p-2 px-3 flex items-center space-x-2 z-30 max-w-[calc(100%-2rem)] overflow-x-auto aw-fm-scroll"
              style={{
                background: 'linear-gradient(135deg, rgba(20,12,35,.98), rgba(13,8,25,.98))',
                border: '1px solid rgba(168,85,247,.4)',
                backdropFilter: 'blur(20px) saturate(1.4)',
                boxShadow: '0 20px 48px -12px rgba(0,0,0,.9), 0 0 0 1px rgba(168,85,247,.15), 0 0 32px -8px rgba(168,85,247,.5)',
              }}
            >
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shrink-0"
                style={{
                  background: 'rgba(168,85,247,.15)',
                  border: '1px solid rgba(168,85,247,.4)',
                  color: '#c084fc',
                }}
              >
                <Hexagon size={10} />
                {selectedFiles.size}
              </span>

              <div className="h-5 w-px shrink-0" style={{ background: 'rgba(168,85,247,.3)' }} />

              {/* COPY */}
              <button
                onClick={handleCopySelected}
                className="aw-fm-btn p-2 rounded-xl flex items-center gap-1.5 text-xs font-medium shrink-0"
                style={{ color: '#e9d5ff' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#c084fc'; e.currentTarget.style.background = 'rgba(168,85,247,.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#e9d5ff'; e.currentTarget.style.background = 'transparent'; }}
                title="Copy selected"
              >
                <Copy size={15} />
                <span className="hidden md:inline">Copy</span>
              </button>

              <div className="h-5 w-px shrink-0" style={{ background: 'rgba(168,85,247,.3)' }} />

              {/* DOWNLOAD */}
              <button
                onClick={handleDownloadSelected}
                className="aw-fm-btn p-2 rounded-xl flex items-center gap-1.5 text-xs font-medium shrink-0"
                style={{ color: '#e9d5ff' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#c084fc'; e.currentTarget.style.background = 'rgba(168,85,247,.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#e9d5ff'; e.currentTarget.style.background = 'transparent'; }}
                title="Download selected"
              >
                <Download size={15} />
                <span className="hidden md:inline">Download</span>
              </button>

              {/* RENAME (1 item only) */}
              {selectedFiles.size === 1 && (
                <button
                  onClick={() => {
                    const name = Array.from(selectedFiles)[0];
                    const item = files.find(f => f.name === name);
                    if (item) openRenameModal(item);
                  }}
                  className="aw-fm-btn p-2 rounded-xl flex items-center gap-1.5 text-xs font-medium shrink-0"
                  style={{ color: '#e9d5ff' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#c084fc'; e.currentTarget.style.background = 'rgba(168,85,247,.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#e9d5ff'; e.currentTarget.style.background = 'transparent'; }}
                  title="Rename"
                >
                  <Edit2 size={15} />
                  <span className="hidden md:inline">Rename</span>
                </button>
              )}

              {/* ZIP */}
              <button
                onClick={() => openZipModal()}
                disabled={isZipping}
                className="aw-fm-btn p-2 rounded-xl flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 shrink-0"
                style={{ color: '#e9d5ff' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#c084fc'; e.currentTarget.style.background = 'rgba(168,85,247,.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#e9d5ff'; e.currentTarget.style.background = 'transparent'; }}
                title="Compress selected into ZIP"
              >
                {isZipping ? (
                  <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(192,132,252,.5)', borderTopColor: '#c084fc' }} />
                ) : (
                  <Archive size={15} />
                )}
                <span className="hidden md:inline">Zip</span>
              </button>

              {/* EXTRACT (1 archive only) */}
              {selectedFiles.size === 1 && /\.(zip|tar|gz|tgz|rar|7z|jar)$/i.test(Array.from(selectedFiles)[0] as string) && (
                <button
                  onClick={() => handleUnzipItem(Array.from(selectedFiles)[0] as string)}
                  disabled={isUnzipping}
                  className="aw-fm-btn p-2 rounded-xl flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 shrink-0"
                  style={{ color: '#e9d5ff' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#fbbf24'; e.currentTarget.style.background = 'rgba(245,158,11,.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#e9d5ff'; e.currentTarget.style.background = 'transparent'; }}
                  title="Extract archive"
                >
                  {isUnzipping ? (
                    <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(251,191,36,.5)', borderTopColor: '#fbbf24' }} />
                  ) : (
                    <PackageOpen size={15} />
                  )}
                  <span className="hidden md:inline">Extract</span>
                </button>
              )}

              {/* PASTE (if clipboard has items) */}
              {clipboard && (
                <button
                  onClick={handlePaste}
                  disabled={!canPaste || isPasting}
                  className="aw-fm-btn p-2 rounded-xl flex items-center gap-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  style={{ color: '#c084fc' }}
                  onMouseEnter={(e) => {
                    if (!canPaste) return;
                    e.currentTarget.style.background = 'rgba(168,85,247,.15)';
                  }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  title={clipboard.sourceDir === path ? "Cannot paste in same folder" : "Paste here"}
                >
                  {isPasting ? (
                    <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(192,132,252,.5)', borderTopColor: '#c084fc' }} />
                  ) : (
                    <ClipboardPaste size={15} />
                  )}
                  <span className="hidden md:inline">Paste</span>
                </button>
              )}

              <div className="h-5 w-px shrink-0" style={{ background: 'rgba(168,85,247,.3)' }} />

              {/* DELETE */}
              <button
                onClick={() => openDeleteModal()}
                disabled={isDeleting}
                className="aw-fm-btn p-2 rounded-xl flex items-center gap-1.5 text-xs font-medium disabled:opacity-50 shrink-0"
                style={{ color: '#fda4af' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                title="Delete selected"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(244,63,94,.5)', borderTopColor: '#fda4af' }} />
                ) : (
                  <Trash2 size={15} />
                )}
                <span className="hidden md:inline">Delete</span>
              </button>

              <div className="h-5 w-px shrink-0" style={{ background: 'rgba(168,85,247,.3)' }} />

              {/* CLOSE */}
              <button
                onClick={() => setSelectedFiles(new Set())}
                className="aw-fm-btn p-2 rounded-xl shrink-0"
                style={{ color: '#a1a1aa' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#c084fc'; e.currentTarget.style.background = 'rgba(168,85,247,.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'transparent'; }}
                title="Clear selection"
              >
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{
              background: 'rgba(0,0,0,.8)',
              backdropFilter: 'blur(14px)',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) closeUploadModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
              className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
              style={{
                background: 'linear-gradient(135deg, rgba(20,12,35,.96), rgba(13,8,25,.98))',
                border: '1px solid rgba(168,85,247,.35)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 30px 80px -20px rgba(0,0,0,.9), 0 0 40px -12px rgba(168,85,247,.4)',
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none z-20"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(168,85,247,.7), rgba(255,255,255,.3), rgba(168,85,247,.7), transparent)',
                }}
              />

              <div
                className="flex items-center justify-between p-5 shrink-0"
                style={{
                  borderBottom: '1px solid rgba(168,85,247,.18)',
                  background: 'rgba(0,0,0,.3)',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: 'rgba(168,85,247,.12)',
                      border: '1px solid rgba(168,85,247,.3)',
                      boxShadow: '0 0 20px -6px rgba(168,85,247,.6)',
                    }}
                  >
                    <UploadCloud className="w-5 h-5" style={{ color: '#c084fc' }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                      Upload Files
                      <span
                        className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono uppercase tracking-widest"
                        style={{
                          background: 'rgba(168,85,247,.1)',
                          border: '1px solid rgba(168,85,247,.3)',
                          color: '#c084fc',
                        }}
                      >
                        <Hexagon size={9} />
                        ASTROWAX
                      </span>
                    </h3>
                    <p className="text-[11px] font-mono truncate" style={{ color: 'rgba(161,161,170,.7)' }}>
                      Target: <span style={{ color: '#c084fc' }}>{path}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeUploadModal}
                  disabled={isUploading}
                  className="aw-fm-btn p-2 rounded-lg disabled:opacity-40"
                  style={{
                    background: 'rgba(168,85,247,.08)',
                    border: '1px solid rgba(168,85,247,.2)',
                    color: '#a1a1aa',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5">
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('aw-fm-file-input')?.click()}
                  className="relative rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden"
                  style={{
                    background: isDragging
                      ? 'linear-gradient(135deg, rgba(168,85,247,.2), rgba(168,85,247,.08))'
                      : 'rgba(0,0,0,.35)',
                    border: isDragging
                      ? '2px dashed rgba(168,85,247,.8)'
                      : '2px dashed rgba(168,85,247,.3)',
                    boxShadow: isDragging
                      ? '0 0 40px -8px rgba(168,85,247,.6)'
                      : 'none',
                  }}
                >
                  {isDragging && (
                    <div
                      className="absolute inset-0 aw-drop-pulse pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(168,85,247,.15), transparent 70%)',
                      }}
                    />
                  )}

                  <div
                    className={`relative w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDragging ? 'aw-drop-bounce' : ''}`}
                    style={{
                      background: isDragging
                        ? 'linear-gradient(135deg, #a855f7, #7e22ce)'
                        : 'rgba(168,85,247,.12)',
                      border: '1px solid rgba(168,85,247,.4)',
                      boxShadow: isDragging
                        ? '0 0 32px -4px rgba(168,85,247,.9)'
                        : '0 0 20px -6px rgba(168,85,247,.5)',
                    }}
                  >
                    <UploadCloud className="w-8 h-8" style={{ color: isDragging ? '#fff' : '#c084fc' }} />
                  </div>

                  <h4
                    className="text-lg font-bold mb-1"
                    style={{ color: isDragging ? '#e9d5ff' : '#d4d4d8' }}
                  >
                    {isDragging ? "Drop files here!" : "Drag & drop files"}
                  </h4>
                  <p className="text-sm mb-1" style={{ color: 'rgba(161,161,170,.8)' }}>
                    {isDragging ? "Release to add to upload queue" : "or click to browse from your device"}
                  </p>
                  <p className="text-[11px] font-mono" style={{ color: 'rgba(168,85,247,.5)' }}>
                    Multiple files supported
                  </p>

                  <input
                    id="aw-fm-file-input"
                    type="file"
                    multiple
                    onChange={handleBrowseFiles}
                    className="hidden"
                  />
                </div>
              </div>

              {uploadQueue.length > 0 && (
                <div
                  className="flex-1 overflow-y-auto aw-fm-scroll px-5 pb-2"
                  style={{ maxHeight: '320px' }}
                >
                  <div
                    className="flex items-center justify-between mb-3 p-2.5 rounded-xl text-[11px] font-mono"
                    style={{
                      background: 'rgba(0,0,0,.35)',
                      border: '1px solid rgba(168,85,247,.15)',
                    }}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      {pendingCount > 0 && <span style={{ color: '#c084fc' }}>⏳ {pendingCount} pending</span>}
                      {uploadingCount > 0 && <span style={{ color: '#c084fc' }}>⬆ {uploadingCount} uploading</span>}
                      {doneCount > 0 && <span style={{ color: '#34d399' }}>✓ {doneCount} done</span>}
                      {errorCount > 0 && <span style={{ color: '#fda4af' }}>✕ {errorCount} failed</span>}
                    </div>
                    {doneCount > 0 && !isUploading && (
                      <button
                        onClick={clearCompleted}
                        className="aw-fm-btn text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{
                          background: 'rgba(168,85,247,.12)',
                          border: '1px solid rgba(168,85,247,.3)',
                          color: '#c084fc',
                        }}
                      >
                        Clear done
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {uploadQueue.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-xl overflow-hidden relative"
                        style={{
                          background:
                            item.status === 'done'
                              ? 'linear-gradient(135deg, rgba(16,185,129,.12), rgba(16,185,129,.03))'
                              : item.status === 'error'
                              ? 'linear-gradient(135deg, rgba(244,63,94,.12), rgba(244,63,94,.03))'
                              : item.status === 'uploading'
                              ? 'linear-gradient(135deg, rgba(168,85,247,.15), rgba(168,85,247,.05))'
                              : 'rgba(0,0,0,.35)',
                          border:
                            item.status === 'done'
                              ? '1px solid rgba(16,185,129,.3)'
                              : item.status === 'error'
                              ? '1px solid rgba(244,63,94,.3)'
                              : item.status === 'uploading'
                              ? '1px solid rgba(168,85,247,.45)'
                              : '1px solid rgba(168,85,247,.15)',
                        }}
                      >
                        {item.status === 'uploading' && (
                          <div
                            className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden"
                            style={{ background: 'rgba(168,85,247,.15)' }}
                          >
                            <div className="aw-bar-shine" />
                          </div>
                        )}

                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: 'rgba(0,0,0,.4)',
                            border: '1px solid rgba(168,85,247,.2)',
                          }}
                        >
                          {item.status === 'done' ? (
                            <Check size={16} style={{ color: '#34d399' }} />
                          ) : item.status === 'error' ? (
                            <XCircle size={16} style={{ color: '#fda4af' }} />
                          ) : item.status === 'uploading' ? (
                            <Loader2 size={16} className="animate-spin" style={{ color: '#c084fc' }} />
                          ) : (
                            <File size={16} style={{ color: '#c084fc' }} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate font-mono" style={{ color: '#e9d5ff' }}>
                            {item.file.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] mt-0.5">
                            <span style={{ color: 'rgba(161,161,170,.7)' }}>
                              {formatBytes(item.file.size)}
                            </span>
                            <span style={{ color: 'rgba(168,85,247,.4)' }}>•</span>
                            <span
                              style={{
                                color:
                                  item.status === 'done'
                                    ? '#34d399'
                                    : item.status === 'error'
                                    ? '#fda4af'
                                    : item.status === 'uploading'
                                    ? '#c084fc'
                                    : 'rgba(161,161,170,.7)',
                              }}
                            >
                              {item.status === 'done'
                                ? 'Uploaded'
                                : item.status === 'error'
                                ? item.error || 'Failed'
                                : item.status === 'uploading'
                                ? 'Uploading...'
                                : 'Ready'}
                            </span>
                          </div>
                        </div>

                        {item.status !== 'uploading' && (
                          <button
                            onClick={() => removeFromQueue(item.id)}
                            className="aw-fm-btn p-1.5 rounded-lg shrink-0"
                            style={{
                              background: 'rgba(244,63,94,.1)',
                              border: '1px solid rgba(244,63,94,.25)',
                              color: '#fda4af',
                            }}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
                style={{
                  borderTop: '1px solid rgba(168,85,247,.15)',
                  background: 'rgba(0,0,0,.35)',
                }}
              >
                <span className="text-[11px] font-mono" style={{ color: 'rgba(161,161,170,.7)' }}>
                  {uploadQueue.length === 0
                    ? "Add files to begin"
                    : isUploading
                    ? `Uploading ${uploadingCount} file(s)...`
                    : `${uploadQueue.length} file(s) in queue`}
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={closeUploadModal}
                    disabled={isUploading}
                    className="aw-fm-btn flex-1 sm:flex-none px-4 py-2 rounded-xl font-semibold text-xs disabled:opacity-40"
                    style={{
                      background: 'rgba(0,0,0,.4)',
                      border: '1px solid rgba(168,85,247,.25)',
                      color: '#a1a1aa',
                    }}
                  >
                    {isUploading ? "Uploading..." : "Close"}
                  </button>
                  <button
                    onClick={startQueueUpload}
                    disabled={pendingCount === 0 || isUploading}
                    className="aw-fm-btn flex-1 sm:flex-none px-5 py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 text-white disabled:opacity-40"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                      boxShadow: '0 4px 16px -4px rgba(168,85,247,.6)',
                    }}
                  >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                    {isUploading
                      ? "Uploading..."
                      : pendingCount > 0
                      ? `Upload ${pendingCount} File${pendingCount !== 1 ? "s" : ""}`
                      : "Upload"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <AnimatePresence>
        {activeModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0,0,0,.75)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
              className="w-full max-w-md rounded-2xl p-6 space-y-4 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(20,12,35,.96), rgba(13,8,25,.98))',
                border: '1px solid rgba(168,85,247,.35)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 30px 80px -20px rgba(0,0,0,.9), 0 0 40px -12px rgba(168,85,247,.4)',
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px pointer-events-none rounded-t-2xl"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(168,85,247,.6), rgba(255,255,255,.25), rgba(168,85,247,.6), transparent)',
                }}
              />

              <div
                className="flex items-center justify-between pb-3"
                style={{ borderBottom: '1px solid rgba(168,85,247,.15)' }}
              >
                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                  {activeModal === "create_file" && <><FilePlus size={18} style={{ color: '#c084fc' }} /> Create New File</>}
                  {activeModal === "create_folder" && <><FolderPlus size={18} style={{ color: '#c084fc' }} /> Create New Folder</>}
                  {activeModal === "rename" && <><Edit2 size={18} style={{ color: '#c084fc' }} /> Rename {targetItem?.isDirectory ? "Folder" : "File"}</>}
                  {activeModal === "delete" && <><Trash2 size={18} style={{ color: '#fda4af' }} /> Confirm Deletion</>}
                  {activeModal === "zip" && <><Archive size={18} style={{ color: '#c084fc' }} /> Compress Selected Items</>}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="aw-fm-btn p-1.5 rounded-lg"
                  style={{
                    background: 'rgba(168,85,247,.08)',
                    border: '1px solid rgba(168,85,247,.2)',
                    color: '#a1a1aa',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                {(activeModal === "create_file" || activeModal === "create_folder" || activeModal === "rename" || activeModal === "zip") && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#c084fc' }}>
                      {activeModal === "create_file" && "File Name"}
                      {activeModal === "create_folder" && "Folder Name"}
                      {activeModal === "rename" && "New Name"}
                      {activeModal === "zip" && "Archive Name (.zip)"}
                    </label>
                    <input
                      autoFocus
                      type="text"
                      placeholder={
                        activeModal === "create_file" ? "e.g. server.properties" :
                        activeModal === "create_folder" ? "e.g. plugins" :
                        activeModal === "zip" ? "archive.zip" : ""
                      }
                      value={modalInput}
                      onChange={(e) => setModalInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (activeModal === "create_file") submitCreateFile();
                          else if (activeModal === "create_folder") submitCreateFolder();
                          else if (activeModal === "rename") submitRename();
                          else if (activeModal === "zip") submitZip();
                        }
                      }}
                      className="aw-fm-input w-full rounded-xl px-3.5 py-2.5 text-sm"
                      style={{
                        background: 'rgba(0,0,0,.5)',
                        border: '1px solid rgba(168,85,247,.25)',
                        color: '#e9d5ff',
                        caretColor: '#c084fc',
                      }}
                    />
                  </div>
                )}

                {activeModal === "delete" && (
                  <p className="text-sm leading-relaxed" style={{ color: '#e9d5ff' }}>
                    Delete {targetItem ? (
                      <strong style={{ color: '#fda4af' }}>'{targetItem.name}'</strong>
                    ) : (
                      <strong style={{ color: '#fda4af' }}>{selectedFiles.size} item(s)</strong>
                    )}? This cannot be undone.
                  </p>
                )}
              </div>

              <div
                className="flex justify-end gap-2 pt-3"
                style={{ borderTop: '1px solid rgba(168,85,247,.15)' }}
              >
                <button
                  onClick={() => setActiveModal(null)}
                  className="aw-fm-btn px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: 'rgba(0,0,0,.4)',
                    border: '1px solid rgba(168,85,247,.2)',
                    color: '#a1a1aa',
                  }}
                >
                  Cancel
                </button>

                {activeModal === "create_file" && (
                  <button onClick={submitCreateFile} className="aw-fm-btn px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}>
                    Create File
                  </button>
                )}
                {activeModal === "create_folder" && (
                  <button onClick={submitCreateFolder} className="aw-fm-btn px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}>
                    Create Folder
                  </button>
                )}
                {activeModal === "rename" && (
                  <button onClick={submitRename} className="aw-fm-btn px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}>
                    Rename
                  </button>
                )}
                {activeModal === "zip" && (
                  <button onClick={submitZip} className="aw-fm-btn px-4 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}>
                    Compress
                  </button>
                )}
                {activeModal === "delete" && (
                  <button
                    onClick={submitDelete}
                    disabled={isDeleting}
                    className="aw-fm-btn px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(244,63,94,.9), rgba(190,18,60,.9))',
                      color: '#fff1f2',
                    }}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {(isUnzipping || isZipping || isSaving || isDeleting || isPasting) && <LoadingOverlay />}
    </div>
  );
}