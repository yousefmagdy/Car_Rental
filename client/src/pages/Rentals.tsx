import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { Rental, Car, Client, Employee } from '../types';
import { rentalApi, carApi, clientApi, employeeApi } from '../services/api';

const Rentals: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);
  const [deletingRental, setDeletingRental] = useState<Rental | null>(null);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    car: '',
    client: '',
    employee: '',
    startDate: '',
    endDate: '',
    totalCost: 0,
    status: 'active' as 'active' | 'completed' | 'cancelled',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-calculate total cost when car or dates change
  useEffect(() => {
    const calculateTotalCost = () => {
      if (formData.car && formData.startDate && formData.endDate) {
        const selectedCar = cars.find((c) => c._id === formData.car);
        if (selectedCar) {
          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          
          if (days > 0) {
            const cost = selectedCar.dailyRate * days;
            setFormData((prev) => ({ ...prev, totalCost: cost }));
          }
        }
      }
    };

    calculateTotalCost();
  }, [formData.car, formData.startDate, formData.endDate, cars]);

  // Separate fetch functions for optimized data fetching
  const fetchRentals = async () => {
    try {
      const rentalsData = await rentalApi.getAll();
      setRentals(rentalsData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rentals');
    }
  };

  const fetchCars = async () => {
    try {
      const carsData = await carApi.getAll();
      setCars(carsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cars');
    }
  };

  const fetchClients = async () => {
    try {
      const clientsData = await clientApi.getAll();
      setClients(clientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    }
  };

  const fetchEmployees = async () => {
    try {
      const employeesData = await employeeApi.getAll();
      setEmployees(employeesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    }
  };

  // Fetch all data on initial load
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [rentalsData, carsData, clientsData, employeesData] = await Promise.all([
        rentalApi.getAll(),
        carApi.getAll(),
        clientApi.getAll(),
        employeeApi.getAll(),
      ]);
      setRentals(rentalsData);
      setCars(carsData);
      setClients(clientsData);
      setEmployees(employeesData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (rental?: Rental) => {
    if (rental) {
      setEditingRental(rental);
      setFormData({
        car: typeof rental.car === 'string' ? rental.car : rental.car._id,
        client: typeof rental.client === 'string' ? rental.client : rental.client._id,
        employee: typeof rental.employee === 'string' ? rental.employee : rental.employee._id,
        startDate: rental.startDate.split('T')[0],
        endDate: rental.endDate.split('T')[0],
        totalCost: rental.totalCost,
        status: rental.status,
      });
    } else {
      setEditingRental(null);
      setFormData({
        car: '',
        client: '',
        employee: '',
        startDate: '',
        endDate: '',
        totalCost: 0,
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRental(null);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalCost' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates on frontend
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      setError('Start date cannot be in the past');
      return;
    }
    
    if (end <= start) {
      setError('End date must be after start date');
      return;
    }
    
    try {
      if (editingRental) {
        await rentalApi.update(editingRental._id, formData);
      } else {
        await rentalApi.create(formData);
      }
      // Only refetch rentals, not everything
      await fetchRentals();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rental');
    }
  };

  const handleOpenDeleteModal = (rental: Rental) => {
    setDeletingRental(rental);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeletingRental(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRental) return;

    try {
      await rentalApi.delete(deletingRental._id);
      // Only refetch rentals, not everything
      await fetchRentals();
      handleCloseDeleteModal();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rental');
    }
  };

  const columns = [
    {
      key: 'car',
      label: 'Car',
      render: (rental: Rental) => {
        const car = rental.car as Car;
        return car ? `${car.brand} ${car.model} (${car.licensePlate})` : 'N/A';
      },
    },
    {
      key: 'client',
      label: 'Client',
      render: (rental: Rental) => {
        const client = rental.client as Client;
        return client ? `${client.firstName} ${client.lastName}` : 'N/A';
      },
    },
    {
      key: 'employee',
      label: 'Employee',
      render: (rental: Rental) => {
        const employee = rental.employee as Employee;
        return employee ? `${employee.firstName} ${employee.lastName}` : 'N/A';
      },
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (rental: Rental) => new Date(rental.startDate).toLocaleDateString(),
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (rental: Rental) => new Date(rental.endDate).toLocaleDateString(),
    },
    {
      key: 'totalCost',
      label: 'Total Cost',
      render: (rental: Rental) => `$${rental.totalCost.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (rental: Rental) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            rental.status === 'active'
              ? 'bg-green-100 text-green-800'
              : rental.status === 'completed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
        </span>
      ),
    },
  ];

  // Filter cars based on availability during selected date range
  const availableCars = cars.filter((car) => {
    if (car.status === 'maintenance') return false;
    
    // If no dates selected yet, show all non-maintenance cars
    if (!formData.startDate || !formData.endDate) return true;
    
    // Check if car has active rentals during selected dates
    const hasConflict = rentals.some((rental) => {
      // Skip the current rental being edited (avoid self-conflict)
      if (editingRental && rental._id === editingRental._id) return false;
      
      // Only check if this rental is for the same car
      const isThisCar = typeof rental.car === 'string' 
        ? rental.car === car._id 
        : rental.car._id === car._id;
      
      if (!isThisCar) return false;
      
      // Skip non-active rentals (cancelled/completed don't block availability)
      if (rental.status === 'cancelled') return false;
      
      // Check for date overlap
      const rentalStart = new Date(rental.startDate);
      const rentalEnd = new Date(rental.endDate);
      const newStart = new Date(formData.startDate);
      const newEnd = new Date(formData.endDate);
      
      // Dates overlap if: new rental starts before existing ends AND new rental ends after existing starts
      return (newStart <= rentalEnd && newEnd >= rentalStart);
    });

    return !hasConflict;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rentals Management</h1>
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
          Add New Rental
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Table
        columns={columns}
        data={rentals}
        onEdit={handleOpenModal}
        onDelete={handleOpenDeleteModal}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRental ? 'Edit Rental' : 'Add New Rental'}
      >
        <form onSubmit={handleSubmit}>
          <Select
            label="Car"
            name="car"
            value={formData.car}
            onChange={handleInputChange}
            options={
              editingRental
                ? cars.map((car) => ({
                    value: car._id,
                    label: `${car.brand} ${car.model} (${car.licensePlate})`,
                  }))
                : availableCars.map((car) => ({
                    value: car._id,
                    label: `${car.brand} ${car.model} (${car.licensePlate})`,
                  }))
            }
            required
          />
          <Select
            label="Client"
            name="client"
            value={formData.client}
            onChange={handleInputChange}
            options={clients.map((client) => ({
              value: client._id,
              label: `${client.firstName} ${client.lastName}`,
            }))}
            required
          />
          <Select
            label="Employee"
            name="employee"
            value={formData.employee}
            onChange={handleInputChange}
            options={employees.map((employee) => ({
              value: employee._id,
              label: `${employee.firstName} ${employee.lastName}`,
            }))}
            required
          />
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleInputChange}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleInputChange}
            required
            min={formData.startDate || new Date().toISOString().split('T')[0]}
          />
          <div>
            <Input
              label="Total Cost ($)"
              name="totalCost"
              type="number"
              value={formData.totalCost}
              onChange={handleInputChange}
              required
              min={0}
              step="0.01"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-calculated based on car daily rate and rental duration
            </p>
          </div>
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            required
          />
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingRental ? 'Update' : 'Create'}
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
            Are you sure you want to delete this rental?
          </p>
          {deletingRental && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Car:</strong>{' '}
                {typeof deletingRental.car === 'string'
                  ? deletingRental.car
                  : `${(deletingRental.car as Car).brand} ${(deletingRental.car as Car).model}`}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Period:</strong>{' '}
                {new Date(deletingRental.startDate).toLocaleDateString()} -{' '}
                {new Date(deletingRental.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong>{' '}
                <span className="capitalize">{deletingRental.status}</span>
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

export default Rentals;

