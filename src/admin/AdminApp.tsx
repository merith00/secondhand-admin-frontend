import ItemDetailPage from './components/ItemDetailPage';
import { App as NativeApp } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { errorMessage } from '../utils/errors';
import { useCallback, useEffect, useRef, useState } from 'react';
import '../App.css';
import Layout from './components/Layout';
import CustomerForm from './components/CustomerForm';
import CustomerTable from './components/CustomerTable';
import ItemForm from './components/ItemForm';
import ItemTable from './components/ItemTable';

import SaleForm from './components/SaleForm';

import CustomerCreditsTable from './components/CustomerCreditsTable';

import { fetchShopOrders } from '../api/adminApi';
import ShopOrdersTable from './components/ShopOrdersTable';
import CustomerDetailPage from './components/CustomerDetailPage';
import Anpassungen from './components/Anpassungen';
import Historie from './components/Historie';

import type { AdminShopOrder } from '../types';


import { Capacitor } from '@capacitor/core';
import {
  takePhotoWithCamera,
  pickPhotoFromGallery,
  webPathToBlob,
} from '../utils/camera';


import type {
  Customer,
  CustomerCredit,
  CustomerFormData,
  Item,
  ItemFormData,
  Sale,
  BatchSaleData,
} from '../types';


import {
  createCustomer,
  createItem,
  createBatchSale,
  fetchCustomerCredits,
  fetchCustomers,
  fetchItems,
  fetchSales,
  uploadItemImage,
  updateItem
} from '../api/adminApi';

