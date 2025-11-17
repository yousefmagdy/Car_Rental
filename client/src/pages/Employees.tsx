import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import { Employee } from '../types';
import { employeeApi } from '../services/api';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    hireDate: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await employeeApi.getAll();
      setEmployees(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        hireDate: employee.hireDate.split('T')[0],
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        hireDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
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
      if (editingEmployee) {
        await employeeApi.update(editingEmployee._id, formData);
      } else {
        await employeeApi.create(formData);
      }
      await fetchEmployees();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save employee');
    }
  };

  const handleOpenDeleteModal = (employee: Employee) => {
    setDeletingEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeletingEmployee(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;

    try {
      await employeeApi.delete(deletingEmployee._id);
      await fetchEmployees();
      handleCloseDeleteModal();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete employee');
    }
  };

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'position', label: 'Position' },
    {
      key: 'hireDate',
      label: 'Hire Date',
      render: (employee: Employee) =>
        new Date(employee.hireDate).toLocaleDateString(),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Employees Management</h1>
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
          Add New Employee
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={employees}
        onEdit={handleOpenModal}
        onDelete={handleOpenDeleteModal}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            placeholder="e.g., John"
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            placeholder="e.g., Doe"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="e.g., john.doe@example.com"
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
            label="Position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            required
            placeholder="e.g., Sales Manager"
          />
          <Input
            label="Hire Date"
            name="hireDate"
            type="date"
            value={formData.hireDate}
            onChange={handleInputChange}
            required
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingEmployee ? 'Update' : 'Create'}
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
            Are you sure you want to delete this employee?
          </p>
          {deletingEmployee && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {deletingEmployee.firstName} {deletingEmployee.lastName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {deletingEmployee.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Position:</strong> {deletingEmployee.position}
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

export default Employees;

