
import React, { useState, useEffect, useCallback } from 'react';
import { Service, ServiceType, Permission } from '../types';
import {
  getServices,
  saveService,
  deleteService,
} from '../services/localStorageService';
import { SERVICE_TYPES_LIST, GCS_MOCK_NOTICE } from '../constants';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../components/AuthContext';

const MAX_IMAGES = 3;

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const ServiceForm: React.FC<{ service?: Service; onClose: () => void; onSave: (service: Service) => void }> =
  ({ service, onClose, onSave }) => {
    const [type, setType] = useState<ServiceType>(service?.type || SERVICE_TYPES_LIST[0]);
    const [value, setValue] = useState(service?.value.toString() || '');
    const [detail, setDetail] = useState(service?.detail || '');
    const [imageFiles, setImageFiles] = useState<File[]>([]); // Files selected by user
    const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Base64 or URL for display
    const [error, setError] = useState('');

    useEffect(() => {
      // Initialize image previews from existing service images
      if (service?.imageUrls) {
        setImagePreviews(service.imageUrls);
      }
    }, [service]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const newImageFiles = [...imageFiles];
        newImageFiles[index] = file;
        setImageFiles(newImageFiles);

        try {
          const base64 = await fileToBase64(file);
          const newImagePreviews = [...imagePreviews];
          newImagePreviews[index] = base64;
          setImagePreviews(newImagePreviews);
        } catch (err) {
          console.error('Error converting file to base64:', err);
          setError('No se pudo cargar la imagen.');
        }
      }
    };

    const handleRemoveImage = (indexToRemove: number) => {
      setImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
      setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!type || !value || !detail) {
        setError('Todos los campos obligatorios (tipo, valor, detalle) deben ser completados.');
        return;
      }
      if (isNaN(parseFloat(value))) {
        setError('El valor debe ser un número válido.');
        return;
      }

      // Simulate GCS upload by creating unique placeholder URLs for new images
      // Or by storing base64 strings directly. Here, we'll keep base64 for local persistence.
      const finalImageUrls: string[] = imagePreviews.map((preview, index) => {
        // If it's a new file, it will be a base64 string.
        // If it's an existing image, it will be its original URL/base64.
        return preview;
      });

      const serviceToSave: Service = {
        ...service,
        id: service?.id || '', // id will be generated if empty
        type,
        value: parseFloat(value),
        detail,
        imageUrls: finalImageUrls,
      };

      onSave(serviceToSave);
      onClose();
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
            Tipo de Servicio
          </label>
          <select
            id="serviceType"
            value={type}
            onChange={(e) => setType(e.target.value as ServiceType)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
          >
            {SERVICE_TYPES_LIST.map((serviceType) => (
              <option key={serviceType} value={serviceType}>
                {serviceType}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="serviceValue" className="block text-sm font-medium text-gray-700">
            Valor
          </label>
          <input
            type="number"
            id="serviceValue"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label htmlFor="serviceDetail" className="block text-sm font-medium text-gray-700">
            Detalle
          </label>
          <textarea
            id="serviceDetail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
          ></textarea>
        </div>

        <div className="pt-2">
          <p className="block text-sm font-medium text-gray-700 mb-2">Imágenes (Máximo {MAX_IMAGES})</p>
          <p className="text-xs text-gray-500 italic mb-3">
            {GCS_MOCK_NOTICE}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(MAX_IMAGES)].map((_, index) => (
              <div key={index} className="flex flex-col items-center border border-gray-300 rounded-md p-2 relative">
                {imagePreviews[index] ? (
                  <>
                    <img
                      src={imagePreviews[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-md mb-2 text-gray-400">
                    No image
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index)}
                  className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Guardar
          </button>
        </div>
      </form>
    );
  };

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();

  const fetchServices = useCallback(() => {
    setLoading(true);
    const fetchedServices = getServices();
    setServices(fetchedServices);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSaveService = useCallback((service: Service) => {
    saveService(service);
    fetchServices();
  }, [fetchServices]);

  const handleDeleteService = useCallback((id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      deleteService(id);
      fetchServices();
    }
  }, [fetchServices]);

  const openCreateModal = () => {
    setEditingService(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  if (!hasPermission(Permission.ManageServices)) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center text-red-600 font-semibold">
        No tienes permiso para gestionar servicios.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6">Gestión de Servicios</h1>
      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-md transition-colors flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Añadir Servicio
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imágenes
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${service.value.toLocaleString('es-CO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {service.detail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex -space-x-2 overflow-hidden">
                        {service.imageUrls.map((url, imgIdx) => (
                          <img
                            key={imgIdx}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                            src={url || `https://picsum.photos/40/40?random=${service.id}-${imgIdx}`}
                            alt={`Service ${service.id} image ${imgIdx + 1}`}
                            title={`Image ${imgIdx + 1}`}
                          />
                        ))}
                        {service.imageUrls.length === 0 && (
                          <span className="text-gray-400 italic">No images</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(service)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                        title="Editar servicio"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar servicio"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {services.length === 0 && !loading && (
              <p className="p-4 text-center text-gray-500">No hay servicios para mostrar.</p>
            )}
          </div>
          
          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {services.map((service) => (
                <div key={service.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-lg font-semibold text-blue-700">{service.type}</p>
                            <p className="text-sm font-bold text-green-600">${service.value.toLocaleString('es-CO')}</p>
                        </div>
                        <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                            <button onClick={() => openEditModal(service)} className="text-blue-600 hover:text-blue-900 transition-colors text-sm font-medium">Editar</button>
                            <button onClick={() => handleDeleteService(service.id)} className="text-red-600 hover:text-red-900 transition-colors text-sm font-medium">Eliminar</button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 mb-3">{service.detail}</p>
                    <div className="flex -space-x-2 overflow-hidden">
                      {service.imageUrls.map((url, imgIdx) => (
                        <img
                          key={imgIdx}
                          className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                          src={url || `https://picsum.photos/40/40?random=${service.id}-${imgIdx}`}
                          alt={`Service ${service.id} image ${imgIdx + 1}`}
                          title={`Image ${imgIdx + 1}`}
                        />
                      ))}
                      {service.imageUrls.length === 0 && (
                        <span className="text-xs text-gray-400 italic">No images</span>
                      )}
                    </div>
                </div>
            ))}
            {services.length === 0 && !loading && (
              <p className="p-4 text-center text-gray-500 bg-white rounded-lg shadow-md">No hay servicios para mostrar.</p>
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Editar Servicio' : 'Añadir Nuevo Servicio'}
      >
        <ServiceForm
          service={editingService}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveService}
        />
      </Modal>
    </div>
  );
};

export default ServicesPage;