function App() {
  const [activeView, setActiveView] = useState<'customers' | 'items' | 'sales' | 'orders' | 'anpassungen' | 'historie' | 'customerDetails' | 'itemDetails'>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  const [customerCredits, setCustomerCredits] = useState<CustomerCredit[]>([]);
  const [loadingCustomerCredits, setLoadingCustomerCredits] = useState(false);

  const [shopOrders, setShopOrders] = useState<AdminShopOrder[]>([]);
  const [loadingShopOrders, setLoadingShopOrders] = useState(false);
  const [selectedItemImage, setSelectedItemImage] = useState<File | null>(null);

  const [showCustomerForm, setShowCustomerForm] = useState(true);

  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [error, setError] = useState('');
  const [loadErrors, setLoadErrors] = useState<Record<string, string>>({});
  const [showExitDialog, setShowExitDialog] = useState(false);
  const savingRef = useRef(false);

  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    customer_number: '',
    first_name: '',
    last_name: '',
    city: '',
    postal_code: '',
    street: '',
    house_number: '',
    phone: '',
    email: '',
  });

  const [itemFormData, setItemFormData] = useState<ItemFormData>({
    owner_customer_id: '',
    title: '',
    description: '',
    category: '',
    size: '',
    brand: '',
    color: '',
    price: '',
    is_online_visible: false,
  });


  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);



  const [showItemModal, setShowItemModal] = useState(false);



  async function handleToggleOnline(itemId: number, isVisible: boolean) {
    try {
      await updateItem(itemId, {
        is_online_visible: isVisible ? 1 : 0,
      });

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, is_online_visible: isVisible ? 1 : 0 }
            : item
        )
      );
      await refreshData();
    } catch (err) {
      setError(errorMessage(err, 'Online-Sichtbarkeit konnte nicht gespeichert werden.'));
    }
  }


  const requestVersions = useRef<Record<string, number>>({});

  const loadCustomers = useCallback(async () => {
    const version = (requestVersions.current.Customers ?? 0) + 1;
    requestVersions.current.Customers = version;
    try {
      setLoadingCustomers(true);

      const data = await fetchCustomers();
      if (requestVersions.current.Customers === version) {
        setCustomers(data);
        setLoadErrors(previous => { const next = { ...previous }; delete next.Customers; return next; });
      }
    } catch (err: unknown) {
      if (requestVersions.current.Customers === version) setLoadErrors(previous => ({ ...previous, Customers: errorMessage(err, 'Fehler beim Laden der Kunden') }));
    } finally {
      if (requestVersions.current.Customers === version) setLoadingCustomers(false);
    }
  }, []);

  const loadItems = useCallback(async () => {
    const version = (requestVersions.current.Items ?? 0) + 1;
    requestVersions.current.Items = version;
    try {
      setLoadingItems(true);

      const data = await fetchItems();
      if (requestVersions.current.Items === version) {
        setItems(data);
        setLoadErrors(previous => { const next = { ...previous }; delete next.Items; return next; });
      }
    } catch (err: unknown) {
      if (requestVersions.current.Items === version) setLoadErrors(previous => ({ ...previous, Items: errorMessage(err, 'Fehler beim Laden der Kleidungsstücke') }));
    } finally {
      if (requestVersions.current.Items === version) setLoadingItems(false);
    }
  }, []);

  const loadSales = useCallback(async () => {
    const version = (requestVersions.current.Sales ?? 0) + 1;
    requestVersions.current.Sales = version;
    try {
      setLoadingSales(true);

      const data = await fetchSales();
      if (requestVersions.current.Sales === version) {
        setSales(data);
        setLoadErrors(previous => { const next = { ...previous }; delete next.Sales; return next; });
      }
    } catch (err: unknown) {
      if (requestVersions.current.Sales === version) setLoadErrors(previous => ({ ...previous, Sales: errorMessage(err, 'Fehler beim Laden der Verkäufe') }));
    } finally {
      if (requestVersions.current.Sales === version) setLoadingSales(false);
    }
  }, []);

  const loadCustomerCredits = useCallback(async () => {
    const version = (requestVersions.current.CustomerCredits ?? 0) + 1;
    requestVersions.current.CustomerCredits = version;
    try {
      setLoadingCustomerCredits(true);

      const data = await fetchCustomerCredits();
      if (requestVersions.current.CustomerCredits === version) {
        setCustomerCredits(data);
        setLoadErrors(previous => { const next = { ...previous }; delete next.CustomerCredits; return next; });
      }
    } catch (err: unknown) {
      if (requestVersions.current.CustomerCredits === version) setLoadErrors(previous => ({ ...previous, CustomerCredits: errorMessage(err, 'Fehler beim Laden der Guthabenübersicht') }));
    } finally {
      if (requestVersions.current.CustomerCredits === version) setLoadingCustomerCredits(false);
    }
  }, []);

  const loadShopOrders = useCallback(async () => {
    const version = (requestVersions.current.ShopOrders ?? 0) + 1;
    requestVersions.current.ShopOrders = version;
    try {
      setLoadingShopOrders(true);

      const data = await fetchShopOrders();
      if (requestVersions.current.ShopOrders === version) {
        setShopOrders(data);
        setLoadErrors(previous => { const next = { ...previous }; delete next.ShopOrders; return next; });
      }
    } catch (err: unknown) {
      if (requestVersions.current.ShopOrders === version) setLoadErrors(previous => ({ ...previous, ShopOrders: errorMessage(err, 'Fehler beim Laden der Online-Bestellungen') }));
    } finally {
      if (requestVersions.current.ShopOrders === version) setLoadingShopOrders(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([loadCustomers(), loadItems(), loadSales(), loadCustomerCredits(), loadShopOrders()]);
  }, [loadCustomers, loadItems, loadSales, loadCustomerCredits, loadShopOrders]);

  useEffect(() => {
    void refreshData();
  }, [activeView, refreshData]);

  useEffect(() => {
    let lastRefresh = 0;
    const refreshOnReturn = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastRefresh > 1000) {
        lastRefresh = Date.now();
        void refreshData();
      }
    };
    window.addEventListener('focus', refreshOnReturn);
    window.addEventListener('online', refreshOnReturn);
    document.addEventListener('visibilitychange', refreshOnReturn);
    return () => {
      window.removeEventListener('focus', refreshOnReturn);
      window.removeEventListener('online', refreshOnReturn);
      document.removeEventListener('visibilitychange', refreshOnReturn);
    };
  }, [refreshData]);

  async function handleCustomerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;

    try {
      setError('');
      await createCustomer(customerFormData);

      setCustomerFormData({
        customer_number: '',
        first_name: '',
        last_name: '',
        city: '',
        postal_code: '',
        street: '',
        house_number: '',
        phone: '',
        email: '',
      });

      await refreshData();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Fehler beim Speichern des Kunden'));
    } finally {
      savingRef.current = false;
    }
  }

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;

    try {
      setError('');

      const createdItem = await createItem({
        owner_customer_id: Number(itemFormData.owner_customer_id),
        title: itemFormData.title,
        description: itemFormData.description,
        category: itemFormData.category,
        size: itemFormData.size,
        brand: itemFormData.brand,
        color: itemFormData.color,
        price: Number(itemFormData.price),
        is_online_visible: itemFormData.is_online_visible ? 1 : 0,
      });

      let uploadWarning = '';
      if (selectedItemImage && createdItem?.id) {
        try {
          await uploadItemImage(createdItem.id, selectedItemImage);
        } catch (uploadError) {
          uploadWarning = 'Kleidungsstück wurde gespeichert, aber das Bild konnte nicht hochgeladen werden. ' + errorMessage(uploadError, 'Bitte das Bild später ergänzen.');
        }
      }


      setItemFormData({
        owner_customer_id: '',
        title: '',
        description: '',
        category: '',
        size: '',
        brand: '',
        color: '',
        price: '',
        is_online_visible: false,
      });

      setSelectedItemImage(null);
      setImagePreview('');

      await refreshData();
      setShowItemModal(false);
      if (uploadWarning) setError(uploadWarning);
    } catch (err: unknown) {
      setError(errorMessage(err, 'Fehler beim Speichern des Kleidungsstücks'));
    } finally {
      savingRef.current = false;
    }
  }

  const isNativeMobile = Capacitor.isNativePlatform();

  async function handleTakePhoto() {
    try {
      setError('');
      setIsUploadingImage(true);

      const photo = await takePhotoWithCamera();

      if (!photo.webPath) {
        throw new Error('Kein Bildpfad vorhanden');
      }

      setImagePreview(photo.webPath);

      const blob = await webPathToBlob(photo.webPath);
      const file = new File([blob], `item-${Date.now()}.jpg`, {
        type: blob.type || 'image/jpeg',
      });

      setSelectedItemImage(file);
    } catch (error) {
      console.error(error);
      setError('Foto konnte nicht aufgenommen werden.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handlePickPhoto() {
    try {
      setError('');
      setIsUploadingImage(true);

      const photo = await pickPhotoFromGallery();

      if (!photo.webPath) {
        throw new Error('Kein Bildpfad vorhanden');
      }

      setImagePreview(photo.webPath);

      const blob = await webPathToBlob(photo.webPath);
      const file = new File([blob], `item-${Date.now()}.jpg`, {
        type: blob.type || 'image/jpeg',
      });

      setSelectedItemImage(file);
    } catch (error) {
      console.error(error);
      setError('Bild konnte nicht ausgewählt werden.');
    } finally {
      setIsUploadingImage(false);
    }
  }
  function handleCustomerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setCustomerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleItemImageChange(file: File | null) {
    setSelectedItemImage(file);

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview('');
    }

  }

  function handleItemChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setItemFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleItemCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { checked } = e.target;

    setItemFormData((prev) => ({
      ...prev,
      is_online_visible: checked,
    }));
  }


  function openItemModalForCustomer(customerId: number) {
    setItemFormData({
      owner_customer_id: String(customerId),
      title: '',
      description: '',
      category: '',
      size: '',
      brand: '',
      color: '',
      price: '',
      is_online_visible: false,
    });

    setSelectedItemImage(null);
    setImagePreview('');
    setShowItemModal(true);
  }


  async function handleBatchSaleSubmit(
    saleData: BatchSaleData
  ) {
    try {
      setError('');

      await createBatchSale(saleData);

      await refreshData();
    } catch (err: unknown) {
      const message =
        errorMessage(err, 'Fehler beim Speichern des Verkaufs');

      setError(message);

      /*
       * Fehler weitergeben, damit SaleForm den Warenkorb
       * bei einem fehlgeschlagenen Verkauf nicht leert.
       */
      throw err;
    }
  }

  const viewHistory = useRef<{ view: typeof activeView; customerId: number | null; itemId: number | null }[]>([]);
  const currentView = useRef({ view: activeView, customerId: selectedCustomerId, itemId: selectedItemId });
  currentView.current = { view: activeView, customerId: selectedCustomerId, itemId: selectedItemId };
  function navigate(view: typeof activeView) {
    if (view === activeView || savingRef.current || isUploadingImage) return;
    const event = new Event('admin:before-back', { cancelable: true });
    if (!window.dispatchEvent(event)) return;
    viewHistory.current.push(currentView.current);
    setActiveView(view);
  }
  const backAction = useRef(() => {});
  backAction.current = () => {
    if (savingRef.current || isUploadingImage) return;
    if (showExitDialog) { setShowExitDialog(false); return; }
    if (showItemModal) {
      if (window.confirm('Kleidungsstück-Formular schließen? Nicht gespeicherte Eingaben werden verworfen.')) setShowItemModal(false);
      return;
    }
    if (!window.dispatchEvent(new Event('admin:before-back', { cancelable: true }))) return;
    const previous = viewHistory.current.pop();
    if (previous) {
      setSelectedCustomerId(previous.customerId);
      setSelectedItemId(previous.itemId);
      setActiveView(previous.view);
    } else if (activeView !== 'customers') {
      setSelectedCustomerId(null);
      setActiveView('customers');
    } else {
      setShowExitDialog(true);
    }
  };
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return;
    let disposed = false;
    let handle: PluginListenerHandle | undefined;
    void NativeApp.addListener('backButton', () => backAction.current())
      .then(listener => { if (disposed) void listener.remove(); else handle = listener; })
      .catch(err => setError(errorMessage(err, 'Zurück-Navigation konnte nicht aktiviert werden.')));
    return () => { disposed = true; if (handle) void handle.remove(); };
  }, []);

  return (
    <Layout activeView={activeView} onChangeView={navigate}>
      {error && <div className="error-box" role="alert">{error}</div>}
      {Object.entries(loadErrors).map(([key, message]) => <div key={key} className="error-box" role="alert">{key === 'Customers' ? 'Kunden' : key === 'Items' ? 'Kleidungsstücke' : key === 'Sales' ? 'Verkäufe' : key === 'CustomerCredits' ? 'Guthaben' : 'Bestellungen'}: {message} Angezeigte Daten können veraltet sein.</div>)}
      {showExitDialog && <div className="modal-backdrop"><section className="card" role="dialog" aria-modal="true" aria-labelledby="exit-title"><h3 id="exit-title">App verlassen?</h3><p>Nicht gespeicherte Eingaben können verloren gehen.</p><div className="address-actions"><button className="secondary-btn" onClick={() => setShowExitDialog(false)}>In der App bleiben</button><button className="primary-btn" onClick={() => { void NativeApp.exitApp().catch(err => setError(errorMessage(err, 'App konnte nicht geschlossen werden.'))); }}>App verlassen</button></div></section></div>}

      {activeView === 'customers' && (
        <div className="customer-page">
          <div className="content-grid ">
            <div className="card">
              <div
                className="card-header clickable"
                onClick={() => setShowCustomerForm((prev) => !prev)}
              >
                <h3>Neuen Kunden anlegen</h3>

                <span className={`chevron ${showCustomerForm ? 'open' : ''}`}>
                  ▼
                </span>
              </div>

              {showCustomerForm && (
                <CustomerForm
                  formData={customerFormData}
                  onChange={handleCustomerChange}
                  onSubmit={handleCustomerSubmit}
                />
              )}
            </div>


            <CustomerCreditsTable
              credits={customerCredits}
              loading={loadingCustomerCredits}
              onCustomerClick={(customerId) => {
                setSelectedCustomerId(customerId);
                navigate('customerDetails');
              }}
            />
          </div>

          <div className="section-spacing">
            <CustomerTable
              customers={customers}
              loading={loadingCustomers}
              onCustomerClick={(customerId) => {
                setSelectedCustomerId(customerId);
                navigate('customerDetails');
              }}
            />
          </div>
        </div>
      )}

      {activeView === 'items' && (
        <div className="content-grid">
          <ItemForm
            formData={itemFormData}
            customers={customers}
            selectedImage={selectedItemImage}
            onImageChange={handleItemImageChange}
            onChange={handleItemChange}
            onCheckboxChange={handleItemCheckboxChange}
            onSubmit={handleItemSubmit}
            onTakePhoto={handleTakePhoto}
            onPickPhoto={handlePickPhoto}
            imagePreview={imagePreview}
            isUploadingImage={isUploadingImage}
            isNativeMobile={isNativeMobile}
          />

          <ItemTable
            items={items}
            loading={loadingItems}
            onToggleOnline={handleToggleOnline}
            onItemClick={(itemId) => { setSelectedItemId(itemId); navigate('itemDetails'); }}
          />
        </div>
      )}

      {activeView === 'itemDetails' && (
        <ItemDetailPage item={items.find(item => item.id === selectedItemId)} customers={customers} sales={sales} orders={shopOrders} loading={loadingItems} onBack={() => backAction.current()} onCustomerClick={(customerId) => { setSelectedCustomerId(customerId); navigate('customerDetails'); }} />
      )}

      {activeView === 'sales' && (
        <div className="sale-page">
          <SaleForm
            customers={customers}
            customerCredits={customerCredits}
            items={items}
            onSubmit={handleBatchSaleSubmit}
          />
        </div>
      )}

      {activeView === 'orders' && (
        <ShopOrdersTable
          orders={shopOrders}
          loading={loadingShopOrders}
        />
      )}

      {activeView === 'anpassungen' && (
        <Anpassungen />
      )}

      {activeView === 'historie' && (
        <Historie
          customers={customers}
          items={items}
          sales={sales}
          loadingItems={loadingItems}
          loadingSales={loadingSales}
        />
      )}
      {activeView === 'customerDetails' && selectedCustomerId && (


        <CustomerDetailPage
          customerId={selectedCustomerId}
          customers={customers}
          items={items}
          sales={sales}
          onBack={() => {
            backAction.current();
          }}
          onAddItem={openItemModalForCustomer}

          onCustomerUpdated={async (updatedCustomer) => {
            setCustomers((prev) =>
              prev.map((customer) =>
                customer.id === updatedCustomer.id
                  ? updatedCustomer
                  : customer
              )
            );
            await refreshData();
          }}
          onItemUpdated={async (updatedItem) => {
            setItems((previousItems) =>
              previousItems.map((item) =>
                item.id === updatedItem.id ? { ...item, ...updatedItem } : item
              )
            );
            await refreshData();
          }}
        />
      )}


      {showItemModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setShowItemModal(false)}
            >
              ✕
            </button>

            <ItemForm
              formData={itemFormData}
              customers={customers}
              selectedImage={selectedItemImage}
              onImageChange={handleItemImageChange}
              onChange={handleItemChange}
              onCheckboxChange={handleItemCheckboxChange}
              onSubmit={handleItemSubmit}
              onTakePhoto={handleTakePhoto}
              onPickPhoto={handlePickPhoto}
              imagePreview={imagePreview}
              isUploadingImage={isUploadingImage}
              isNativeMobile={isNativeMobile}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}




export default App;
