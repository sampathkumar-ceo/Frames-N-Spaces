"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getSiteData,
  saveSiteData,
  getPasscode,
  setPasscode,
  isAdminAuthenticated,
  setAdminAuth,
  generateId,
  type SiteData,
  type Service,
  type Execution,
  type BlogPost,
  type HeroData,
  type AboutData,
  type WhatWeDoItem,
} from "@/data/siteData";
import styles from "./AdminPanel.module.css";

type Tab = "hero" | "about" | "whatWeDo" | "stats" | "services" | "executions" | "blogs" | "clientele" | "settings";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  id: string;
  uploadingId: string | null;
  handleFileUpload: (file: File, callback: (url: string) => void, id: string) => void;
  styles: any;
}

const ImageUploadField = ({ label, value, onChange, id, uploadingId, handleFileUpload, styles }: ImageUploadFieldProps) => (
  <div className={styles.editRow}>
    <label>{label}</label>
    <div className={styles.imageInputGroup}>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL or upload" />
      <label className={styles.uploadBtn}>
        {uploadingId === id ? "⏳" : "📤"}
        <input 
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file, onChange, id);
          }} 
        />
      </label>
    </div>
  </div>
);

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [data, setData] = useState<SiteData | null>(null); // DB state
  const [localData, setLocalData] = useState<SiteData | null>(null); // Working copy
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [passMsg, setPassMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [newPasscode, setNewPasscode] = useState("");


  const hasChanges = JSON.stringify(data) !== JSON.stringify(localData);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      const storedPass = getPasscode();
      fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: storedPass })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setAuthenticated(true);
          getSiteData().then(d => {
            setData(d);
            setLocalData(d);
          });
        } else {
          setAdminAuth(false);
          setAuthenticated(false);
          setError("Session expired or passcode changed. Please log in again.");
        }
      })
      .catch(() => {
        setAuthenticated(true);
        getSiteData().then(d => {
          setData(d);
          setLocalData(d);
        });
      });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput })
      });
      const result = await res.json();
      if (result.success) {
        setPasscode(passcodeInput);
        setAdminAuth(true);
        setAuthenticated(true);
        getSiteData().then(d => {
          setData(d);
          setLocalData(d);
        });
        setError("");
      } else {
        setError("Incorrect passcode. Please try again.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  const handleLogout = () => {
    setAdminAuth(false);
    setAuthenticated(false);
    setData(null);
    setLocalData(null);
  };

  const handleSaveChanges = async () => {
    if (!localData) return;
    setIsSaving(true);
    try {
      console.log("Attempting to save payload:", localData);
      const res = await saveSiteData(localData as SiteData);
      if (res.success) {
        setData(localData);
        // If the passcode was changed, update our stored passcode for future requests
        if (localData.adminPasscode) {
          setPasscode(localData.adminPasscode);
        }
        setLastSaved(new Date().toLocaleTimeString());
        setPassMsg("Changes saved to database at " + new Date().toLocaleTimeString());
        setTimeout(() => setPassMsg(""), 5000);
      } else {
        console.error("Save failed:", res.error);
        alert("Save Error: " + (res.error || "The server rejected the request."));
      }
    } catch (err) {
      alert("Network Error: Could not reach the save API.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUndoAll = () => {
    if (!data) return;
    if (window.confirm("Are you sure you want to discard all unsaved changes?")) {
      setLocalData(data);
    }
  };

  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleFileUpload = async (file: File, callback: (url: string) => void, id: string) => {
    setUploadingId(id);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("passcode", getPasscode());

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        callback(result.url);
      } else {
        alert("Upload failed: " + result.error);
      }
    } catch (err) {
      alert("Error uploading image");
    } finally {
      setUploadingId(null);
    }
  };

  const handlePasscodeChange = () => {
    if (newPasscode.length < 6) {
      setPassMsg("Passcode must be at least 6 characters.");
      return;
    }
    if (!localData) return;
    
    setLocalData({ ...localData, adminPasscode: newPasscode });
    setPassMsg("Passcode updated locally! Click 'Save All Changes' to apply permanently.");
    setNewPasscode("");
    setTimeout(() => setPassMsg(""), 5000);
  };

  const handleReset = async (section: keyof SiteData) => {
    if (!data) return;
    if (!window.confirm(`Are you sure you want to reset the ${section} section to its default values? This will overwrite your current changes.`)) return;

    let defaultVal;
    switch(section) {
      case 'hero': defaultVal = (await import('@/data/siteData')).defaultHero; break;
      case 'about': defaultVal = (await import('@/data/siteData')).defaultAbout; break;
      case 'services': defaultVal = (await import('@/data/siteData')).defaultServices; break;
      case 'stats': defaultVal = (await import('@/data/siteData')).defaultStats; break;
      case 'whatWeDo': defaultVal = (await import('@/data/siteData')).defaultWhatWeDo; break;
      case 'threatsToStrengths': defaultVal = (await import('@/data/siteData')).defaultThreatsToStrengths; break;
      case 'clientele': defaultVal = (await import('@/data/siteData')).defaultClientele; break;
      case 'executions': defaultVal = (await import('@/data/siteData')).defaultExecutions; break;
      case 'blogs': defaultVal = (await import('@/data/siteData')).defaultBlogs; break;
      case 'testimonials': defaultVal = (await import('@/data/siteData')).defaultTestimonials; break;
    }

    if (defaultVal) {
      const newData = { ...data, [section]: defaultVal };
      setLocalData(newData);
      setPassMsg(`${section} reset to defaults. Click Save to apply.`);
      setTimeout(() => setPassMsg(""), 3000);
    }
  };

  // ── Hero ──
  const updateHero = (updates: Partial<HeroData>) => {
    if (!localData) return;
    setLocalData({ ...localData, hero: { ...localData.hero, ...updates } });
  };

  const updateAbout = (updates: Partial<AboutData>) => {
    if (!localData) return;
    setLocalData({ ...localData, about: { ...localData.about, ...updates } });
  };

  // ── What We Do ──
  const addWhatWeDo = () => {
    if (!localData) return;
    const newItem: WhatWeDoItem = {
      id: generateId(),
      title: "New Methodology Point",
      description: "Description of this methodology point.",
      imageUrl: "/images/exec1.png",
    };
    setLocalData({ ...localData, whatWeDo: [...localData.whatWeDo, newItem] });
    setEditingItem(newItem.id);
  };

  const updateWhatWeDo = (id: string, updates: Partial<WhatWeDoItem>) => {
    if (!localData) return;
    setLocalData({ 
      ...localData, 
      whatWeDo: localData.whatWeDo.map((w: any) => (w.id === id ? { ...w, ...updates } : w)) 
    });
  };

  const deleteWhatWeDo = (id: string) => {
    if (!localData) return;
    setLocalData({ 
      ...localData, 
      whatWeDo: localData.whatWeDo.filter((w) => w.id !== id) 
    });
  };

  // ── Stats ──
  const updateStat = (id: string, updates: Partial<{ value: number; label: string; suffix: string }>) => {
    if (!localData) return;
    setLocalData({ 
      ...localData, 
      stats: localData.stats.map((s: any) => (s.id === id ? { ...s, ...updates } : s)) 
    });
  };

  // ── Service CRUD ──
  const addService = () => {
    if (!localData) return;
    const newSvc: Service = {
      id: generateId(),
      title: "New Service",
      subtitle: "Subtitle",
      description: "Service description here.",
      icon: "◈",
      features: ["Feature 1"],
      imageUrl: "/images/exec1.png",
    };
    setLocalData({ ...localData, services: [...localData.services, newSvc] });
    setEditingItem(newSvc.id);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    if (!localData) return;
    setLocalData({ 
      ...localData, 
      services: localData.services.map((s: any) => (s.id === id ? { ...s, ...updates } : s)) 
    });
  };

  const deleteService = (id: string) => {
    if (!localData) return;
    setLocalData({ 
      ...localData, 
      services: localData.services.filter((s) => s.id !== id) 
    });
  };

  // ── Execution CRUD ──
  const addExecution = () => {
    if (!localData) return;
    const newExec: Execution = {
      id: generateId(),
      title: "New Project",
      client: "Client Name",
      location: "City, India",
      category: "Corporate Office",
      description: "Project description.",
      imageUrl: "/images/exec1.png",
      year: new Date().getFullYear().toString(),
      sqft: "10,000",
    };
    setLocalData({ ...localData, executions: [...localData.executions, newExec] });
    setEditingItem(newExec.id);
  };

  const updateExecution = (id: string, updates: Partial<Execution>) => {
    if (!localData) return;
    setLocalData({ 
      ...localData, 
      executions: localData.executions.map((e: any) => (e.id === id ? { ...e, ...updates } : e)) 
    });
  };

  const deleteExecution = (id: string) => {
    if (!localData) return;
    setLocalData({ 
      ...localData, 
      executions: localData.executions.filter((e) => e.id !== id) 
    });
  };

  // ── Blog CRUD ──
  const addBlog = () => {
    if (!localData) return;
    const newBlog: BlogPost = {
      id: generateId(),
      title: "New Blog Post",
      excerpt: "Blog post excerpt.",
      content: "Full blog content here.",
      author: "Frames n Spaces Team",
      date: new Date().toISOString().split("T")[0],
      category: "Design",
      imageUrl: "/images/exec1.png",
      featured: false,
    };
    setLocalData({ ...localData, blogs: [...localData.blogs, newBlog] });
    setEditingItem(newBlog.id);
  };

  const updateBlog = (id: string, updates: Partial<BlogPost>) => {
    if (!localData) return;
    setLocalData({ 
      ...localData, 
      blogs: localData.blogs.map((b: any) => (b.id === id ? { ...b, ...updates } : b)) 
    });
  };

  const deleteBlog = (id: string) => {
    if (!localData) return;
    setLocalData({ 
      ...localData, 
      blogs: localData.blogs.filter((b) => b.id !== id) 
    });
  };

  // ── Clientele CRUD ──
  const addClient = () => {
    if (!localData) return;
    setLocalData({ ...localData, clientele: [...localData.clientele, { name: "New Client", logo: "" }] });
  };

  const updateClient = (index: number, updates: Partial<{ name: string; logo: string }>) => {
    if (!localData) return;
    const newClientele = [...localData.clientele];
    newClientele[index] = { ...newClientele[index], ...updates };
    setLocalData({ ...localData, clientele: newClientele });
  };

  const deleteClient = (index: number) => {
    if (!localData) return;
    setLocalData({ 
      ...localData, 
      clientele: localData.clientele.filter((_, i) => i !== index) 
    });
  };

  // ── Passcode Gate ──
  if (!authenticated) {
    return (
      <div className={styles.gate}>
        <div className={styles.gateCard}>
          <div className={styles.gateLogo}>
            <span className={styles.gateIcon}>◈</span>
            <span className={styles.gateBrand}>Frames n Spaces</span>
          </div>
          <h1 className={styles.gateTitle}>Admin Access</h1>
          <p className={styles.gateSubtitle}>Enter your passcode to access the admin panel.</p>
          <form onSubmit={handleLogin} className={styles.gateForm}>
            <div className={styles.gateField}>
              <input type="password" value={passcodeInput} onChange={(e) => setPasscodeInput(e.target.value)} placeholder="Enter passcode" className={styles.gateInput} autoFocus />
            </div>
            {error && <p className={styles.gateError}>{error}</p>}
            <button type="submit" className={styles.gateBtn}>Access Panel</button>
          </form>
          <Link href="/" className={styles.gateBack}>← Back to Website</Link>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className={styles.admin}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarLogo}>
            <span className={styles.gateIcon}>◈</span>
            <div>
              <span className={styles.sidebarBrand}>Frames n Spaces</span>
              <span className={styles.sidebarRole}>Admin Panel</span>
            </div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {([
            { key: "hero", label: "Hero Section", icon: "🏠" },
            { key: "about", label: "About Section", icon: "ℹ️" },
            { key: "whatWeDo", label: "Methodology", icon: "🛠️" },
            { key: "stats", label: "Stats", icon: "📊" },
            { key: "services", label: "Services", icon: "◇" },
            { key: "executions", label: "Executions", icon: "◆" },
            { key: "blogs", label: "Blog Posts", icon: "◈" },
            { key: "clientele", label: "Clientele", icon: "🤝" },
            { key: "settings", label: "Settings", icon: "⚙️" },
          ] as { key: Tab; label: string; icon: string }[]).map((tab) => (
            <button
              key={tab.key}
              className={`${styles.navItem} ${activeTab === tab.key ? styles.navItemActive : ""}`}
              onClick={() => { setActiveTab(tab.key); setEditingItem(null); }}
            >
              <span className={styles.navIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <Link href="/" className={styles.viewSite}>View Website →</Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1 className={styles.mainTitle}>
            {activeTab === "hero" && "Edit Hero Section"}
            {activeTab === "about" && "Edit About Section"}
            {activeTab === "whatWeDo" && "Manage Methodology"}
            {activeTab === "stats" && "Edit Stats"}
            {activeTab === "services" && "Manage Services"}
            {activeTab === "executions" && "Manage Executions"}
            {activeTab === "blogs" && "Manage Blog Posts"}
            {activeTab === "clientele" && "Manage Clientele"}
            {activeTab === "settings" && "Admin Settings"}
          </h1>
          <div className={styles.headerActions}>
            {(activeTab === "services" || activeTab === "executions" || activeTab === "blogs" || activeTab === "clientele" || activeTab === "whatWeDo") && (
              <button className={styles.addBtn} onClick={() => {
                if (activeTab === "services") addService();
                if (activeTab === "executions") addExecution();
                if (activeTab === "blogs") addBlog();
                if (activeTab === "clientele") addClient();
                if (activeTab === "whatWeDo") addWhatWeDo();
              }}>+ Add New</button>
            )}
          </div>
        </div>

        <div className={styles.content}>
          {/* ── Hero Tab ── */}
          {activeTab === "hero" && localData && (
            <div className={styles.settingsPanel}>
              <div className={styles.settingsSection}>
                <h3 className={styles.settingsTitle}>Hero Content</h3>
                <div className={styles.editRow}>
                  <label>Heading Line 1</label>
                  <input value={localData.hero.heading1} onChange={(e) => updateHero({ heading1: e.target.value })} />
                </div>
                <div className={styles.editRow}>
                  <label>Heading Line 2</label>
                  <input value={localData.hero.heading2} onChange={(e) => updateHero({ heading2: e.target.value })} />
                </div>
                <div className={styles.editRow}>
                  <label>Heading Accent Word</label>
                  <input value={localData.hero.headingAccent} onChange={(e) => updateHero({ headingAccent: e.target.value })} />
                </div>
                <div className={styles.editRow}>
                  <label>Subtitle</label>
                  <textarea value={localData.hero.subtitle} onChange={(e) => updateHero({ subtitle: e.target.value })} rows={3} />
                </div>
                <ImageUploadField 
                  label="Background Image" 
                  value={localData.hero.imageUrl} 
                  onChange={(url) => updateHero({ imageUrl: url })} 
                  id="hero-upload"
                  uploadingId={uploadingId}
                  handleFileUpload={handleFileUpload}
                  styles={styles}
                />
                {localData.hero.imageUrl && (
                  <div className={styles.imagePreview}>
                    <img src={localData.hero.imageUrl} alt="Hero preview" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── About Tab ── */}
          {activeTab === "about" && localData && (
            <div className={styles.settingsPanel}>
              <div className={styles.settingsSection}>
                <h3 className={styles.settingsTitle}>About Content</h3>
                <div className={styles.editRow}>
                  <label>Heading</label>
                  <input value={localData.about.heading} onChange={(e) => updateAbout({ heading: e.target.value })} />
                </div>
                <div className={styles.editRow}>
                  <label>Heading Accent</label>
                  <input value={localData.about.headingAccent} onChange={(e) => updateAbout({ headingAccent: e.target.value })} />
                </div>
                <div className={styles.editRow}>
                  <label>Description 1</label>
                  <textarea value={localData.about.description1} onChange={(e) => updateAbout({ description1: e.target.value })} rows={4} />
                </div>
                <div className={styles.editRow}>
                  <label>Description 2</label>
                  <textarea value={localData.about.description2} onChange={(e) => updateAbout({ description2: e.target.value })} rows={4} />
                </div>
                <ImageUploadField 
                  label="About Image" 
                  value={localData.about.imageUrl} 
                  onChange={(url) => updateAbout({ imageUrl: url })} 
                  id="about-upload"
                  uploadingId={uploadingId}
                  handleFileUpload={handleFileUpload}
                  styles={styles}
                />
                {localData.about.imageUrl && (
                  <div className={styles.imagePreview}>
                    <img src={localData.about.imageUrl} alt="About preview" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── What We Do Tab ── */}
          {activeTab === "whatWeDo" && localData?.whatWeDo.map((item: any) => (
            <div key={item.id} className={`${styles.itemCard} ${editingItem === item.id ? styles.itemCardEditing : ""}`}>
              {editingItem === item.id ? (
                <div className={styles.editForm}>
                  <div className={styles.editGrid}>
                    <div className={styles.editRow}>
                      <label>Title</label>
                      <input value={item.title} onChange={(e) => updateWhatWeDo(item.id, { title: e.target.value })} />
                    </div>
                    <ImageUploadField 
                      label="Image" 
                      value={item.imageUrl} 
                      onChange={(url) => updateWhatWeDo(item.id, { imageUrl: url })} 
                      id={`wwd-${item.id}`}
                      uploadingId={uploadingId}
                      handleFileUpload={handleFileUpload}
                      styles={styles}
                    />
                  </div>
                  <div className={styles.editRow}>
                    <label>Description</label>
                    <textarea value={item.description} onChange={(e) => updateWhatWeDo(item.id, { description: e.target.value })} rows={3} />
                  </div>
                  {item.imageUrl && (
                    <div className={styles.imagePreview}>
                      <img src={item.imageUrl} alt="Methodology preview" />
                    </div>
                  )}
                  <div className={styles.formActions}>
                    <button className={styles.saveBtn} onClick={() => setEditingItem(null)}>Finish Editing</button>
                    <button className={styles.deleteBtn} onClick={() => deleteWhatWeDo(item.id)}>Delete Point</button>
                  </div>
                </div>
              ) : (
                <div className={styles.itemSummary} onClick={() => setEditingItem(item.id)}>
                  <div className={styles.itemSummaryMain}>
                    <h4 className={styles.itemSummaryTitle}>{item.title}</h4>
                    <p className={styles.itemSummaryDesc}>{item.description.substring(0, 80)}...</p>
                  </div>
                  <button className={styles.editBtn}>Edit</button>
                </div>
              )}
            </div>
          ))}

          {/* ── Stats Tab ── */}
          {activeTab === "stats" && localData && (
            <div className={styles.settingsPanel}>
              <div className={styles.settingsSection}>
                <h3 className={styles.settingsTitle}>Company Statistics</h3>
                {localData.stats.map((stat: any) => (
                  <div key={stat.id} className={styles.statEditCard}>
                    <div className={styles.editRow}>
                      <label>Label</label>
                      <input value={stat.label} onChange={(e) => updateStat(stat.id, { label: e.target.value.toUpperCase() })} />
                    </div>
                    <div className={styles.editRow}>
                      <label>Value</label>
                      <input type="number" value={stat.value} onChange={(e) => updateStat(stat.id, { value: Number(e.target.value) })} />
                    </div>
                    <div className={styles.editRow}>
                      <label>Suffix (e.g. +)</label>
                      <input value={stat.suffix} onChange={(e) => updateStat(stat.id, { suffix: e.target.value })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Services Tab ── */}
          {activeTab === "services" && localData?.services.map((svc: any) => (
            <div key={svc.id} className={`${styles.itemCard} ${editingItem === svc.id ? styles.itemCardEditing : ""}`}>
              {editingItem === svc.id ? (
                <div className={styles.editForm}>
                  <div className={styles.editGrid}>
                    <div className={styles.editRow}><label>Title</label><input value={svc.title} onChange={(e) => updateService(svc.id, { title: e.target.value })} /></div>
                    <div className={styles.editRow}><label>Subtitle</label><input value={svc.subtitle} onChange={(e) => updateService(svc.id, { subtitle: e.target.value })} /></div>
                    <div className={styles.editRow}><label>Icon</label><input value={svc.icon} onChange={(e) => updateService(svc.id, { icon: e.target.value })} /></div>
                    <ImageUploadField 
                      label="Image" 
                      value={svc.imageUrl} 
                      onChange={(url) => updateService(svc.id, { imageUrl: url })} 
                      id={`svc-${svc.id}`}
                      uploadingId={uploadingId}
                      handleFileUpload={handleFileUpload}
                      styles={styles}
                    />
                  </div>
                  <div className={styles.editRow}><label>Description</label><textarea value={svc.description} onChange={(e) => updateService(svc.id, { description: e.target.value })} rows={3} /></div>
                  <div className={styles.editRow}><label>Features (one per line)</label><textarea value={svc.features.join("\n")} onChange={(e) => updateService(svc.id, { features: e.target.value.split("\n").filter(Boolean) })} rows={4} /></div>
                  {svc.imageUrl && <div className={styles.imagePreview}><img src={svc.imageUrl} alt="Service preview" /></div>}
                  <button className={styles.doneBtn} onClick={() => setEditingItem(null)}>Done Editing</button>
                </div>
              ) : (
                <div className={styles.itemPreview}>
                  <div className={styles.itemLeft}>
                    <span className={styles.itemIcon}>{svc.icon}</span>
                    <div><h3 className={styles.itemTitle}>{svc.title}</h3><p className={styles.itemSub}>{svc.subtitle}</p></div>
                  </div>
                  <div className={styles.itemActions}>
                    <button className={styles.editBtn} onClick={() => setEditingItem(svc.id)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteService(svc.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ── Executions Tab ── */}
          {activeTab === "executions" && localData?.executions.map((exec: any) => (
            <div key={exec.id} className={`${styles.itemCard} ${editingItem === exec.id ? styles.itemCardEditing : ""}`}>
              {editingItem === exec.id ? (
                <div className={styles.editForm}>
                  <div className={styles.editGrid}>
                    <div className={styles.editRow}><label>Title</label><input value={exec.title} onChange={(e) => updateExecution(exec.id, { title: e.target.value })} /></div>
                    <div className={styles.editRow}><label>Client</label><input value={exec.client} onChange={(e) => updateExecution(exec.id, { client: e.target.value })} /></div>
                    <div className={styles.editRow}><label>Location</label><input value={exec.location} onChange={(e) => updateExecution(exec.id, { location: e.target.value })} /></div>
                    <div className={styles.editRow}><label>Category</label><input value={exec.category} onChange={(e) => updateExecution(exec.id, { category: e.target.value })} /></div>
                    <div className={styles.editRow}><label>Year</label><input value={exec.year} onChange={(e) => updateExecution(exec.id, { year: e.target.value })} /></div>
                    <div className={styles.editRow}><label>Sq. Ft.</label><input value={exec.sqft} onChange={(e) => updateExecution(exec.id, { sqft: e.target.value })} /></div>
                  </div>
                  <div className={styles.editRow}><label>Description</label><textarea value={exec.description} onChange={(e) => updateExecution(exec.id, { description: e.target.value })} rows={3} /></div>
                  <ImageUploadField 
                    label="Project Image" 
                    value={exec.imageUrl} 
                    onChange={(url) => updateExecution(exec.id, { imageUrl: url })} 
                    id={`exec-${exec.id}`}
                    uploadingId={uploadingId}
                    handleFileUpload={handleFileUpload}
                    styles={styles}
                  />
                  {exec.imageUrl && <div className={styles.imagePreview}><img src={exec.imageUrl} alt="Execution preview" /></div>}
                  <button className={styles.doneBtn} onClick={() => setEditingItem(null)}>Done Editing</button>
                </div>
              ) : (
                <div className={styles.itemPreview}>
                  <div className={styles.itemLeft}>
                    {exec.imageUrl && <div className={styles.itemThumb} style={{ backgroundImage: `url(${exec.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
                    <div><h3 className={styles.itemTitle}>{exec.title}</h3><p className={styles.itemSub}>{exec.client} · {exec.location} · {exec.year}</p></div>
                  </div>
                  <div className={styles.itemActions}>
                    <button className={styles.editBtn} onClick={() => setEditingItem(exec.id)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteExecution(exec.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ── Blogs Tab ── */}
          {activeTab === "blogs" && localData?.blogs.map((blog: any) => (
            <div key={blog.id} className={`${styles.itemCard} ${editingItem === blog.id ? styles.itemCardEditing : ""}`}>
              {editingItem === blog.id ? (
                <div className={styles.editForm}>
                  <div className={styles.editGrid}>
                    <div className={styles.editRow}><label>Title</label><input value={blog.title} onChange={(e) => updateBlog(blog.id, { title: e.target.value })} /></div>
                    <div className={styles.editRow}><label>Category</label><input value={blog.category} onChange={(e) => updateBlog(blog.id, { category: e.target.value })} /></div>
                    <div className={styles.editRow}><label>Author</label><input value={blog.author} onChange={(e) => updateBlog(blog.id, { author: e.target.value })} /></div>
                    <div className={styles.editRow}><label>Date</label><input type="date" value={blog.date} onChange={(e) => updateBlog(blog.id, { date: e.target.value })} /></div>
                  </div>
                  <div className={styles.editRow}><label>Excerpt</label><textarea value={blog.excerpt} onChange={(e) => updateBlog(blog.id, { excerpt: e.target.value })} rows={2} /></div>
                  <div className={styles.editRow}><label>Content</label><textarea value={blog.content} onChange={(e) => updateBlog(blog.id, { content: e.target.value })} rows={6} /></div>
                  <ImageUploadField 
                    label="Blog Image" 
                    value={blog.imageUrl} 
                    onChange={(url) => updateBlog(blog.id, { imageUrl: url })} 
                    id={`blog-${blog.id}`}
                    uploadingId={uploadingId}
                    handleFileUpload={handleFileUpload}
                    styles={styles}
                  />
                  {blog.imageUrl && <div className={styles.imagePreview}><img src={blog.imageUrl} alt="Blog preview" /></div>}
                  <div className={styles.editRow}>
                    <label className={styles.checkLabel}><input type="checkbox" checked={blog.featured} onChange={(e) => updateBlog(blog.id, { featured: e.target.checked })} />Featured Post</label>
                  </div>
                  <button className={styles.doneBtn} onClick={() => setEditingItem(null)}>Done Editing</button>
                </div>
              ) : (
                <div className={styles.itemPreview}>
                  <div className={styles.itemLeft}>
                    <div><h3 className={styles.itemTitle}>{blog.featured && <span className={styles.featuredBadge}>★</span>}{blog.title}</h3><p className={styles.itemSub}>{blog.category} · {blog.author} · {blog.date}</p></div>
                  </div>
                  <div className={styles.itemActions}>
                    <button className={styles.editBtn} onClick={() => setEditingItem(blog.id)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => deleteBlog(blog.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ── Clientele Tab ── */}
          {activeTab === "clientele" && localData?.clientele.map((client: any, index: number) => (
            <div key={index} className={styles.itemCard}>
              <div className={styles.editForm}>
                <div className={styles.editGrid}>
                  <div className={styles.editRow}>
                    <label>Client Name</label>
                    <input value={client.name} onChange={(e) => updateClient(index, { name: e.target.value })} />
                  </div>
                  <ImageUploadField 
                    label="Client Logo" 
                    value={client.logo} 
                    onChange={(url) => updateClient(index, { logo: url })} 
                    id={`client-${index}`}
                    uploadingId={uploadingId}
                    handleFileUpload={handleFileUpload}
                    styles={styles}
                  />
                </div>
                {client.logo && (
                  <div className={styles.imagePreview}>
                    <img src={client.logo} alt="Client logo preview" style={{ maxHeight: '100px', width: 'auto' }} />
                  </div>
                )}
                <div style={{ marginTop: '1rem' }}>
                  <button className={styles.deleteBtn} onClick={() => deleteClient(index)}>Delete Client</button>
                </div>
              </div>
            </div>
          ))}

          {/* ── Settings Tab ── */}
          {activeTab === "settings" && localData && (
            <div className={styles.settingsPanel}>
              <div className={styles.settingsSection}>
                <h3 className={styles.settingsTitle}>Security</h3>
                <p className={styles.settingsNote}>This passcode is used to authenticate save requests to the server. Keep it secure.</p>
                <div className={styles.editRow}>
                  <label>Update Admin Passcode</label>
                  <div className={styles.passcodeGroup}>
                    <input type="password" value={newPasscode} onChange={(e) => setNewPasscode(e.target.value)} placeholder="Enter new passcode (min 6 chars)" />
                    <button onClick={handlePasscodeChange}>Update</button>
                  </div>
                  {passMsg && <p className={styles.successMsg}>{passMsg}</p>}
                </div>
              </div>

              <div className={styles.settingsSection}>
                <h3 className={styles.settingsTitle}>Content Reset</h3>
                <p className={styles.settingsNote}>
                  Use these buttons to reset specific sections to the latest system defaults (e.g., if you want to apply the new AI-scheduling text).
                </p>
                <div className={styles.resetGrid}>
                  <button onClick={() => handleReset('hero')}>Reset Hero</button>
                  <button onClick={() => handleReset('about')}>Reset About</button>
                  <button onClick={() => handleReset('whatWeDo')}>Reset What We Do</button>
                  <button onClick={() => handleReset('services')}>Reset Services</button>
                  <button onClick={() => handleReset('stats')}>Reset Stats</button>
                  <button onClick={() => handleReset('threatsToStrengths')}>Reset Transformation</button>
                  <button onClick={() => handleReset('clientele')}>Reset Clientele</button>
                </div>
              </div>

              <div className={styles.settingsSection}>
                <h3 className={styles.settingsTitle}>System Info</h3>
                <div className={styles.infoRow}>
                  <span>Next.js Version:</span>
                  <code>16.2.4</code>
                </div>
                <div className={styles.infoRow}>
                  <span>React Version:</span>
                  <code>19.2.4</code>
                </div>
              </div>
            </div>
          )}


        </div>

        {/* ── Action Bar ── */}
        <div className={styles.actionBar}>
          <div className={styles.actionBarInfo}>
            {hasChanges ? (
              <>
                <span className={styles.actionBarPulse} />
                <span>You have unsaved changes</span>
              </>
            ) : (
              <div className={styles.actionBarStatus}>
                <span style={{ opacity: 0.5 }}>All changes are up to date</span>
                {lastSaved && <span className={styles.lastSaved}>Last saved at {lastSaved}</span>}
              </div>
            )}
          </div>
          <div className={styles.actionBarBtns}>
            <button 
              className={styles.undoBtn} 
              onClick={handleUndoAll} 
              disabled={!hasChanges || isSaving}
            >
              Discard Changes
            </button>
            <button 
              className={styles.saveAllBtn} 
              onClick={handleSaveChanges} 
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
