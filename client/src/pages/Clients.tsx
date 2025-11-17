import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import { Client } from '../types';
import { clientApi } from '../services/api';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    driverLicense: '',
    address: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const data = await clientApi.getAll();
      setClients(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        driverLicense: client.driverLicense,
        address: client.address,
      });
    } else {
      setEditingClient(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        driverLicense: '',
        address: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientApi.update(editingClient._id, formData);
      } else {
        await clientApi.create(formData);
      }
      await fetchClients();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save client');
    }
  };

  const handleOpenDeleteModal = (client: Client) => {
    setDeletingClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeletingClient(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingClient) return;

    try {
      await clientApi.delete(deletingClient._id);
      await fetchClients();
      handleCloseDeleteModal();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
    }
  };

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'driverLicense', label: 'Driver License' },
    { key: 'address', label: 'Address' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clients Management</h1>
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
          Add New Client
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={clients}
        onEdit={handleOpenModal}
        onDelete={handleOpenDeleteModal}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            placeholder="e.g., Jane"
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            placeholder="e.g., Smith"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="e.g., jane.smith@example.com"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            required
            placeholder="e.g., +1234567890"
          />
          <Input
            label="Driver License"
            name="driverLicense"
            value={formData.driverLicense}
            onChange={handleInputChange}
            required
            placeholder="e.g., DL123456"
          />
          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            placeholder="e.g., 123 Main St, City, State"
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingClient ? 'Update' : 'Create'}
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
            Are you sure you want to delete this client?
          </p>
          {deletingClient && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {deletingClient.firstName} {deletingClient.lastName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {deletingClient.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Phone:</strong> {deletingClient.phone}
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

export default Clients;

