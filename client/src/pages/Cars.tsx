import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { Car } from '../types';
import { carApi } from '../services/api';

const Cars: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deletingCar, setDeletingCar] = useState<Car | null>(null);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    licensePlate: '',
    dailyRate: 0,
    status: 'available' as 'available' | 'maintenance',
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setIsLoading(true);
      const data = await carApi.getAll();
      setCars(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cars');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (car?: Car) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        brand: car.brand,
        model: car.model,
        year: car.year,
        color: car.color,
        licensePlate: car.licensePlate,
        dailyRate: car.dailyRate,
        status: car.status,
      });
    } else {
      setEditingCar(null);
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        licensePlate: '',
        dailyRate: 0,
        status: 'available',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCar(null);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' || name === 'dailyRate' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCar) {
        await carApi.update(editingCar._id, formData);
      } else {
        await carApi.create(formData);
      }
      await fetchCars();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save car');
    }
  };

  const handleOpenDeleteModal = (car: Car) => {
    setDeletingCar(car);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeletingCar(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCar) return;

    try {
      await carApi.delete(deletingCar._id);
      await fetchCars();
      handleCloseDeleteModal();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete car');
    }
  };

  const columns = [
    { key: 'brand', label: 'Brand' },
    { key: 'model', label: 'Model' },
    { key: 'year', label: 'Year' },
    { key: 'color', label: 'Color' },
    { key: 'licensePlate', label: 'License Plate' },
    {
      key: 'dailyRate',
      label: 'Daily Rate',
      render: (car: Car) => `$${car.dailyRate}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (car: Car) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            car.status === 'available'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cars Management</h1>
        <Button onClick={() => handleOpenModal()}>
          <svg
            className="h-5 w-5 inline mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Car
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={cars}
        onEdit={handleOpenModal}
        onDelete={handleOpenDeleteModal}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCar ? 'Edit Car' : 'Add New Car'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Brand"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            required
            placeholder="e.g., Toyota"
          />
          <Input
            label="Model"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            required
            placeholder="e.g., Camry"
          />
          <Input
            label="Year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleInputChange}
            required
            min={1900}
            max={new Date().getFullYear() + 1}
          />
          <Input
            label="Color"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            required
            placeholder="e.g., Black"
          />
          <Input
            label="License Plate"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleInputChange}
            required
            placeholder="e.g., ABC-1234"
          />
          <Input
            label="Daily Rate ($)"
            name="dailyRate"
            type="number"
            value={formData.dailyRate}
            onChange={handleInputChange}
            required
            min={0}
            step="0.01"
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={[
              { value: 'available', label: 'Available' },
              { value: 'maintenance', label: 'Maintenance' },
            ]}
            required
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingCar ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this car?
          </p>
          {deletingCar && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Car:</strong> {deletingCar.brand} {deletingCar.model}
              </p>
              <p className="text-sm text-gray-600">
                <strong>License Plate:</strong> {deletingCar.licensePlate}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Year:</strong> {deletingCar.year}
              </p>
            </div>
          )}
          <p className="text-sm text-red-600">
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleCloseDeleteModal}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cars;

