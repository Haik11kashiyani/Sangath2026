import { useState, useEffect, Fragment } from 'react';
import { 
  LayoutDashboard, 
  Tag, 
  FolderTree, 
  Edit3, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Search,
  AlertCircle,
  Users,
  User,
  Eye,
  EyeOff,
  Menu,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { sanitizeInput, validateImageUrl, validateImageFile } from '../utils/security';
import { getCountryFlagUrl } from '../utils/flags';
import {
  saveContentBulkApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  updateInquiryStatusApi,
  deleteInquiryApi,
  exportInquiriesCsvApi,
  fetchAdminUsersApi,
  createAdminUserApi,
  deleteAdminUserApi,
  changePasswordApi,
  uploadSiteImageApi,
  createMenuItemApi,
  updateMenuItemApi,
  deleteMenuItemApi,
  reorderMenuApi
} from '../utils/api';
import './Admin.css';

function Admin({ 
  categories, 
  updateCategories, 
  websiteContent, 
  updateWebsiteContent, 
  inquiries, 
  setInquiries, 
  menuItems = [],
  refreshMenu,
  setIsAdminLoggedIn, 
  setCurrentPage 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [cmsSubTab, setCmsSubTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // RBAC State
  const [adminRole, setAdminRole] = useState('Super Admin');
  const [adminPermissions, setAdminPermissions] = useState(['all']);
  const [adminUsername, setAdminUsername] = useState('admin');

  useEffect(() => {
    const role = sessionStorage.getItem('sangath_admin_role');
    const perms = sessionStorage.getItem('sangath_admin_permissions');
    const uname = sessionStorage.getItem('sangath_admin_username');
    
    if (role) setAdminRole(role);
    if (uname) setAdminUsername(uname);
    if (perms) {
      try {
        setAdminPermissions(JSON.parse(perms));
      } catch(e) {}
    }
  }, []);

  const hasPermission = (tab) => {
    if (adminRole === 'Super Admin' || adminPermissions.includes('all')) return true;
    if (adminRole === 'Viewer' || adminPermissions.includes('view')) return true;
    return adminPermissions.includes(tab);
  };

  const isViewer = adminRole === 'Viewer' || adminPermissions.includes('view');


  // CMS Content Local Draft State
  const [cmsDraft, setCmsDraft] = useState(null);

  // Sync draft state on mount or reset
  useEffect(() => {
    if (websiteContent) {
      setCmsDraft(JSON.parse(JSON.stringify(websiteContent)));
    }
  }, [websiteContent]);

  // Check if draft contains changes compared to global content
  const hasCmsChanges = cmsDraft && websiteContent && JSON.stringify(cmsDraft) !== JSON.stringify(websiteContent);

  // Confirmation dialog state
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, typeInput: '', typeConfirmVal: '' });
  const [confirmInput, setConfirmInput] = useState('');

  // Undo support state
  const [undoCache, setUndoCache] = useState(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  // Notification Toast state
  const [toastMsg, setToastMsg] = useState({ show: false, msg: '', type: 'success' });
  const triggerToast = (msg, type = 'success') => {
    setToastMsg({ show: true, msg, type });
    setTimeout(() => setToastMsg({ show: false, msg: '', type: 'success' }), 3000);
  }

  // --- Admin Users State & Logic ---
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', role: 'Content Manager' });
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  const loadAdminUsersFromApi = () => {
    fetchAdminUsersApi()
      .then(res => {
        if (res && res.users) setAdminUsersList(res.users);
      })
      .catch(err => console.error('Failed to load admin users:', err));
  };

  useEffect(() => {
    if (activeTab === 'admin_users') {
      loadAdminUsersFromApi();
    }
  }, [activeTab]);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.username || !newAdmin.password) return;
    
    let permissions = [];
    if (newAdmin.role === 'Super Admin') permissions = ['all'];
    else if (newAdmin.role === 'Content Manager') permissions = ['cms', 'categories'];
    else if (newAdmin.role === 'Product Manager') permissions = ['products', 'categories'];
    else if (newAdmin.role === 'Sales/Support Rep') permissions = ['inquiries'];
    else if (newAdmin.role === 'Viewer') permissions = ['view'];

    try {
      await createAdminUserApi(newAdmin.username, newAdmin.password, newAdmin.role, permissions);
      loadAdminUsersFromApi();
      setNewAdmin({ username: '', password: '', role: 'Content Manager' });
      setIsAddingAdmin(false);
      triggerToast('New admin created successfully');
    } catch (err) {
      triggerToast(err.message || 'Failed to create admin user', 'error');
    }
  };

  const handleDeleteAdmin = async (id) => {
    try {
      await deleteAdminUserApi(id);
      loadAdminUsersFromApi();
      triggerToast('Admin user deleted');
    } catch (err) {
      triggerToast(err.message || 'Could not delete admin user', 'error');
    }
  };

  // --- Menu Management State ---
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [menuForm, setMenuForm] = useState({
    label: '',
    page: '',
    external_url: '',
    parent_id: '',
    is_visible: 1
  });

  const handleMenuSave = async (e) => {
    e.preventDefault();
    try {
      if (editingMenuId) {
        await updateMenuItemApi(editingMenuId, menuForm);
        triggerToast('Menu item updated');
      } else {
        await createMenuItemApi(menuForm);
        triggerToast('Menu item created');
      }
      setIsMenuModalOpen(false);
      if (refreshMenu) refreshMenu();
    } catch (err) {
      triggerToast('Error saving menu item', 'error');
    }
  };

  const handleMenuDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await deleteMenuItemApi(id);
      triggerToast('Menu item deleted');
      if (refreshMenu) refreshMenu();
    } catch (err) {
      triggerToast('Error deleting menu item', 'error');
    }
  };

  const handleMenuReorder = async (direction, index, array) => {
    if (direction === 'up' && index > 0) {
      const newArray = [...array];
      [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
      
      const payload = newArray.map((item, i) => ({ id: item.id, sort_order: i + 1, parent_id: item.parent_id }));
      try {
        await reorderMenuApi(payload);
        if (refreshMenu) refreshMenu();
      } catch (e) {
        triggerToast('Failed to reorder', 'error');
      }
    } else if (direction === 'down' && index < array.length - 1) {
      const newArray = [...array];
      [newArray[index + 1], newArray[index]] = [newArray[index], newArray[index + 1]];
      
      const payload = newArray.map((item, i) => ({ id: item.id, sort_order: i + 1, parent_id: item.parent_id }));
      try {
        await reorderMenuApi(payload);
        if (refreshMenu) refreshMenu();
      } catch (e) {
        triggerToast('Failed to reorder', 'error');
      }
    }
  };

  // --- CRUD Modals State ---
  const [productModal, setProductModal] = useState({ show: false, editId: null });
  const [productForm, setProductForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    image: '',
    images: [],
    video: '',
    featured: false,
    price: '',
    specifications: [],
    details: []
  });

  const [categoryModal, setCategoryModal] = useState({ show: false, editId: null, name: '' });

  // Auto close alerts/undo
  useEffect(() => {
    if (showUndoToast) {
      const timer = setTimeout(() => {
        setUndoCache(null);
        setShowUndoToast(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showUndoToast])

  // --- Helpers for CMS Draft modifications ---
  const handleDraftChange = (path, value) => {
    setCmsDraft(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      const parts = path.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return updated;
    });
  }

  const handleDraftListChange = (path, index, value) => {
    setCmsDraft(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      const parts = path.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]][index] = sanitizeInput(value);
      return updated;
    });
  }

  const handleDraftListAdd = (path, defaultValue = '') => {
    setCmsDraft(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      const parts = path.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]].push(defaultValue);
      return updated;
    });
    triggerToast('Item added to draft list');
  }

  const handleDraftListRemove = (path, index) => {
    setCmsDraft(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      const parts = path.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]].splice(index, 1);
      return updated;
    });
    triggerToast('Item removed from draft list', 'warning');
  }

  // --- Save / Publish CMS Changes ---
  const handlePublishCmsChanges = async () => {
    if (!cmsDraft) return;

    try {
      // Flatten draft object into updates array for backend bulk upsert
      const updates = [];
      for (const [page, pageVal] of Object.entries(cmsDraft)) {
        for (const [section, secVal] of Object.entries(pageVal)) {
          if (typeof secVal === 'object' && secVal !== null && !Array.isArray(secVal)) {
            for (const [key, val] of Object.entries(secVal)) {
              updates.push({ page, section, key, value: val });
            }
          } else {
            updates.push({ page, section: 'general', key: section, value: secVal });
          }
        }
      }

      await saveContentBulkApi(updates);
      if (updateWebsiteContent) updateWebsiteContent(cmsDraft);
      triggerToast('CMS changes published successfully to backend database!');
    } catch (err) {
      triggerToast(err.message || 'Failed to publish CMS changes', 'error');
    }
  }

  const handleDiscardCmsChanges = () => {
    if (websiteContent) {
      setCmsDraft(JSON.parse(JSON.stringify(websiteContent)));
      triggerToast('CMS draft changes discarded', 'warning');
    }
  }

  // --- CRUD Operations: Categories ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryModal.name.trim()) return;

    const catName = sanitizeInput(categoryModal.name);

    try {
      if (categoryModal.editId) {
        await updateCategoryApi(categoryModal.editId, catName);
        triggerToast('Category updated successfully');
      } else {
        await createCategoryApi(catName);
        triggerToast('Category created successfully');
      }
      if (updateCategories) updateCategories();
      setCategoryModal({ show: false, editId: null, name: '' });
    } catch (err) {
      triggerToast(err.message || 'Category operation failed', 'error');
    }
  }

  const handleDeleteCategory = (catId) => {
    const targetCat = categories.find(c => c.id === catId || c.slug === catId);
    if (!targetCat) return;

    setConfirmModal({
      show: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete the category "${targetCat.name}"? This action cannot be undone.`,
      typeInput: `delete ${targetCat.slug || catId}`,
      typeConfirmVal: '',
      onConfirm: async () => {
        try {
          await deleteCategoryApi(targetCat.slug || catId);
          if (updateCategories) updateCategories();
          triggerToast('Category deleted', 'warning');
        } catch (err) {
          triggerToast(err.message || 'Could not delete category', 'error');
        }
      }
    });
  }

  // --- CRUD Operations: Products ---
  const handleOpenProductModal = (prod = null, defaultCatId = '') => {
    if (prod) {
      // Edit mode
      setProductForm({
        categoryId: prod.categoryId || '',
        name: prod.name,
        description: prod.description,
        image: prod.image,
        images: prod.images ? [...prod.images] : [],
        video: prod.video || '',
        featured: prod.featured || false,
        price: prod.price || '',
        specifications: prod.specifications ? [...prod.specifications] : [],
        details: prod.details ? JSON.parse(JSON.stringify(prod.details)) : []
      });
      setProductModal({ show: true, editId: prod.id });
    } else {
      // Create mode
      setProductForm({
        categoryId: defaultCatId || (categories[0]?.id || ''),
        name: '',
        description: '',
        image: '',
        images: [],
        video: '',
        featured: false,
        price: '',
        specifications: [],
        details: []
      });
      setProductModal({ show: true, editId: null });
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProductForm(prev => ({ ...prev, image: previewUrl, imageFile: file }));
    triggerToast('Image selected for upload');
  }

  const handlePageHeaderImageUpload = async (pageKey, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const res = await uploadSiteImageApi(pageKey, 'header', 'bannerImage', file);
      const pageData = cmsDraft[pageKey] || {};
      const headerData = pageData.header || {};
      const updatedPage = {
        ...pageData,
        header: { ...headerData, bannerImage: res.file_path }
      };
      handleDraftChange(pageKey, updatedPage);
      triggerToast('Header banner image uploaded successfully to server');
    } catch (err) {
      triggerToast(err.message || 'Image upload failed', 'error');
    }
  }

  const handleSiteImageUpload = async (pageKey, section, key, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      const res = await uploadSiteImageApi(pageKey, section, key, file);
      
      // Update draft safely handling nested structure
      const pageData = cmsDraft[pageKey] || {};
      const sectionData = pageData[section] || {};
      const updatedPage = {
        ...pageData,
        [section]: { ...sectionData, [key]: res.file_path }
      };
      handleDraftChange(pageKey, updatedPage);
      triggerToast('Image uploaded successfully');
    } catch (err) {
      triggerToast(err.message || 'Image upload failed', 'error');
    }
  }

  const handleContactIconUpload = (field, e) => handleSiteImageUpload('general', field, field, e);

  const renderHeaderEditorFields = (pageKey, defaultTitle, defaultSubtitle, defaultBanner) => {
    const pageData = cmsDraft[pageKey] || {};
    const header = pageData.header || { title: defaultTitle, subtitle: defaultSubtitle, bannerImage: defaultBanner };

    const updateHeaderField = (field, value) => {
      const updatedPage = {
        ...pageData,
        header: { ...header, [field]: value }
      };
      handleDraftChange(pageKey, updatedPage);
    };

    return (
      <div className="cms-header-banner-section mb-4">
        <h4>Page Header Banner Settings</h4>
        <div className="form-grid">
          <div className="form-group-cms">
            <label>Banner Title</label>
            <input 
              type="text" 
              value={header.title}
              onChange={(e) => updateHeaderField('title', sanitizeInput(e.target.value))}
            />
          </div>
          <div className="form-group-cms">
            <label>Banner Subtitle</label>
            <input 
              type="text" 
              value={header.subtitle}
              onChange={(e) => updateHeaderField('subtitle', sanitizeInput(e.target.value))}
            />
          </div>
        </div>
        <div className="form-group-cms mt-2 full-width">
          <label>Banner Image Path / Upload (Optional)</label>
          <div className="image-input-flex">
            <input 
              type="text" 
              placeholder="e.g. /images/my-banner.jpg or paste base64 data"
              value={header.bannerImage || ''}
              onChange={(e) => updateHeaderField('bannerImage', sanitizeInput(e.target.value))}
            />
            <span className="file-or-span">OR</span>
            <div className="btn-file-wrapper">
              <span>Upload Banner</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handlePageHeaderImageUpload(pageKey, e)}
              />
            </div>
          </div>
          {header.bannerImage && (
            <div className="uploaded-thumb-preview mt-2">
              <span>Preview:</span>
              <img src={header.bannerImage} alt="Header Preview" style={{ width: '120px', height: '50px', background: '#f5f5f5', padding: '2px', borderRadius: '4px', objectFit: 'cover' }} />
            </div>
          )}
        </div>
        <hr className="divider-cms mt-4" />
      </div>
    );
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.categoryId) {
      alert('Product Name and Category are required.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', sanitizeInput(productForm.name));
      formData.append('description', sanitizeInput(productForm.description));
      formData.append('category_id', productForm.categoryId);
      formData.append('video', productForm.video || '');
      formData.append('featured', productForm.featured ? '1' : '0');
      if (productForm.price) formData.append('price', String(productForm.price));
      if (productForm.specifications) formData.append('specifications', JSON.stringify(productForm.specifications));
      if (productForm.details) formData.append('details', JSON.stringify(productForm.details));

      // Handle image file upload or image URL string
      if (productForm.imageFile) {
        formData.append('image', productForm.imageFile);
      } else if (productForm.image) {
        formData.append('image', productForm.image);
      }

      if (productModal.editId) {
        await updateProductApi(productModal.editId, formData);
        triggerToast('Product updated successfully');
      } else {
        await createProductApi(formData);
        triggerToast('Product created successfully');
      }

      if (updateCategories) updateCategories();
      setProductModal({ show: false, editId: null });
    } catch (err) {
      triggerToast(err.message || 'Product operation failed', 'error');
    }
  }

  const handleDeleteProduct = (prod) => {
    setConfirmModal({
      show: true,
      title: 'Delete Product',
      message: `Are you sure you want to delete the product "${prod.name}"? This action cannot be undone.`,
      typeInput: `delete ${prod.id}`,
      typeConfirmVal: '',
      onConfirm: async () => {
        try {
          await deleteProductApi(prod.id);
          if (updateCategories) updateCategories();
          triggerToast('Product deleted', 'warning');
        } catch (err) {
          triggerToast(err.message || 'Could not delete product', 'error');
        }
      }
    });
  }

  const handleUndo = () => {
    if (!undoCache) return;

    if (undoCache.type === 'product') {
      const updated = categories.map(cat => {
        if (cat.id === undoCache.categoryId) {
          return {
            ...cat,
            products: [...cat.products, undoCache.product]
          };
        }
        return cat;
      });
      updateCategories(updated);
      triggerToast('Product restored successfully');
    }

    setUndoCache(null);
    setShowUndoToast(false);
  }

  // --- Specifications Helper ---
  const handleAddSpecRow = () => {
    setProductForm(prev => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        { variety: '', origin: '', specification: '', packaging: '', fcl: '' }
      ]
    }));
  }

  const handleSpecRowChange = (index, field, value) => {
    const updated = [...productForm.specifications];
    updated[index][field] = sanitizeInput(value);
    setProductForm(prev => ({ ...prev, specifications: updated }));
  }

  const handleRemoveSpecRow = (index) => {
    const updated = [...productForm.specifications];
    updated.splice(index, 1);
    setProductForm(prev => ({ ...prev, specifications: updated }));
  }

  // --- Details Helper ---
  const handleAddDetailBlock = (type) => {
    const newBlock = type === 'text' 
      ? { type: 'text', content: '' }
      : { type: 'list', title: '', items: [] };
    
    setProductForm(prev => ({
      ...prev,
      details: [...prev.details, newBlock]
    }));
  }

  const handleDetailBlockChange = (index, value) => {
    const updated = [...productForm.details];
    updated[index].content = sanitizeInput(value);
    setProductForm(prev => ({ ...prev, details: updated }));
  }

  const handleDetailListTitleChange = (index, value) => {
    const updated = [...productForm.details];
    updated[index].title = sanitizeInput(value);
    setProductForm(prev => ({ ...prev, details: updated }));
  }

  const handleDetailListItemChange = (blockIndex, itemIndex, value) => {
    const updated = [...productForm.details];
    updated[blockIndex].items[itemIndex] = sanitizeInput(value);
    setProductForm(prev => ({ ...prev, details: updated }));
  }

  const handleAddDetailListItem = (blockIndex) => {
    const updated = [...productForm.details];
    updated[blockIndex].items.push('');
    setProductForm(prev => ({ ...prev, details: updated }));
  }

  const handleRemoveDetailListItem = (blockIndex, itemIndex) => {
    const updated = [...productForm.details];
    updated[blockIndex].items.splice(itemIndex, 1);
    setProductForm(prev => ({ ...prev, details: updated }));
  }

  const handleRemoveDetailBlock = (index) => {
    const updated = [...productForm.details];
    updated.splice(index, 1);
    setProductForm(prev => ({ ...prev, details: updated }));
  }

  // --- Inquiry Operations ---
  const handleInquiryStatusChange = async (id, status) => {
    try {
      await updateInquiryStatusApi(id, status);
      const updated = inquiries.map(inq => {
        if (inq.id === id) return { ...inq, status };
        return inq;
      });
      setInquiries(updated);
      triggerToast(`Inquiry status set to ${status}`);
    } catch (err) {
      triggerToast(err.message || 'Failed to update status', 'error');
    }
  }

  const handleDeleteInquiry = (id) => {
    setConfirmModal({
      show: true,
      title: 'Delete Inquiry Record',
      message: 'Are you sure you want to permanently delete this customer inquiry? This cannot be undone.',
      typeInput: 'confirm delete',
      typeConfirmVal: '',
      onConfirm: async () => {
        try {
          await deleteInquiryApi(id);
          const updated = inquiries.filter(inq => inq.id !== id);
          setInquiries(updated);
          triggerToast('Inquiry record deleted', 'warning');
        } catch (err) {
          triggerToast(err.message || 'Failed to delete inquiry', 'error');
        }
      }
    });
  }

  const handleExportInquiriesCSV = async () => {
    try {
      await exportInquiriesCsvApi();
      triggerToast('Inquiries exported successfully');
    } catch (err) {
      triggerToast(err.message || 'CSV export failed', 'error');
    }
  }

  // --- Reset Website Settings ---
  const handleResetSystem = () => {
    setConfirmModal({
      show: true,
      title: 'RESET SYSTEM TO DEFAULT CONTENT',
      message: 'WARNING: This will wipe out all custom CMS modifications, products, and categories, resetting the website back to its default state. Type "RESET ALL" to execute.',
      typeInput: 'RESET ALL',
      typeConfirmVal: '',
      onConfirm: () => {
        resetToDefaults();
        window.location.reload();
      }
    });
  }

  // --- Credentials and Password Updates ---
  const [passwordsForm, setPasswordsForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [editUsername, setEditUsername] = useState('');

  useEffect(() => {
    if (adminUsername) {
      setEditUsername(adminUsername);
    }
  }, [adminUsername]);

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    
    if (passwordsForm.new !== passwordsForm.confirm) {
      triggerToast('New password and confirmation do not match', 'error');
      return;
    }

    try {
      await changePasswordApi(passwordsForm.current, passwordsForm.new);
      setPasswordsForm({ current: '', new: '', confirm: '' });
      triggerToast('Password updated successfully');
    } catch (err) {
      triggerToast(err.message || 'Failed to update password', 'error');
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('sangath_admin_session_token');
    sessionStorage.removeItem('sangath_admin_session_expiry');
    setIsAdminLoggedIn(false);
    setCurrentPage('home');
  }

  // Flattened products list for rendering
  const allFlattenedProducts = [];
  categories.forEach(cat => {
    (cat.products || []).forEach(p => {
      allFlattenedProducts.push({ ...p, categoryId: cat.id, categoryName: cat.name });
    });
  });

  const filteredProducts = allFlattenedProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const newInquiriesCount = inquiries.filter(inq => inq.status === 'new').length;

  if (!cmsDraft) {
    return (
      <div className="admin-container">
        <div className="admin-workspace" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="login-spinner"></div>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Loading CMS Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      
      {/* Toast Alert */}
      {toastMsg.show && (
        <div className={`admin-toast ${toastMsg.type}`}>
          <span>{toastMsg.msg}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h3>Sangath CMS</h3>
          <span>Web Administration</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          
          {hasPermission('cms') && (
            <button 
              className={`sidebar-link ${activeTab === 'cms' ? 'active' : ''}`}
              onClick={() => setActiveTab('cms')}
            >
              <Edit3 size={18} /> Page Content (CMS)
            </button>
          )}

          {hasPermission('cms') && (
            <button 
              className={`sidebar-link ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => setActiveTab('menu')}
            >
              <Menu size={18} /> Menu &amp; Nav
            </button>
          )}

          {hasPermission('products') && (
            <button 
              className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Tag size={18} /> Products CRUD
            </button>
          )}

          {hasPermission('categories') && (
            <button 
              className={`sidebar-link ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <FolderTree size={18} /> Categories
            </button>
          )}

          {hasPermission('inquiries') && (
            <button 
              className={`sidebar-link ${activeTab === 'inquiries' ? 'active' : ''}`}
              onClick={() => setActiveTab('inquiries')}
            >
              <ClipboardList size={18} /> 
              Inquiries
              {newInquiriesCount > 0 && <span className="sidebar-badge">{newInquiriesCount}</span>}
            </button>
          )}

          {hasPermission('settings') && (
            <button 
              className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} /> System Settings
            </button>
          )}

          {hasPermission('admins') && (
            <button 
              className={`sidebar-link ${activeTab === 'admin_users' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin_users')}
            >
              <Users size={18} /> Admin Users
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="admin-workspace">
        <header className="workspace-header">
          <h2>
            {activeTab === 'overview' && "Dashboard Overview"}
            {activeTab === 'cms' && "Page Content (CMS)"}
            {activeTab === 'menu' && "Menu & Navigation Management"}
            {activeTab === 'products' && "Products Management"}
            {activeTab === 'categories' && "Category Tree"}
            {activeTab === 'inquiries' && "Customer Inquiries"}
            {activeTab === 'settings' && "System Configuration"}
            {activeTab === 'admin_users' && "Admin Access Control"}
          </h2>
          <div className="workspace-user">
            <div className="user-info">
              <span className="user-name">@{adminUsername}</span>
              <span className="user-role">{adminRole}</span>
            </div>
          </div>
          <button className="btn-view-site" onClick={() => setCurrentPage('home')}>
            View Website
          </button>
        </header>

        {isViewer && (
          <div style={{ 
            background: 'linear-gradient(135deg, #1e3a5f, #2d5986)', 
            color: '#fff', 
            padding: '0.75rem 1.25rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            <Eye size={18} />
            <span><strong>View-Only Mode</strong> — You are logged in as a Viewer. All data is visible but editing is disabled.</span>
          </div>
        )}

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <div className="stats-grid">
              <div className="stat-card gold">
                <h4>Total Categories</h4>
                <div className="stat-value">{categories.length}</div>
              </div>
              <div className="stat-card navy">
                <h4>Total Products</h4>
                <div className="stat-value">{allFlattenedProducts.length}</div>
              </div>
              <div className="stat-card red">
                <h4>Total Inquiries</h4>
                <div className="stat-value">{inquiries.length}</div>
                {newInquiriesCount > 0 && <span className="card-badge-new">{newInquiriesCount} New</span>}
              </div>
              <div className="stat-card green">
                <h4>Featured Products</h4>
                <div className="stat-value">{allFlattenedProducts.filter(p => p.featured).length}</div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="panel-card">
                <h3>Recent Customer Inquiries</h3>
                {inquiries.length === 0 ? (
                  <p className="no-data">No messages received yet.</p>
                ) : (
                  <div className="recent-list">
                    {inquiries.slice(0, 5).map(inq => (
                      <div key={inq.id} className={`recent-item ${inq.status}`}>
                        <div className="recent-item-meta">
                          <strong>{inq.name}</strong>
                          <span>{new Date(inq.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p>{inq.message.length > 80 ? inq.message.substring(0, 80) + '...' : inq.message}</p>
                        {inq.product && <span className="interest-tag">Interested in: {inq.product}</span>}
                      </div>
                    ))}
                    <button className="link-more" onClick={() => setActiveTab('inquiries')}>View all inquiries</button>
                  </div>
                )}
              </div>

              <div className="panel-card">
                <h3>System Information</h3>
                <table className="info-table">
                  <tbody>
                    <tr>
                      <td>Auth Session Status:</td>
                      <td><span className="badge-success">Authenticated</span></td>
                    </tr>
                    <tr>
                      <td>Database Type:</td>
                      <td>Server-side SQLite CRM Database</td>
                    </tr>
                    <tr>
                      <td>Security Headers:</td>
                      <td>CSP Active, XSS Filters On</td>
                    </tr>
                    <tr>
                      <td>Rebranding Ready:</td>
                      <td>Yes, all content editable from CMS tab</td>
                    </tr>
                  </tbody>
                </table>
                <div className="system-hints">
                  <AlertCircle size={16} />
                  <span>Use the <strong>Page Content (CMS)</strong> tab to dynamically change logos, headers, paragraphs, lists, and images without code!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE CONTENT (CMS) TAB --- */}
        {activeTab === 'cms' && (
          <div className="tab-pane">
            <div className="cms-subtabs-nav">
              {['general', 'home', 'about', 'products', 'exports', 'quality', 'contact', 'blogs', 'careers', 'gallery', 'harvest'].map(tab => (
                <button 
                  key={tab} 
                  className={`cms-subtab-link ${cmsSubTab === tab ? 'active' : ''}`}
                  onClick={() => setCmsSubTab(tab)}
                >
                  {tab === 'about' ? 'About Us' : 
                   tab === 'exports' ? 'Exports / Imports' : 
                   tab === 'products' ? 'Products Page' :
                   tab === 'contact' ? 'Contact Page' :
                   tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem 1.5rem', background: hasCmsChanges ? 'rgba(199, 164, 91, 0.15)' : '#ffffff', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: hasCmsChanges ? '1px solid var(--spice-gold)' : '1px solid var(--border-soft)' }}>
              <span style={{ color: 'var(--primary-navy)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                {hasCmsChanges ? 'You have unsaved changes! Click save to update the website.' : 'Page Content Settings'}
              </span>
              <button onClick={handlePublishCmsChanges} className="btn-save-publish" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: hasCmsChanges ? 1 : 0.6 }}>
                <Check size={16} /> Save & Publish Changes
              </button>
            </div>

            {/* CMS Panel: General Site configurations */}
            {cmsSubTab === 'general' && (
              <div className="panel-card mt-4">
                <h3>General Branding &amp; Contact Info</h3>
                <div className="form-grid">
                  <div className="form-group-cms">
                    <label>Logo Text / Brand Name</label>
                    <input 
                      type="text" 
                      value={cmsDraft.general.logoText}
                      onChange={(e) => handleDraftChange('general.logoText', sanitizeInput(e.target.value))}
                    />
                  </div>
                  <div className="form-group-cms">
                    <label>Corporate Contact Email</label>
                    <input 
                      type="email" 
                      value={cmsDraft.general.email}
                      onChange={(e) => handleDraftChange('general.email', sanitizeInput(e.target.value))}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>Office Address</label>
                    <input 
                      type="text" 
                      value={cmsDraft.general.address}
                      onChange={(e) => handleDraftChange('general.address', sanitizeInput(e.target.value))}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>SEO Website Title Tag</label>
                    <input 
                      type="text" 
                      value={cmsDraft.general.siteTitle}
                      onChange={(e) => handleDraftChange('general.siteTitle', sanitizeInput(e.target.value))}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>SEO Meta Description</label>
                    <textarea 
                      rows="2"
                      value={cmsDraft.general.metaDescription}
                      onChange={(e) => handleDraftChange('general.metaDescription', sanitizeInput(e.target.value))}
                    ></textarea>
                  </div>
                  <div className="form-group-cms full-width">
                    <label>SEO Meta Keywords (comma separated)</label>
                    <input 
                      type="text" 
                      value={cmsDraft.general.metaKeywords}
                      onChange={(e) => handleDraftChange('general.metaKeywords', sanitizeInput(e.target.value))}
                    />
                  </div>
                </div>

                <div className="cms-list-section mt-4">
                  <h4>Phone Numbers</h4>
                  {cmsDraft.general.phones.map((phone, i) => (
                    <div key={i} className="cms-list-item">
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => handleDraftListChange('general.phones', i, e.target.value)}
                      />
                      <button className="btn-list-delete" onClick={() => handleDraftListRemove('general.phones', i)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="btn-list-add" onClick={() => handleDraftListAdd('general.phones', '+91 ')}>
                    <Plus size={14} /> Add Phone
                  </button>
                </div>

                <div className="cms-list-section mt-4">
                  <h4>Footer Social Media Links (Follow Us)</h4>
                  <div className="form-grid">
                    {['linkedin', 'facebook', 'instagram', 'twitter'].map(network => (
                      <div key={network} className="form-group-cms">
                        <label>{network.toUpperCase()} Link</label>
                        <input 
                          type="text" 
                          value={cmsDraft.general.socialLinks[network] || ''}
                          onChange={(e) => {
                            const updatedLinks = { ...cmsDraft.general.socialLinks, [network]: sanitizeInput(e.target.value) };
                            handleDraftChange('general.socialLinks', updatedLinks);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cms-list-section mt-4">
                  <h4>Contact Info Icons (Optional)</h4>
                  <div className="form-grid">
                    {['addressIcon', 'phoneIcon', 'emailIcon'].map(field => (
                      <div key={field} className="form-group-cms">
                        <label>{field.replace('Icon', '').toUpperCase()} Icon</label>
                        <div className="image-input-flex">
                          <input 
                            type="text" 
                            placeholder="Image URL or base64"
                            value={cmsDraft.general[field] || ''}
                            onChange={(e) => handleDraftChange(`general.${field}`, sanitizeInput(e.target.value))}
                          />
                          <span className="file-or-span">OR</span>
                          <div className="btn-file-wrapper">
                            <span>Upload Icon</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleContactIconUpload(field, e)}
                            />
                          </div>
                        </div>
                        {cmsDraft.general[field] && (
                          <div className="uploaded-thumb-preview mt-2">
                            <img src={cmsDraft.general[field]} alt="Icon Preview" style={{ width: '32px', height: '32px', background: '#0b1320', padding: '4px', borderRadius: '50%', objectFit: 'contain' }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cms-list-section mt-4">
                  <h4>Global Footer Background</h4>
                  <div className="form-group-cms full-width">
                    <label>Footer Background Image URL</label>
                    <div className="image-input-flex">
                      <input 
                        type="text" 
                        placeholder="e.g. /images/Cumin_Seeds.jpg"
                        value={cmsDraft.general.footerBackground || ''}
                        onChange={(e) => handleDraftChange('general.footerBackground', sanitizeInput(e.target.value))}
                      />
                      <span className="file-or-span">OR</span>
                      <div className="btn-file-wrapper">
                        <span>Upload Background</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleSiteImageUpload('general', 'general', 'footerBackground', e)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CMS Panel: Home page settings */}
            {cmsSubTab === 'home' && (
              <div className="panel-card mt-4">
                <h3>Home Page Content</h3>
                
                <h4>Hero Banner Text</h4>
                <div className="form-grid">
                  <div className="form-group-cms">
                    <label>Hero Welcome Prefix</label>
                    <input 
                      type="text" 
                      value={cmsDraft.home.hero.subtitle}
                      onChange={(e) => {
                        const updatedHero = { ...cmsDraft.home.hero, subtitle: sanitizeInput(e.target.value) };
                        handleDraftChange('home.hero', updatedHero);
                      }}
                    />
                  </div>
                  <div className="form-group-cms">
                    <label>Hero Title</label>
                    <input 
                      type="text" 
                      value={cmsDraft.home.hero.title}
                      onChange={(e) => {
                        const updatedHero = { ...cmsDraft.home.hero, title: sanitizeInput(e.target.value) };
                        handleDraftChange('home.hero', updatedHero);
                      }}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>Hero Tagline / Header Subtitle</label>
                    <input 
                      type="text" 
                      value={cmsDraft.home.hero.tagline}
                      onChange={(e) => {
                        const updatedHero = { ...cmsDraft.home.hero, tagline: sanitizeInput(e.target.value) };
                        handleDraftChange('home.hero', updatedHero);
                      }}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>Hero Banner Image URL</label>
                    <div className="image-input-flex">
                      <input 
                        type="text" 
                        placeholder="e.g. /images/home_banner.jpg"
                        value={cmsDraft.home.hero.bannerImage || ''}
                        onChange={(e) => {
                          const updatedHero = { ...cmsDraft.home.hero, bannerImage: sanitizeInput(e.target.value) };
                          handleDraftChange('home.hero', updatedHero);
                        }}
                      />
                      <span className="file-or-span">OR</span>
                      <div className="btn-file-wrapper">
                        <span>Upload Banner</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleSiteImageUpload('home', 'hero', 'bannerImage', e)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group-cms full-width">
                    <label>Hero Description</label>
                    <textarea 
                      rows="3"
                      value={cmsDraft.home.hero.description}
                      onChange={(e) => {
                        const updatedHero = { ...cmsDraft.home.hero, description: sanitizeInput(e.target.value) };
                        handleDraftChange('home.hero', updatedHero);
                      }}
                    ></textarea>
                  </div>
                </div>

                <hr className="divider-cms" />

                <h4>About Snapshot Text</h4>
                <div className="form-group-cms full-width">
                  <label>Section Title</label>
                  <input 
                    type="text" 
                    value={cmsDraft.home.aboutSnapshot.title}
                    onChange={(e) => {
                      const updatedAbout = { ...cmsDraft.home.aboutSnapshot, title: sanitizeInput(e.target.value) };
                      handleDraftChange('home.aboutSnapshot', updatedAbout);
                    }}
                  />
                </div>
                <div className="cms-list-section mt-3">
                  <label>Paragraphs</label>
                  {cmsDraft.home.aboutSnapshot.paragraphs.map((p, i) => (
                    <div key={i} className="cms-list-item block">
                      <textarea 
                        rows="3"
                        value={p}
                        onChange={(e) => handleDraftListChange('home.aboutSnapshot.paragraphs', i, e.target.value)}
                      ></textarea>
                      <button className="btn-list-delete" onClick={() => handleDraftListRemove('home.aboutSnapshot.paragraphs', i)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="btn-list-add" onClick={() => handleDraftListAdd('home.aboutSnapshot.paragraphs', 'New paragraph content...')}>
                    <Plus size={14} /> Add Paragraph
                  </button>
                </div>

                <hr className="divider-cms" />

                <h4>Why Choose Us Benefits</h4>
                <div className="benefits-cms-list">
                  {cmsDraft.home.benefits.map((benefit, i) => (
                    <div key={i} className="cms-sub-card">
                      <div className="cms-card-header">
                        <h5>Benefit #{i + 1}</h5>
                        <button className="btn-list-delete" onClick={() => handleDraftListRemove('home.benefits', i)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="form-grid">
                        <div className="form-group-cms">
                          <label>Benefit Title</label>
                          <input 
                            type="text" 
                            value={benefit.title}
                            onChange={(e) => {
                              const updatedBenefits = [...cmsDraft.home.benefits];
                              updatedBenefits[i] = { ...benefit, title: sanitizeInput(e.target.value) };
                              handleDraftChange('home.benefits', updatedBenefits);
                            }}
                          />
                        </div>
                        <div className="form-group-cms">
                          <label>Description</label>
                          <input 
                            type="text" 
                            value={benefit.description}
                            onChange={(e) => {
                              const updatedBenefits = [...cmsDraft.home.benefits];
                              updatedBenefits[i] = { ...benefit, description: sanitizeInput(e.target.value) };
                              handleDraftChange('home.benefits', updatedBenefits);
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group-cms mt-2 full-width">
                        <label>Icon Image Path / Upload (Optional)</label>
                        <div className="image-input-flex">
                          <input 
                            type="text" 
                            placeholder="e.g. /images/my-icon.png or paste base64 data"
                            value={benefit.icon || ''}
                            onChange={(e) => {
                              const updatedBenefits = [...cmsDraft.home.benefits];
                              updatedBenefits[i] = { ...benefit, icon: sanitizeInput(e.target.value) };
                              handleDraftChange('home.benefits', updatedBenefits);
                            }}
                          />
                          <span className="file-or-span">OR</span>
                          <div className="btn-file-wrapper">
                            <span>Upload Icon</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleBenefitIconUpload(i, e)}
                            />
                          </div>
                        </div>
                        {benefit.icon && (
                          <div className="uploaded-thumb-preview mt-2">
                            <span>Preview:</span>
                            <img src={benefit.icon} alt="Icon Preview" style={{ width: '40px', height: '40px', background: '#f5f5f5', padding: '4px', borderRadius: '4px', objectFit: 'contain' }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button className="btn-list-add mt-2" onClick={() => handleDraftListAdd('home.benefits', { title: 'New Benefit', description: 'Benefit detail...' })}>
                    <Plus size={14} /> Add Benefit Card
                  </button>
                </div>

                <hr className="divider-cms" />

                <h4>Home Footer CTA (Call to Action)</h4>
                <div className="form-grid">
                  <div className="form-group-cms full-width">
                    <label>CTA Title</label>
                    <input 
                      type="text" 
                      value={cmsDraft.home.cta?.title || ''}
                      onChange={(e) => {
                        const updatedCta = { ...(cmsDraft.home.cta || {}), title: sanitizeInput(e.target.value) };
                        handleDraftChange('home.cta', updatedCta);
                      }}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>CTA Description</label>
                    <input 
                      type="text" 
                      value={cmsDraft.home.cta?.description || ''}
                      onChange={(e) => {
                        const updatedCta = { ...(cmsDraft.home.cta || {}), description: sanitizeInput(e.target.value) };
                        handleDraftChange('home.cta', updatedCta);
                      }}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>CTA Background Image URL</label>
                    <div className="image-input-flex">
                      <input 
                        type="text" 
                        placeholder="e.g. /images/red_chilli.jpeg"
                        value={cmsDraft.home.cta?.bannerImage || ''}
                        onChange={(e) => {
                          const updatedCta = { ...(cmsDraft.home.cta || {}), bannerImage: sanitizeInput(e.target.value) };
                          handleDraftChange('home.cta', updatedCta);
                        }}
                      />
                      <span className="file-or-span">OR</span>
                      <div className="btn-file-wrapper">
                        <span>Upload Image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleSiteImageUpload('home', 'cta', 'bannerImage', e)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CMS Panel: About page settings */}
            {cmsSubTab === 'about' && (
              <div className="panel-card mt-4">
                <h3>About Us Page Content</h3>
                
                {renderHeaderEditorFields('about', 'About Us', 'Your Trusted Partner in Global Agricultural Trade', '/images/about_us_banner.png')}

                <h4>Company Overview</h4>
                <div className="form-group-cms full-width">
                  <label>Section Title</label>
                  <input 
                    type="text" 
                    value={cmsDraft.about.company.title}
                    onChange={(e) => {
                      const updatedCompany = { ...cmsDraft.about.company, title: sanitizeInput(e.target.value) };
                      handleDraftChange('about.company', updatedCompany);
                    }}
                  />
                </div>
                <div className="cms-list-section mt-3">
                  <label>Paragraphs</label>
                  {cmsDraft.about.company.paragraphs.map((p, i) => (
                    <div key={i} className="cms-list-item block">
                      <textarea 
                        rows="3"
                        value={p}
                        onChange={(e) => handleDraftListChange('about.company.paragraphs', i, e.target.value)}
                      ></textarea>
                      <button className="btn-list-delete" onClick={() => handleDraftListRemove('about.company.paragraphs', i)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="btn-list-add" onClick={() => handleDraftListAdd('about.company.paragraphs', 'New company description paragraph...')}>
                    <Plus size={14} /> Add Paragraph
                  </button>
                </div>

                <hr className="divider-cms" />

                <div className="form-grid">
                  <div className="cms-list-section">
                    <h4>Vision Points</h4>
                    {cmsDraft.about.vision.items.map((item, i) => (
                      <div key={i} className="cms-list-item">
                        <input 
                          type="text" 
                          value={item}
                          onChange={(e) => handleDraftListChange('about.vision.items', i, e.target.value)}
                        />
                        <button className="btn-list-delete" onClick={() => handleDraftListRemove('about.vision.items', i)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button className="btn-list-add" onClick={() => handleDraftListAdd('about.vision.items', 'Vision statement...')}>
                      <Plus size={14} /> Add Vision Point
                    </button>
                  </div>

                  <div className="cms-list-section">
                    <h4>Mission Points</h4>
                    {cmsDraft.about.mission.items.map((item, i) => (
                      <div key={i} className="cms-list-item">
                        <input 
                          type="text" 
                          value={item}
                          onChange={(e) => handleDraftListChange('about.mission.items', i, e.target.value)}
                        />
                        <button className="btn-list-delete" onClick={() => handleDraftListRemove('about.mission.items', i)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button className="btn-list-add" onClick={() => handleDraftListAdd('about.mission.items', 'Mission statement...')}>
                      <Plus size={14} /> Add Mission Point
                    </button>
                  </div>
                </div>

                <hr className="divider-cms" />

                <h4>Management Team</h4>
                <div className="team-cms-list">
                  {cmsDraft.about.managementTeam.map((member, i) => (
                    <div key={i} className="cms-sub-card">
                      <div className="cms-card-header">
                        <h5>Member #{i + 1}</h5>
                        <button className="btn-list-delete" onClick={() => handleDraftListRemove('about.managementTeam', i)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="form-grid">
                        <div className="form-group-cms">
                          <label>Full Name</label>
                          <input 
                            type="text" 
                            value={member.name}
                            onChange={(e) => {
                              const updatedTeam = [...cmsDraft.about.managementTeam];
                              updatedTeam[i] = { ...member, name: sanitizeInput(e.target.value) };
                              handleDraftChange('about.managementTeam', updatedTeam);
                            }}
                          />
                        </div>
                        <div className="form-group-cms">
                          <label>Role / Position</label>
                          <input 
                            type="text" 
                            value={member.role}
                            onChange={(e) => {
                              const updatedTeam = [...cmsDraft.about.managementTeam];
                              updatedTeam[i] = { ...member, role: sanitizeInput(e.target.value) };
                              handleDraftChange('about.managementTeam', updatedTeam);
                            }}
                          />
                        </div>
                        <div className="form-group-cms">
                          <label>Phone Number</label>
                          <input 
                            type="text" 
                            value={member.phone || ''}
                            onChange={(e) => {
                              const updatedTeam = [...cmsDraft.about.managementTeam];
                              updatedTeam[i] = { ...member, phone: sanitizeInput(e.target.value) };
                              handleDraftChange('about.managementTeam', updatedTeam);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="btn-list-add mt-2" onClick={() => handleDraftListAdd('about.managementTeam', { name: 'New Executive', role: 'Partner', phone: '+91 ' })}>
                    <Plus size={14} /> Add Team Member
                  </button>
                </div>
              </div>
            )}

            {/* CMS Panel: Exports settings */}
            {cmsSubTab === 'exports' && (
              <div className="panel-card mt-4">
                <h3>Exports Content</h3>
                
                {renderHeaderEditorFields('exportsImports', 'Exports & Imports', 'Connecting Global Markets with Quality Products', '/images/exports_imports_banner.jpg')}
                
                <div className="form-grid full-width">
                  <div className="cms-list-section full-width">
                    <h4>Export Destination Countries</h4>
                    <div className="countries-cms-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
                      {cmsDraft.exportsImports.exports.countries.map((country, i) => {
                        const name = typeof country === 'object' ? country.name : country;
                        const flag = typeof country === 'object' ? country.flag || '' : '';
                        const flagPreview = flag || getCountryFlagUrl(name);

                        return (
                          <div key={i} className="cms-sub-card" style={{ marginBottom: '0.2rem' }}>
                            <div className="cms-card-header">
                              <h5>Country #{i + 1}</h5>
                              <button className="btn-list-delete" onClick={() => handleDraftListRemove('exportsImports.exports.countries', i)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="form-grid">
                              <div className="form-group-cms">
                                <label>Country Name</label>
                                <input 
                                  type="text" 
                                  value={name}
                                  onChange={(e) => {
                                    const updatedList = [...cmsDraft.exportsImports.exports.countries];
                                    updatedList[i] = { name: sanitizeInput(e.target.value), flag };
                                    handleDraftChange('exportsImports.exports.countries', updatedList);
                                  }}
                                />
                              </div>
                              <div className="form-group-cms">
                                <label>Flag Image / Upload (Optional)</label>
                                <div className="image-input-flex">
                                  <input 
                                    type="text" 
                                    placeholder="e.g. /images/sri-lanka.png or base64"
                                    value={flag}
                                    onChange={(e) => {
                                      const updatedList = [...cmsDraft.exportsImports.exports.countries];
                                      updatedList[i] = { name, flag: sanitizeInput(e.target.value) };
                                      handleDraftChange('exportsImports.exports.countries', updatedList);
                                    }}
                                  />
                                  <span className="file-or-span">OR</span>
                                  <div className="btn-file-wrapper">
                                    <span>Upload</span>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={(e) => handleCountryFlagUpload(i, e)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            {flagPreview && (
                              <div className="uploaded-thumb-preview mt-2">
                                <span>Preview:</span>
                                <img src={flagPreview} alt="Flag Preview" style={{ width: '32px', height: '32px', background: '#f5f5f5', padding: '2px', borderRadius: '50%', objectFit: 'cover' }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button className="btn-list-add mt-3" onClick={() => handleDraftListAdd('exportsImports.exports.countries', { name: 'New Country', flag: '' })}>
                      <Plus size={14} /> Add Country
                    </button>
                  </div>

                  <div className="cms-list-section">
                    <h4>Export Products Summary</h4>
                    {cmsDraft.exportsImports.exports.products.map((p, i) => (
                      <div key={i} className="cms-list-item">
                        <input 
                          type="text" 
                          value={p}
                          onChange={(e) => handleDraftListChange('exportsImports.exports.products', i, e.target.value)}
                        />
                        <button className="btn-list-delete" onClick={() => handleDraftListRemove('exportsImports.exports.products', i)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button className="btn-list-add" onClick={() => handleDraftListAdd('exportsImports.exports.products', 'Product summary line...')}>
                      <Plus size={14} /> Add Line
                    </button>
                  </div>
                </div>

                <hr className="divider-cms" />

                <h4>Partnership CTA Section</h4>
                <div className="form-grid">
                  <div className="form-group-cms full-width">
                    <label>CTA Title</label>
                    <input 
                      type="text" 
                      value={cmsDraft.exportsImports.partnership?.title || ''}
                      onChange={(e) => {
                        const updatedCta = { ...(cmsDraft.exportsImports.partnership || {}), title: sanitizeInput(e.target.value) };
                        handleDraftChange('exportsImports.partnership', updatedCta);
                      }}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>CTA Description</label>
                    <input 
                      type="text" 
                      value={cmsDraft.exportsImports.partnership?.description || ''}
                      onChange={(e) => {
                        const updatedCta = { ...(cmsDraft.exportsImports.partnership || {}), description: sanitizeInput(e.target.value) };
                        handleDraftChange('exportsImports.partnership', updatedCta);
                      }}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>CTA Background Image URL</label>
                    <div className="image-input-flex">
                      <input 
                        type="text" 
                        placeholder="e.g. /images/Coriander_powder.webp"
                        value={cmsDraft.exportsImports.partnership?.bannerImage || ''}
                        onChange={(e) => {
                          const updatedCta = { ...(cmsDraft.exportsImports.partnership || {}), bannerImage: sanitizeInput(e.target.value) };
                          handleDraftChange('exportsImports.partnership', updatedCta);
                        }}
                      />
                      <span className="file-or-span">OR</span>
                      <div className="btn-file-wrapper">
                        <span>Upload Image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleSiteImageUpload('exportsImports', 'partnership', 'bannerImage', e)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CMS Panel: Quality & Ethics settings */}
            {cmsSubTab === 'quality' && (
              <div className="panel-card mt-4">
                <h3>Quality, Packing &amp; Ethics Content</h3>
                
                {renderHeaderEditorFields('quality', 'Quality & Code of Conduct', 'Committed to Excellence and Ethical Business Practices', '/images/Cumin_Seeds.jpg')}
                
                <h4>Quality Assurance Paragraphs</h4>
                <div className="cms-list-section">
                  {cmsDraft.quality.assurance.paragraphs.map((p, i) => (
                    <div key={i} className="cms-list-item block">
                      <textarea 
                        rows="3"
                        value={p}
                        onChange={(e) => handleDraftListChange('quality.assurance.paragraphs', i, e.target.value)}
                      ></textarea>
                      <button className="btn-list-delete" onClick={() => handleDraftListRemove('quality.assurance.paragraphs', i)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="btn-list-add" onClick={() => handleDraftListAdd('quality.assurance.paragraphs', 'Quality benchmark detail...')}>
                    <Plus size={14} /> Add Paragraph
                  </button>
                </div>

                <hr className="divider-cms" />

                <h4>Quality Standards List</h4>
                <div className="cms-list-section">
                  {cmsDraft.quality.qualityStandards.map((std, i) => (
                    <div key={i} className="cms-list-item">
                      <input 
                        type="text" 
                        value={std}
                        onChange={(e) => handleDraftListChange('quality.qualityStandards', i, e.target.value)}
                      />
                      <button className="btn-list-delete" onClick={() => handleDraftListRemove('quality.qualityStandards', i)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button className="btn-list-add" onClick={() => handleDraftListAdd('quality.qualityStandards', 'Standard clause...')}>
                    <Plus size={14} /> Add Standard
                  </button>
                </div>

                <hr className="divider-cms" />

                <h4>Detailed Text Blocks</h4>
                <div className="form-grid">
                  <div className="form-group-cms">
                    <label>Packing Standards Description</label>
                    <textarea 
                      rows="3"
                      value={cmsDraft.quality.packing.description}
                      onChange={(e) => {
                        const updatedPacking = { ...cmsDraft.quality.packing, description: sanitizeInput(e.target.value) };
                        handleDraftChange('quality.packing', updatedPacking);
                      }}
                    ></textarea>
                  </div>
                  <div className="form-group-cms">
                    <label>Testing &amp; Certifications Description</label>
                    <textarea 
                      rows="3"
                      value={cmsDraft.quality.testing.description}
                      onChange={(e) => {
                        const updatedTesting = { ...cmsDraft.quality.testing, description: sanitizeInput(e.target.value) };
                        handleDraftChange('quality.testing', updatedTesting);
                      }}
                    ></textarea>
                  </div>
                </div>

                <hr className="divider-cms" />

                <h4>Code of Conduct Rules</h4>
                <div className="conduct-cms-list">
                  {cmsDraft.quality.codeOfConduct.items.map((item, i) => (
                    <div key={i} className="cms-sub-card">
                      <div className="cms-card-header">
                        <h5>Conduct Rule #{i + 1}</h5>
                        <button className="btn-list-delete" onClick={() => handleDraftListRemove('quality.codeOfConduct.items', i)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="form-grid">
                        <div className="form-group-cms">
                          <label>Rule Title</label>
                          <input 
                            type="text" 
                            value={item.title}
                            onChange={(e) => {
                              const updatedItems = [...cmsDraft.quality.codeOfConduct.items];
                              updatedItems[i] = { ...item, title: sanitizeInput(e.target.value) };
                              const updatedCodeOfConduct = { ...cmsDraft.quality.codeOfConduct, items: updatedItems };
                              handleDraftChange('quality.codeOfConduct', updatedCodeOfConduct);
                            }}
                          />
                        </div>
                        <div className="form-group-cms">
                          <label>Rule Description</label>
                          <input 
                            type="text" 
                            value={item.description}
                            onChange={(e) => {
                              const updatedItems = [...cmsDraft.quality.codeOfConduct.items];
                              updatedItems[i] = { ...item, description: sanitizeInput(e.target.value) };
                              const updatedCodeOfConduct = { ...cmsDraft.quality.codeOfConduct, items: updatedItems };
                              handleDraftChange('quality.codeOfConduct', updatedCodeOfConduct);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="btn-list-add mt-2" onClick={() => handleDraftListAdd('quality.codeOfConduct.items', { title: 'New Rule', description: 'Rule description...' })}>
                    <Plus size={14} /> Add Conduct Rule
                  </button>
                </div>

                <hr className="divider-cms" />

                <h4>Ethics Statement Section</h4>
                <div className="form-grid">
                  <div className="form-group-cms full-width">
                    <label>Ethics Statement Title</label>
                    <input 
                      type="text" 
                      value={cmsDraft.quality.ethics?.title || ''}
                      onChange={(e) => {
                        const updatedEthics = { ...(cmsDraft.quality.ethics || {}), title: sanitizeInput(e.target.value) };
                        handleDraftChange('quality.ethics', updatedEthics);
                      }}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>Background Image URL</label>
                    <div className="image-input-flex">
                      <input 
                        type="text" 
                        placeholder="e.g. /images/Fenugreek_Powder.webp"
                        value={cmsDraft.quality.ethics?.bannerImage || ''}
                        onChange={(e) => {
                          const updatedEthics = { ...(cmsDraft.quality.ethics || {}), bannerImage: sanitizeInput(e.target.value) };
                          handleDraftChange('quality.ethics', updatedEthics);
                        }}
                      />
                      <span className="file-or-span">OR</span>
                      <div className="btn-file-wrapper">
                        <span>Upload Image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleSiteImageUpload('quality', 'ethics', 'bannerImage', e)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CMS Panel: Products page content */}
            {cmsSubTab === 'products' && (
              <div className="panel-card mt-4">
                <h3>Products Page Content</h3>
                {renderHeaderEditorFields('products', 'Our Products', 'Premium Agricultural Commodities for Global Markets', '/images/Cumin_Seeds.jpg')}
                <p className="hint-text" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  Note: Individual products can be added, updated, or removed using the <strong>Products CRUD</strong> tab on the left sidebar.
                </p>

                <hr className="divider-cms" />

                <h4>Products CTA Section</h4>
                <div className="form-group-cms full-width">
                  <label>CTA Background Image URL</label>
                  <div className="image-input-flex">
                    <input 
                      type="text" 
                      placeholder="e.g. /images/turmeric_powder.jpg"
                      value={cmsDraft.products?.cta?.bannerImage || ''}
                      onChange={(e) => {
                        const updatedCta = { ...(cmsDraft.products?.cta || {}), bannerImage: sanitizeInput(e.target.value) };
                        handleDraftChange('products.cta', updatedCta);
                      }}
                    />
                    <span className="file-or-span">OR</span>
                    <div className="btn-file-wrapper">
                      <span>Upload Image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleSiteImageUpload('products', 'cta', 'bannerImage', e)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CMS Panel: Contact page content */}
            {cmsSubTab === 'contact' && (
              <div className="panel-card mt-4">
                <h3>Contact Page Content</h3>
                {renderHeaderEditorFields('contact', 'Contact Us', 'Get in Touch with Our Global Trade Experts', '/images/Cumin_Seeds.jpg')}
                <p className="hint-text" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  Note: Main contact details like email, phone, and address are configured under the <strong>General</strong> settings tab.
                </p>
              </div>
            )}

            {/* CMS Panel: Blogs list */}
            {cmsSubTab === 'blogs' && (
              <div className="panel-card mt-4">
                <h3>Blog Posts Manager</h3>
                <div className="blogs-cms-list">
                  {cmsDraft.blog.posts.map((post, i) => (
                    <div key={i} className="cms-sub-card">
                      <div className="cms-card-header">
                        <h5>Blog #{post.id} ({post.date})</h5>
                        <button className="btn-list-delete" onClick={() => handleDraftListRemove('blog.posts', i)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="form-grid">
                        <div className="form-group-cms">
                          <label>Category Label</label>
                          <input 
                            type="text" 
                            value={post.category}
                            onChange={(e) => {
                              const updatedPosts = [...cmsDraft.blog.posts];
                              updatedPosts[i] = { ...post, category: sanitizeInput(e.target.value) };
                              handleDraftChange('blog.posts', updatedPosts);
                            }}
                          />
                        </div>
                        <div className="form-group-cms">
                          <label>Publish Date</label>
                          <input 
                            type="text" 
                            value={post.date}
                            onChange={(e) => {
                              const updatedPosts = [...cmsDraft.blog.posts];
                              updatedPosts[i] = { ...post, date: sanitizeInput(e.target.value) };
                              handleDraftChange('blog.posts', updatedPosts);
                            }}
                          />
                        </div>
                        <div className="form-group-cms full-width">
                          <label>Blog Title</label>
                          <input 
                            type="text" 
                            value={post.title}
                            onChange={(e) => {
                              const updatedPosts = [...cmsDraft.blog.posts];
                              updatedPosts[i] = { ...post, title: sanitizeInput(e.target.value) };
                              handleDraftChange('blog.posts', updatedPosts);
                            }}
                          />
                        </div>
                        <div className="form-group-cms full-width">
                          <label>Snippet Excerpt</label>
                          <textarea 
                            rows="2"
                            value={post.excerpt}
                            onChange={(e) => {
                              const updatedPosts = [...cmsDraft.blog.posts];
                              updatedPosts[i] = { ...post, excerpt: sanitizeInput(e.target.value) };
                              handleDraftChange('blog.posts', updatedPosts);
                            }}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="btn-list-add mt-3" onClick={() => handleDraftListAdd('blog.posts', { id: Date.now(), category: 'News', title: 'New Article', excerpt: 'Snippet...', date: new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}), readTime: '3 min read' })}>
                    <Plus size={14} /> Create Blog Post
                  </button>
                </div>
              </div>
            )}

            {/* CMS Panel: Careers Page */}
            {cmsSubTab === 'careers' && (
              <div className="panel-card mt-4">
                <h3>Careers Page Settings</h3>
                
                <h4>Why Work With Us Introduction</h4>
                <div className="form-grid">
                  <div className="form-group-cms">
                    <label>Header Title</label>
                    <input 
                      type="text" 
                      value={cmsDraft.careers.intro.title}
                      onChange={(e) => {
                        const updatedIntro = { ...cmsDraft.careers.intro, title: sanitizeInput(e.target.value) };
                        handleDraftChange('careers.intro', updatedIntro);
                      }}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>Intro Paragraph</label>
                    <textarea 
                      rows="3"
                      value={cmsDraft.careers.intro.description}
                      onChange={(e) => {
                        const updatedIntro = { ...cmsDraft.careers.intro, description: sanitizeInput(e.target.value) };
                        handleDraftChange('careers.intro', updatedIntro);
                      }}
                    ></textarea>
                  </div>
                </div>

                <hr className="divider-cms" />

                <h4>Job Openings</h4>
                <div className="openings-cms-list">
                  {cmsDraft.careers.openings.map((job, i) => (
                    <div key={i} className="cms-sub-card">
                      <div className="cms-card-header">
                        <h5>Job: {job.title}</h5>
                        <button className="btn-list-delete" onClick={() => handleDraftListRemove('careers.openings', i)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="form-grid">
                        <div className="form-group-cms">
                          <label>Job Title</label>
                          <input 
                            type="text" 
                            value={job.title}
                            onChange={(e) => {
                              const updatedOpenings = [...cmsDraft.careers.openings];
                              updatedOpenings[i] = { ...job, title: sanitizeInput(e.target.value) };
                              handleDraftChange('careers.openings', updatedOpenings);
                            }}
                          />
                        </div>
                        <div className="form-group-cms">
                          <label>Department</label>
                          <input 
                            type="text" 
                            value={job.department}
                            onChange={(e) => {
                              const updatedOpenings = [...cmsDraft.careers.openings];
                              updatedOpenings[i] = { ...job, department: sanitizeInput(e.target.value) };
                              handleDraftChange('careers.openings', updatedOpenings);
                            }}
                          />
                        </div>
                        <div className="form-group-cms">
                          <label>Location</label>
                          <input 
                            type="text" 
                            value={job.location}
                            onChange={(e) => {
                              const updatedOpenings = [...cmsDraft.careers.openings];
                              updatedOpenings[i] = { ...job, location: sanitizeInput(e.target.value) };
                              handleDraftChange('careers.openings', updatedOpenings);
                            }}
                          />
                        </div>
                        <div className="form-group-cms">
                          <label>Job Type (e.g., Full-Time)</label>
                          <input 
                            type="text" 
                            value={job.type}
                            onChange={(e) => {
                              const updatedOpenings = [...cmsDraft.careers.openings];
                              updatedOpenings[i] = { ...job, type: sanitizeInput(e.target.value) };
                              handleDraftChange('careers.openings', updatedOpenings);
                            }}
                          />
                        </div>
                        <div className="form-group-cms full-width">
                          <label>Brief Description</label>
                          <textarea 
                            rows="2"
                            value={job.description}
                            onChange={(e) => {
                              const updatedOpenings = [...cmsDraft.careers.openings];
                              updatedOpenings[i] = { ...job, description: sanitizeInput(e.target.value) };
                              handleDraftChange('careers.openings', updatedOpenings);
                            }}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="btn-list-add mt-2" onClick={() => handleDraftListAdd('careers.openings', { id: Date.now(), title: 'New Role', department: 'Operations', location: 'Rajkot', type: 'Full-Time', description: 'Role summary details...' })}>
                    <Plus size={14} /> Add Job Opening
                  </button>
                </div>

                <hr className="divider-cms" />

                <h4>Careers CTA Section</h4>
                <div className="form-grid">
                  <div className="form-group-cms full-width">
                    <label>CTA Title</label>
                    <input 
                      type="text" 
                      value={cmsDraft.careers.cta?.title || ''}
                      onChange={(e) => {
                        const updatedCta = { ...(cmsDraft.careers.cta || {}), title: sanitizeInput(e.target.value) };
                        handleDraftChange('careers.cta', updatedCta);
                      }}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>CTA Description</label>
                    <input 
                      type="text" 
                      value={cmsDraft.careers.cta?.description || ''}
                      onChange={(e) => {
                        const updatedCta = { ...(cmsDraft.careers.cta || {}), description: sanitizeInput(e.target.value) };
                        handleDraftChange('careers.cta', updatedCta);
                      }}
                    />
                  </div>
                  <div className="form-group-cms full-width">
                    <label>CTA Background Image URL</label>
                    <div className="image-input-flex">
                      <input 
                        type="text" 
                        placeholder="e.g. /images/Cumin_Seeds.jpg"
                        value={cmsDraft.careers.cta?.bannerImage || ''}
                        onChange={(e) => {
                          const updatedCta = { ...(cmsDraft.careers.cta || {}), bannerImage: sanitizeInput(e.target.value) };
                          handleDraftChange('careers.cta', updatedCta);
                        }}
                      />
                      <span className="file-or-span">OR</span>
                      <div className="btn-file-wrapper">
                        <span>Upload Image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleSiteImageUpload('careers', 'cta', 'bannerImage', e)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CMS Panel: Gallery settings */}
            {cmsSubTab === 'gallery' && (
              <div className="panel-card mt-4">
                <h3>Gallery Showcase Items</h3>
                <div className="form-grid">
                  {cmsDraft.gallery.items.map((item, i) => (
                    <div key={item.id} className="cms-sub-card">
                      <div className="cms-card-header">
                        <h5>Item #{i + 1}</h5>
                        <button className="btn-list-delete" onClick={() => handleDraftListRemove('gallery.items', i)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="form-grid">
                        <div className="form-group-cms">
                          <label>Showcase Title</label>
                          <input 
                            type="text" 
                            value={item.title}
                            onChange={(e) => {
                              const updatedItems = [...cmsDraft.gallery.items];
                              updatedItems[i] = { ...item, title: sanitizeInput(e.target.value) };
                              handleDraftChange('gallery.items', updatedItems);
                            }}
                          />
                        </div>
                        <div className="form-group-cms">
                          <label>Emoji Icon</label>
                          <input 
                            type="text" 
                            value={item.emoji}
                            onChange={(e) => {
                              const updatedItems = [...cmsDraft.gallery.items];
                              updatedItems[i] = { ...item, emoji: sanitizeInput(e.target.value) };
                              handleDraftChange('gallery.items', updatedItems);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-list-add mt-3" onClick={() => handleDraftListAdd('gallery.items', { id: Date.now(), title: 'Showcase Product', emoji: '🥜' })}>
                  <Plus size={14} /> Add Showcase Card
                </button>
              </div>
            )}

            {/* CMS Panel: Harvest Chart settings */}
            {cmsSubTab === 'harvest' && (
              <div className="panel-card mt-4">
                <h3>Monthly Harvest Schedule</h3>
                <div className="harvest-cms-grid">
                  {cmsDraft.harvest.months.map((item, i) => (
                    <div key={i} className="harvest-month-cms-card">
                      <strong>{item.month}</strong>
                      <div className="cms-list-section mt-2">
                        {item.products.map((prod, pIdx) => (
                          <div key={pIdx} className="cms-list-item mini">
                            <input 
                              type="text" 
                              value={prod}
                              onChange={(e) => {
                                const updatedProducts = [...cmsDraft.harvest.months[i].products];
                                updatedProducts[pIdx] = sanitizeInput(e.target.value);
                                const updatedMonth = { ...cmsDraft.harvest.months[i], products: updatedProducts };
                                const updatedMonths = [...cmsDraft.harvest.months];
                                updatedMonths[i] = updatedMonth;
                                handleDraftChange('harvest.months', updatedMonths);
                              }}
                            />
                            <button 
                              className="btn-list-delete mini" 
                              onClick={() => {
                                const updatedProducts = cmsDraft.harvest.months[i].products.filter((_, idx) => idx !== pIdx);
                                const updatedMonth = { ...cmsDraft.harvest.months[i], products: updatedProducts };
                                const updatedMonths = [...cmsDraft.harvest.months];
                                updatedMonths[i] = updatedMonth;
                                handleDraftChange('harvest.months', updatedMonths);
                              }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <button 
                          className="btn-list-add mini"
                          onClick={() => {
                            const updatedProducts = [...cmsDraft.harvest.months[i].products, 'New Crop'];
                            const updatedMonth = { ...cmsDraft.harvest.months[i], products: updatedProducts };
                            const updatedMonths = [...cmsDraft.harvest.months];
                            updatedMonths[i] = updatedMonth;
                            handleDraftChange('harvest.months', updatedMonths);
                          }}
                        >
                          + Add Crop
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* MENU & NAVIGATION MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="admin-panel fade-in">
            <div className="panel-header">
              <h2>Menu Items</h2>
              <button className="btn-primary" onClick={() => {
                setEditingMenuId(null);
                setMenuForm({ label: '', page: '', external_url: '', parent_id: '', is_visible: 1 });
                setIsMenuModalOpen(true);
              }}>
                <Plus size={16} /> Add Menu Item
              </button>
            </div>
            <div className="panel-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Label</th>
                    <th>Link / Page</th>
                    <th>Visibility</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item, index) => (
                    <Fragment key={item.id}>
                      <tr>
                        <td>
                          <div className="order-actions">
                            <button className="btn-icon-small" onClick={() => handleMenuReorder('up', index, menuItems)} disabled={index === 0}><MoveUp size={14}/></button>
                            <button className="btn-icon-small" onClick={() => handleMenuReorder('down', index, menuItems)} disabled={index === menuItems.length - 1}><MoveDown size={14}/></button>
                          </div>
                        </td>
                        <td><strong>{item.label}</strong></td>
                        <td>{item.external_url || `Page: ${item.page}`}</td>
                        <td>
                          <span className={`status-badge ${item.is_visible ? 'status-active' : 'status-inactive'}`}>
                            {item.is_visible ? 'Visible' : 'Hidden'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button className="btn-icon" onClick={() => {
                            setEditingMenuId(item.id);
                            setMenuForm({
                              label: item.label,
                              page: item.page || '',
                              external_url: item.external_url || '',
                              parent_id: '',
                              is_visible: item.is_visible
                            });
                            setIsMenuModalOpen(true);
                          }}>
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon text-danger" onClick={() => handleMenuDelete(item.id)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                      {/* Render Children (Sub-menus) */}
                      {item.children && item.children.map((child, childIndex) => (
                        <tr key={child.id} className="submenu-row">
                          <td>
                            <div className="order-actions" style={{ marginLeft: '1rem' }}>
                              <button className="btn-icon-small" onClick={() => handleMenuReorder('up', childIndex, item.children)} disabled={childIndex === 0}><MoveUp size={14}/></button>
                              <button className="btn-icon-small" onClick={() => handleMenuReorder('down', childIndex, item.children)} disabled={childIndex === item.children.length - 1}><MoveDown size={14}/></button>
                            </div>
                          </td>
                          <td style={{ paddingLeft: '2rem' }}>↳ {child.label}</td>
                          <td>{child.external_url || `Page: ${child.page}`}</td>
                          <td>
                            <span className={`status-badge ${child.is_visible ? 'status-active' : 'status-inactive'}`}>
                              {child.is_visible ? 'Visible' : 'Hidden'}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button className="btn-icon" onClick={() => {
                              setEditingMenuId(child.id);
                              setMenuForm({
                                label: child.label,
                                page: child.page || '',
                                external_url: child.external_url || '',
                                parent_id: item.id,
                                is_visible: child.is_visible
                              });
                              setIsMenuModalOpen(true);
                            }}>
                              <Edit size={16} />
                            </button>
                            <button className="btn-icon text-danger" onClick={() => handleMenuDelete(child.id)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                  {menuItems.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">No menu items found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Menu Modal */}
            {isMenuModalOpen && (
              <div className="modal-backdrop">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2>{editingMenuId ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
                    <button className="modal-close" onClick={() => setIsMenuModalOpen(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleMenuSave} className="modal-body">
                    <div className="form-group">
                      <label>Label / Title *</label>
                      <input 
                        type="text" 
                        required 
                        value={menuForm.label} 
                        onChange={e => setMenuForm({...menuForm, label: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Internal Page Route (e.g. "home", "about", "products")</label>
                      <input 
                        type="text" 
                        value={menuForm.page} 
                        onChange={e => setMenuForm({...menuForm, page: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Or External URL (overrides internal page)</label>
                      <input 
                        type="text" 
                        placeholder="https://..."
                        value={menuForm.external_url} 
                        onChange={e => setMenuForm({...menuForm, external_url: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Parent Menu (For Dropdowns)</label>
                      <select 
                        value={menuForm.parent_id || ''} 
                        onChange={e => setMenuForm({...menuForm, parent_id: e.target.value})}
                      >
                        <option value="">-- None (Top Level) --</option>
                        {menuItems.filter(item => item.id !== editingMenuId).map(item => (
                          <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={menuForm.is_visible} 
                          onChange={e => setMenuForm({...menuForm, is_visible: e.target.checked ? 1 : 0})}
                        />
                        Visible on website
                      </label>
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="btn-secondary" onClick={() => setIsMenuModalOpen(false)}>Cancel</button>
                      <button type="submit" className="btn-primary">Save Menu Item</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- PRODUCTS CRUD TAB --- */}
        {activeTab === 'products' && (
          <div className="tab-pane">
            <div className="filters-bar">
              <div className="search-box-admin">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="category-filter-select"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button className="btn-add-product" onClick={() => handleOpenProductModal()}>
                <Plus size={16} /> Add Product
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="panel-card empty-state">
                <p>No products match your search/filter criteria.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Featured</th>
                      <th>Details</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.image} alt={p.name} className="table-thumb" />
                        </td>
                        <td>
                          <div className="table-product-name">{p.name}</div>
                          <div className="table-product-desc">{p.description.substring(0, 75)}...</div>
                        </td>
                        <td>
                          <span className="badge-cat">{p.categoryName}</span>
                        </td>
                        <td>
                          <span className={p.featured ? 'badge-featured active' : 'badge-featured'}>
                            {p.featured ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          <div className="table-meta-counts">
                            <span>Specs: <strong>{p.specifications?.length || 0}</strong></span>
                            <span>Blocks: <strong>{p.details?.length || 0}</strong></span>
                          </div>
                        </td>
                        <td>
                          <div className="actions-wrapper">
                            <button className="btn-action edit" onClick={() => handleOpenProductModal(p)} title="Edit">
                              <Edit3 size={16} />
                            </button>
                            <button className="btn-action delete" onClick={() => handleDeleteProduct(p)} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- CATEGORIES TAB --- */}
        {activeTab === 'categories' && (
          <div className="tab-pane">
            <div className="categories-grid-container">
              
              <div className="panel-card categories-form-card">
                <h3>{categoryModal.editId ? 'Edit Category' : 'Create Category'}</h3>
                <form onSubmit={handleSaveCategory}>
                  <div className="form-group-cms">
                    <label>Category Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Peanut Butter" 
                      value={categoryModal.name}
                      onChange={(e) => setCategoryModal(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-actions mt-3">
                    <button type="submit" className="btn-save-cat">
                      {categoryModal.editId ? 'Update Category' : 'Create Category'}
                    </button>
                    {categoryModal.editId && (
                      <button 
                        type="button" 
                        className="btn-cancel-cat" 
                        onClick={() => setCategoryModal({ show: false, editId: null, name: '' })}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="panel-card categories-list-card">
                <h3>Existing Categories</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Slug ID</th>
                      <th>Category Name</th>
                      <th>Products Count</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(c => (
                      <tr key={c.id}>
                        <td><code>{c.id}</code></td>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.products?.length || 0} products</td>
                        <td>
                          <div className="actions-wrapper">
                            <button 
                              className="btn-action edit" 
                              onClick={() => setCategoryModal({ show: true, editId: c.id, name: c.name })}
                              title="Rename"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              className="btn-action delete" 
                              onClick={() => handleDeleteCategory(c.id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* --- INQUIRIES TAB --- */}
        {activeTab === 'inquiries' && (
          <div className="tab-pane">
            <div className="inquiry-actions-bar">
              <span>Customer Message Log ({inquiries.length} received)</span>
              <button className="btn-csv-export" onClick={handleExportInquiriesCSV}>
                <Download size={16} /> Export CSV
              </button>
            </div>

            {inquiries.length === 0 ? (
              <div className="panel-card empty-state">
                <p>No customer inquiries logged yet.</p>
              </div>
            ) : (
              <div className="inquiries-panel-list">
                {inquiries.map(inq => (
                  <InquiryCard 
                    key={inq.id} 
                    inquiry={inq} 
                    onStatusChange={handleInquiryStatusChange} 
                    onDelete={handleDeleteInquiry} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- SYSTEM SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div className="tab-pane">
            <div className="dashboard-grid">
              <div className="panel-card">
                <h3>Update Admin Credentials</h3>
                <form onSubmit={handleUpdateCredentials}>
                  <div className="form-group-cms">
                    <label>Admin Username *</label>
                    <input 
                      type="text" 
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      required
                    />
                  </div>
                  
                  <div className="form-group-cms mt-3">
                    <label>Current Password (Required to confirm any changes) *</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPasswords ? "text" : "password"}
                        value={passwordsForm.current}
                        onChange={(e) => setPasswordsForm(prev => ({ ...prev, current: e.target.value }))}
                        required
                        style={{ paddingRight: '40px', width: '100%' }}
                      />
                      <button type="button" onClick={() => setShowPasswords(!showPasswords)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="divider-modal" style={{ margin: '1.5rem 0 1rem 0' }}></div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '750', color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>Change Password (Optional)</h4>
                  
                  <div className="form-group-cms mt-2">
                    <label>New Password (Leave blank to keep current password)</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPasswords ? "text" : "password"}
                        value={passwordsForm.new}
                        onChange={(e) => setPasswordsForm(prev => ({ ...prev, new: e.target.value }))}
                        style={{ paddingRight: '40px', width: '100%' }}
                      />
                      <button type="button" onClick={() => setShowPasswords(!showPasswords)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group-cms mt-3">
                    <label>Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPasswords ? "text" : "password"}
                        value={passwordsForm.confirm}
                        onChange={(e) => setPasswordsForm(prev => ({ ...prev, confirm: e.target.value }))}
                        style={{ paddingRight: '40px', width: '100%' }}
                      />
                      <button type="button" onClick={() => setShowPasswords(!showPasswords)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <button type="submit" className="btn-change-password mt-4" style={{ background: 'var(--primary-navy)', color: '#ffffff' }}>
                    Save Credentials
                  </button>
                </form>
              </div>

              <div className="panel-card panel-warning">
                <h3>Dangerous Operations</h3>
                <p>Use these settings to clear database states or roll back configs.</p>
                
                <div className="danger-action-box mt-4">
                  <div>
                    <h5>Reset Database to Defaults</h5>
                    <p>This reverts all text, tags, blogs, jobs, and products to original settings, clearing custom rebranding.</p>
                  </div>
                  <button className="btn-reset-db" onClick={handleResetSystem}>
                    Reset Website
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ADMIN USERS TAB --- */}
        {activeTab === 'admin_users' && (
          <div className="tab-pane">
            <div className="panel-card">
              <div className="admin-flex-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3>Admin Access Control (RBAC)</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Manage administrative accounts and restrict their access to specific dashboard modules.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsAddingAdmin(!isAddingAdmin)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isAddingAdmin ? <X size={16} /> : <Plus size={16} />} {isAddingAdmin ? 'Cancel' : 'Create New Admin'}
                </button>
              </div>

              {isAddingAdmin && (
                <div className="cms-sub-card mb-4" style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4>Create New Administrator</h4>
                  <form onSubmit={handleAddAdmin} className="form-grid mt-4">
                    <div className="form-group-cms">
                      <label>Email Address</label>
                      <input 
                        type="text" 
                        value={newAdmin.username} 
                        onChange={e => setNewAdmin({...newAdmin, username: e.target.value.toLowerCase().trim()})} 
                        placeholder="e.g. admin@sangath.com" 
                        required 
                      />
                    </div>
                    <div className="form-group-cms">
                      <label>Temporary Password</label>
                      <input 
                        type="text" 
                        value={newAdmin.password} 
                        onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} 
                        placeholder="Assign a secure password" 
                        required 
                        minLength={6}
                      />
                    </div>
                    <div className="form-group-cms" style={{ gridColumn: '1 / -1' }}>
                      <label>Assign Role / Permissions</label>
                      <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}>
                        <option value="Super Admin">Super Admin (Unrestricted Access, Can Manage Admins)</option>
                        <option value="Content Manager">Content Manager (Access to CMS and Categories only)</option>
                        <option value="Product Manager">Product Manager (Access to Products and Categories only)</option>
                        <option value="Sales/Support Rep">Sales/Support Rep (Access to Inquiries only)</option>
                        <option value="Viewer">Viewer (Read-only Access to All Sections)</option>
                      </select>
                    </div>
                    <div className="form-group-cms" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                      <button type="submit" className="btn-save-publish" style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Check size={16} /> Create Account
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <table className="admin-table mt-4">
                <thead>
                  <tr>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Permissions Granted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsersList.map(admin => (
                    <tr key={admin.id}>
                      <td style={{ fontWeight: '600' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={16} style={{ color: admin.role === 'Super Admin' ? 'var(--spice-gold)' : 'var(--text-muted)' }} />
                          {admin.username} {admin.username === adminUsername && <span className="badge-success" style={{ padding: '2px 6px', fontSize: '0.7rem', marginLeft: '6px' }}>You</span>}
                        </div>
                      </td>
                      <td>{admin.role}</td>
                      <td>
                        {admin.permissions?.includes('all') ? (
                          <span className="badge-success">Full System Access</span>
                        ) : (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {(admin.permissions || []).map(p => (
                              <span key={p} style={{ background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{p}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn-action delete" 
                          onClick={() => handleDeleteAdmin(admin.id)}
                          title="Delete Admin"
                          disabled={admin.username === adminUsername}
                          style={{ opacity: admin.username === adminUsername ? 0.3 : 1 }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* --- FLOATING SAVE / DISCARD BANNER FOR CMS EDITS --- */}
      {activeTab === 'cms' && hasCmsChanges && (
        <div className="cms-floating-save-bar animate-slide-up">
          <div className="save-bar-content">
            <AlertCircle size={20} className="save-bar-icon" />
            <span>You have unsaved changes in your Page Content draft.</span>
            <div className="save-bar-actions">
              <button className="btn-save-publish" onClick={handlePublishCmsChanges}>
                Save &amp; Publish Changes
              </button>
              <button className="btn-discard-draft" onClick={handleDiscardCmsChanges}>
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION DIALOG MODAL --- */}
      {confirmModal.show && (
        <div className="modal-overlay">
          <div className="admin-modal confirm-modal animate-slide-up">
            <div className="modal-header">
              <h3>{confirmModal.title}</h3>
              <button onClick={() => setConfirmModal({ show: false })} className="modal-close-x">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>{confirmModal.message}</p>
              {confirmModal.typeInput && (
                <div className="modal-confirm-input-group mt-3">
                  <label>Type <strong>{confirmModal.typeInput}</strong> below to confirm:</label>
                  <input 
                    type="text" 
                    value={confirmInput} 
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder={confirmModal.typeInput}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn-modal-confirm danger"
                disabled={confirmModal.typeInput && confirmInput !== confirmModal.typeInput}
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ show: false });
                  setConfirmInput('');
                }}
              >
                Confirm Action
              </button>
              <button className="btn-modal-cancel" onClick={() => { setConfirmModal({ show: false }); setConfirmInput(''); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PRODUCT CRUD MODAL --- */}
      {productModal.show && (
        <div className="modal-overlay">
          <div className="admin-modal product-modal animate-slide-up">
            <div className="modal-header">
              <h3>{productModal.editId ? 'Edit Product Catalog Details' : 'Add New Product to Catalog'}</h3>
              <button onClick={() => setProductModal({ show: false })} className="modal-close-x">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
              <div className="modal-body scrollable">
                <div className="form-grid">
                  <div className="form-group-cms">
                    <label>Select Category *</label>
                    <select 
                      value={productForm.categoryId} 
                      onChange={(e) => setProductForm(prev => ({ ...prev, categoryId: e.target.value }))}
                      required
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group-cms">
                    <label>Product Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Cumin Powder" 
                      value={productForm.name} 
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group-cms full-width">
                    <label>Brief Catalog Description *</label>
                    <textarea 
                      rows="3" 
                      placeholder="Describe the product specs, uses, and export characteristics..."
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    ></textarea>
                  </div>

                  <div className="form-group-cms">
                    <label>Approx Price (Optional - ₹)</label>
                    <input 
                      type="number" 
                      placeholder="e.g., 450" 
                      value={productForm.price} 
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>

                  <div className="form-group-cms featured-row">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={productForm.featured}
                        onChange={(e) => setProductForm(prev => ({ ...prev, featured: e.target.checked }))}
                      />
                      <span>Show on Home/Featured sections</span>
                    </label>
                  </div>

                  <div className="form-group-cms full-width">
                    <label>Product Image Link / File Upload</label>
                    <div className="image-input-flex">
                      <input 
                        type="text" 
                        placeholder="/images/cumin.jpg or https://url-link.jpg"
                        value={productForm.image}
                        onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                      />
                      <span className="file-or-span">OR</span>
                      <div className="btn-file-wrapper">
                        <span>Upload File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>
                    {productForm.image && (
                      <div className="uploaded-thumb-preview mt-2">
                        <span>Preview:</span>
                        <img src={productForm.image} alt="Preview" />
                      </div>
                    )}
                  </div>

                  <div className="form-group-cms full-width">
                    <label>Additional Product Gallery Images (Comma-separated URLs/Paths)</label>
                    <textarea 
                      rows="2"
                      placeholder="e.g., /images/cumin1.webp, /images/cumin2.webp"
                      value={productForm.images ? productForm.images.join(', ') : ''}
                      onChange={(e) => {
                        const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setProductForm(prev => ({ ...prev, images: list }));
                      }}
                    ></textarea>
                  </div>

                  <div className="form-group-cms full-width">
                    <label>Product Video URL / Path (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g., https://www.w3schools.com/html/mov_bbb.mp4"
                      value={productForm.video || ''}
                      onChange={(e) => setProductForm(prev => ({ ...prev, video: e.target.value }))}
                    />
                  </div>
                </div>

                <hr className="divider-modal" />

                {/* Specification Table Builder */}
                <div className="specifications-builder-section">
                  <div className="builder-header">
                    <h4>Product Specifications Grids</h4>
                    <button type="button" className="btn-builder-add" onClick={handleAddSpecRow}>
                      <Plus size={14} /> Add Row
                    </button>
                  </div>
                  {productForm.specifications.length === 0 ? (
                    <p className="no-data-builder">No specifications added. Products will use a details-only layout.</p>
                  ) : (
                    <div className="builder-table-wrapper">
                      <table className="builder-table">
                        <thead>
                          <tr>
                            <th>Variety</th>
                            <th>Origin</th>
                            <th>Specification details</th>
                            <th>Packaging</th>
                            <th>FCL Load</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {productForm.specifications.map((spec, i) => (
                            <tr key={i}>
                              <td><input type="text" value={spec.variety} onChange={(e) => handleSpecRowChange(i, 'variety', e.target.value)} placeholder="e.g. Whole Seeds" /></td>
                              <td><input type="text" value={spec.origin} onChange={(e) => handleSpecRowChange(i, 'origin', e.target.value)} placeholder="e.g. India" /></td>
                              <td><input type="text" value={spec.specification} onChange={(e) => handleSpecRowChange(i, 'specification', e.target.value)} placeholder="Purity 99%" /></td>
                              <td><input type="text" value={spec.packaging} onChange={(e) => handleSpecRowChange(i, 'packaging', e.target.value)} placeholder="50 Kg Jute" /></td>
                              <td><input type="text" value={spec.fcl} onChange={(e) => handleSpecRowChange(i, 'fcl', e.target.value)} placeholder="24 MT" /></td>
                              <td>
                                <button type="button" className="btn-builder-remove" onClick={() => handleRemoveSpecRow(i)}>
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <hr className="divider-modal" />

                {/* Details Paragraph/List Builder */}
                <div className="details-builder-section">
                  <div className="builder-header">
                    <h4>Detailed Information Blocks</h4>
                    <div className="add-block-buttons">
                      <button type="button" className="btn-builder-add" onClick={() => handleAddDetailBlock('text')}>
                        + Text Block
                      </button>
                      <button type="button" className="btn-builder-add" onClick={() => handleAddDetailBlock('list')}>
                        + Bullet List Block
                      </button>
                    </div>
                  </div>

                  {productForm.details.length === 0 ? (
                    <p className="no-data-builder">No detailed blocks added.</p>
                  ) : (
                    <div className="blocks-list">
                      {productForm.details.map((block, i) => (
                        <div key={i} className="detail-block-editor">
                          <div className="block-editor-header">
                            <strong>{block.type === 'text' ? 'Paragraph Block' : 'Bullet List Block'}</strong>
                            <button type="button" className="btn-builder-remove" onClick={() => handleRemoveDetailBlock(i)}>
                              <Trash2 size={16} /> Remove Block
                            </button>
                          </div>
                          {block.type === 'text' ? (
                            <textarea 
                              rows="3" 
                              placeholder="Write paragraph content here..."
                              value={block.content || ''}
                              onChange={(e) => handleDetailBlockChange(i, e.target.value)}
                            ></textarea>
                          ) : (
                            <div className="list-editor">
                              <input 
                                type="text" 
                                placeholder="List Title (e.g. Nutritional Facts:)" 
                                value={block.title || ''}
                                onChange={(e) => handleDetailListTitleChange(i, e.target.value)}
                                className="list-title-input"
                              />
                              <div className="list-items-inputs mt-2">
                                {block.items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="list-item-row-edit">
                                    <input 
                                      type="text" 
                                      value={item} 
                                      onChange={(e) => handleDetailListItemChange(i, itemIdx, e.target.value)}
                                      placeholder="Bullet point text..."
                                    />
                                    <button type="button" className="btn-item-delete" onClick={() => handleRemoveDetailListItem(i, itemIdx)}>
                                      <X size={12} />
                                    </button>
                                  </div>
                                ))}
                                <button type="button" className="btn-add-bullet-item mt-1" onClick={() => handleAddDetailListItem(i)}>
                                  + Add Bullet Item
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-modal-confirm">
                  Save Changes
                </button>
                <button type="button" className="btn-modal-cancel" onClick={() => setProductModal({ show: false, editId: null })}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Undo Toast Notification */}
      {showUndoToast && undoCache && (
        <div className="undo-toast animate-slide-up">
          <div className="undo-toast-content">
            <AlertCircle size={20} />
            <span>Product deleted successfully.</span>
            <button onClick={handleUndo} className="btn-undo">
              UNDO
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// Sub-Component for Inquiry Card details
function InquiryCard({ inquiry, onStatusChange, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new': return 'badge-status new';
      case 'read': return 'badge-status read';
      case 'replied': return 'badge-status replied';
      default: return 'badge-status';
    }
  }

  return (
    <div className={`inquiry-card-wrapper ${inquiry.status} ${expanded ? 'expanded' : ''}`}>
      <div className="inquiry-card-summary" onClick={() => setExpanded(!expanded)}>
        <span className={getStatusBadgeClass(inquiry.status)}>{inquiry.status.toUpperCase()}</span>
        <div className="inquiry-meta-primary">
          <h4>{inquiry.name}</h4>
          <span>{inquiry.email} · {inquiry.phone}</span>
        </div>
        <div className="inquiry-meta-secondary">
          {inquiry.product && <span className="inquiry-product-tag">{inquiry.product}</span>}
          <span className="inquiry-time">{new Date(inquiry.timestamp).toLocaleString()}</span>
        </div>
        <button className="btn-expand-toggle">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expanded && (
        <div className="inquiry-card-details">
          <div className="inquiry-details-row">
            <strong>Subject:</strong> {inquiry.subject || 'Sample Request / Inquiry'}
          </div>
          {inquiry.company && (
            <div className="inquiry-details-row">
              <strong>Company:</strong> {inquiry.company}
            </div>
          )}
          {inquiry.country && (
            <div className="inquiry-details-row">
              <strong>Country:</strong> {inquiry.country}
            </div>
          )}
          {inquiry.courier && (
            <div className="inquiry-details-row">
              <strong>Courier Account:</strong> {inquiry.courier}
            </div>
          )}
          {inquiry.quantity && (
            <div className="inquiry-details-row">
              <strong>Quantity Required:</strong> {inquiry.quantity}
            </div>
          )}
          
          <div className="inquiry-message-box mt-3">
            <strong>Message / Requirements:</strong>
            <p>{inquiry.message}</p>
          </div>

          <div className="inquiry-actions-row mt-3">
            {inquiry.status === 'new' && (
              <button className="btn-inq-action mark-read" onClick={() => onStatusChange(inquiry.id, 'read')}>
                <Check size={14} /> Mark Read
              </button>
            )}
            {inquiry.status !== 'replied' && (
              <button className="btn-inq-action mark-replied" onClick={() => onStatusChange(inquiry.id, 'replied')}>
                <Check size={14} /> Mark Replied
              </button>
            )}
            <button className="btn-inq-action delete" onClick={() => onDelete(inquiry.id)}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin;
