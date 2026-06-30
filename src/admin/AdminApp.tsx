import { useEffect, useState } from 'react';
import '../App.css';
import Layout from './components/Layout';
import CustomerForm from './components/CustomerForm';
import CustomerTable from './components/CustomerTable';
import ItemForm from './components/ItemForm';
import ItemTable from './components/ItemTable';

import SaleForm from './components/SaleForm';
import SalesTable from './components/SalesTable';

import CustomerCreditsTable from './components/CustomerCreditsTable';

import { fetchShopOrders } from '../api/adminApi';
import ShopOrdersTable from './components/ShopOrdersTable';
import CustomerDetailPage from './components/CustomerDetailPage';
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
  SaleFormData,
} from '../types';


import {
  createCustomer,
  createItem,
  createSale,
  fetchCustomerCredits,
  fetchCustomers,
  fetchItems,
  fetchSales,
  uploadItemImage,
  updateItem
} from '../api/adminApi';

function App() {
  const [activeView, setActiveView] = useState<'customers' | 'items' | 'sales' | 'orders' | 'customerDetails'>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
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

  const [saleFormData, setSaleFormData] = useState<SaleFormData>({
    item_id: '',
    sale_price: '',
    sale_type: 'store',
    payment_method: 'cash',
    notes: '',
    buyer_customer_id: '',
  });

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
    } catch (err) {
      console.error(err);
    }
  }


  async function loadCustomers() {
    try {
      setLoadingCustomers(true);
      setError('');
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Kunden');
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function loadItems() {
    try {
      setLoadingItems(true);
      setError('');
      const data = await fetchItems();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Kleidungsstücke');
    } finally {
      setLoadingItems(false);
    }
  }

  async function loadSales() {
    try {
      setLoadingSales(true);
      setError('');
      const data = await fetchSales();
      setSales(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Verkäufe');
    } finally {
      setLoadingSales(false);
    }
  }

  async function loadCustomerCredits() {
    try {
      setLoadingCustomerCredits(true);
      setError('');
      const data = await fetchCustomerCredits();
      setCustomerCredits(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Guthabenübersicht');
    } finally {
      setLoadingCustomerCredits(false);
    }
  }

  async function loadShopOrders() {
    try {
      setLoadingShopOrders(true);
      setError('');
      const data = await fetchShopOrders();
      setShopOrders(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Online-Bestellungen');
    } finally {
      setLoadingShopOrders(false);
    }
  }

  useEffect(() => {
    loadCustomers();
    loadItems();
    loadSales();
    loadCustomerCredits();
    loadShopOrders();
  }, []);

  async function handleCustomerSubmit(e: React.FormEvent) {
    e.preventDefault();

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

      await loadCustomers();
      await loadCustomerCredits();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern des Kunden');
    }
  }

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();

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

      if (selectedItemImage && createdItem?.id) {
        await uploadItemImage(createdItem.id, selectedItemImage);
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

      await loadItems();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern des Kleidungsstücks');
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


  async function handleSaleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError('');

      await createSale({
        item_id: Number(saleFormData.item_id),
        sale_price: Number(saleFormData.sale_price),
        sale_type: saleFormData.sale_type,
        payment_method: saleFormData.payment_method,
        notes: saleFormData.notes,
        buyer_customer_id: Number(saleFormData.buyer_customer_id),
      });

      setSaleFormData({
        item_id: '',
        sale_price: '',
        sale_type: 'store',
        payment_method: 'cash',
        notes: '',
        buyer_customer_id: '',
      });

      await loadSales();
      await loadItems();
      await loadCustomerCredits();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern des Verkaufs');
    }
  }




  function handleSaleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setSaleFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  return (
    <Layout activeView={activeView} onChangeView={setActiveView}>
      {error && <div className="error-box">{error}</div>}

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
              onReload={loadCustomerCredits}
              onCustomerClick={(customerId) => {
                setSelectedCustomerId(customerId);
                setActiveView('customerDetails');
              }}
            />
          </div>

          <div className="section-spacing">
            <CustomerTable
              customers={customers}
              loading={loadingCustomers}
              onReload={loadCustomers}
              onCustomerClick={(customerId) => {
                setSelectedCustomerId(customerId);
                setActiveView('customerDetails');
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
            onReload={loadItems}
            onToggleOnline={handleToggleOnline}
          />
        </div>
      )}

      {activeView === 'sales' && (
        <div className="content-grid">
          <SaleForm
            formData={saleFormData}
            customers={customers}
            items={items}
            onChange={handleSaleChange}
            onSubmit={handleSaleSubmit}
          />

          <SalesTable
            sales={sales}
            loading={loadingSales}
            onReload={loadSales}
          />
        </div>
      )}

      {activeView === 'orders' && (
        <ShopOrdersTable
          orders={shopOrders}
          loading={loadingShopOrders}
          onReload={loadShopOrders}
        />
      )}

      {activeView === 'customerDetails' && selectedCustomerId && (
        <CustomerDetailPage
          customerId={selectedCustomerId}
          customers={customers}
          items={items}
          sales={sales}
          onBack={() => {
            setSelectedCustomerId(null);
            setActiveView('customers');
          }}
        />
      )}
    </Layout>
  );
}




export default App;