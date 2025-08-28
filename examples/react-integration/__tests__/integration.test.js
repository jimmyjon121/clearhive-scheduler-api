import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../App.example';
import ProgramManager from '../ProgramManager';
import VendorManager from '../VendorManager';
import ScheduleGenerator from '../ScheduleGenerator';
import { schedulerService } from '../services/schedulerService';

// Mock the scheduler service
jest.mock('../services/schedulerService');

// Helper to render components with required providers
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Scheduler App Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Default mock implementations
    schedulerService.getPrograms.mockResolvedValue({ 
      data: [
        { id: 1, name: 'Banyan House', short_name: 'BAN', color: '#FF5733' },
        { id: 2, name: 'Hedge House', short_name: 'HED', color: '#33FF57' }
      ] 
    });
    
    schedulerService.getVendors.mockResolvedValue({ 
      data: [
        { 
          id: 1, 
          name: 'Orlando Science Center', 
          active: true,
          rotation_week_1: true,
          rotation_week_2: false,
          rotation_week_3: true,
          rotation_week_4: true
        }
      ] 
    });
    
    schedulerService.getWeeklySchedule.mockResolvedValue({
      data: {
        schedules: []
      }
    });
  });

  describe('App Component', () => {
    test('renders navigation and main content', async () => {
      renderWithRouter(<App />);
      
      expect(screen.getByText('Family First Scheduler')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Schedule')).toBeInTheDocument();
      expect(screen.getByText('Programs')).toBeInTheDocument();
      expect(screen.getByText('Vendors')).toBeInTheDocument();
    });

    test('loads dashboard data on mount', async () => {
      renderWithRouter(<App />);
      
      await waitFor(() => {
        expect(schedulerService.getPrograms).toHaveBeenCalled();
        expect(schedulerService.getVendors).toHaveBeenCalled();
        expect(schedulerService.getWeeklySchedule).toHaveBeenCalled();
      });
    });
  });

  describe('ProgramManager Component', () => {
    test('displays programs and allows creation', async () => {
      const user = userEvent.setup();
      const onUpdate = jest.fn();
      
      render(<ProgramManager onUpdate={onUpdate} />);
      
      // Wait for programs to load
      await waitFor(() => {
        expect(screen.getByText('Banyan House')).toBeInTheDocument();
        expect(screen.getByText('Hedge House')).toBeInTheDocument();
      });
      
      // Fill out form to add new program
      await user.type(screen.getByLabelText('House Name'), 'Test House');
      await user.type(screen.getByLabelText('Short Name'), 'TST');
      await user.type(screen.getByLabelText('AM Time'), '10:00 AM');
      await user.type(screen.getByLabelText('PM Time'), '2:00 PM');
      
      // Mock the create response
      schedulerService.createProgram.mockResolvedValue({
        data: { id: 3, name: 'Test House', short_name: 'TST' }
      });
      
      // Submit form
      await user.click(screen.getByText('Add Program'));
      
      await waitFor(() => {
        expect(schedulerService.createProgram).toHaveBeenCalledWith({
          name: 'Test House',
          short_name: 'TST',
          color: expect.any(String),
          am_time_slot: '10:00 AM',
          pm_time_slot: '2:00 PM'
        });
        expect(onUpdate).toHaveBeenCalled();
      });
    });

    test('allows editing existing program', async () => {
      const user = userEvent.setup();
      
      render(<ProgramManager />);
      
      await waitFor(() => {
        expect(screen.getByText('Banyan House')).toBeInTheDocument();
      });
      
      // Click edit button on first program
      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);
      
      // Check that form is populated
      expect(screen.getByDisplayValue('Banyan House')).toBeInTheDocument();
      expect(screen.getByDisplayValue('BAN')).toBeInTheDocument();
      
      // Update the name
      const nameInput = screen.getByLabelText('House Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Banyan House');
      
      // Mock update response
      schedulerService.updateProgram.mockResolvedValue({
        data: { id: 1, name: 'Updated Banyan House' }
      });
      
      // Submit update
      await user.click(screen.getByText('Update Program'));
      
      await waitFor(() => {
        expect(schedulerService.updateProgram).toHaveBeenCalledWith(1, expect.objectContaining({
          name: 'Updated Banyan House'
        }));
      });
    });

    test('confirms before deleting program', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn(() => true);
      
      render(<ProgramManager />);
      
      await waitFor(() => {
        expect(screen.getByText('Banyan House')).toBeInTheDocument();
      });
      
      // Mock delete response
      schedulerService.deleteProgram.mockResolvedValue({});
      
      // Click delete button
      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this program?');
      
      await waitFor(() => {
        expect(schedulerService.deleteProgram).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('VendorManager Component', () => {
    test('displays vendors with rotation settings', async () => {
      render(<VendorManager />);
      
      await waitFor(() => {
        expect(screen.getByText('Orlando Science Center')).toBeInTheDocument();
        expect(screen.getByText('Week 1, 3, 4')).toBeInTheDocument();
      });
    });

    test('creates vendor with rotation settings', async () => {
      const user = userEvent.setup();
      
      render(<VendorManager />);
      
      // Fill out vendor form
      await user.type(screen.getByLabelText('Vendor Name'), 'New Vendor');
      await user.type(screen.getByLabelText('Contact Name'), 'John Doe');
      await user.type(screen.getByLabelText('Contact Phone'), '(407) 555-1234');
      
      // Uncheck week 2
      const week2Checkbox = screen.getByLabelText('Week 2');
      await user.click(week2Checkbox);
      
      // Mock create response
      schedulerService.createVendor.mockResolvedValue({
        data: { id: 2, name: 'New Vendor' }
      });
      
      // Submit
      await user.click(screen.getByText('Add Vendor'));
      
      await waitFor(() => {
        expect(schedulerService.createVendor).toHaveBeenCalledWith(expect.objectContaining({
          name: 'New Vendor',
          contact_name: 'John Doe',
          contact_phone: '(407) 555-1234',
          rotation_week_1: true,
          rotation_week_2: false,
          rotation_week_3: true,
          rotation_week_4: true,
          active: true
        }));
      });
    });
  });

  describe('ScheduleGenerator Component', () => {
    test('generates schedule with selected programs and vendors', async () => {
      const user = userEvent.setup();
      const onGenerate = jest.fn();
      
      render(<ScheduleGenerator onGenerate={onGenerate} />);
      
      await waitFor(() => {
        expect(screen.getByText('Banyan House')).toBeInTheDocument();
        expect(screen.getByText('Orlando Science Center')).toBeInTheDocument();
      });
      
      // Change year
      const yearInput = screen.getByLabelText('Year');
      await user.clear(yearInput);
      await user.type(yearInput, '2025');
      
      // Mock conflict check
      schedulerService.checkConflicts.mockResolvedValue({
        data: { conflicts: [] }
      });
      
      // Mock generate response
      schedulerService.generateYearSchedule.mockResolvedValue({
        data: { weeks_generated: 52 }
      });
      
      // Generate schedule
      await user.click(screen.getByText('Generate Schedule'));
      
      await waitFor(() => {
        expect(schedulerService.checkConflicts).toHaveBeenCalled();
        expect(schedulerService.generateYearSchedule).toHaveBeenCalledWith({
          year: 2025,
          start_month: 1,
          end_month: 12,
          program_ids: [1, 2],
          vendor_ids: [1]
        });
        expect(onGenerate).toHaveBeenCalled();
      });
    });

    test('shows conflicts and asks for confirmation', async () => {
      const user = userEvent.setup();
      window.confirm = jest.fn(() => true);
      
      render(<ScheduleGenerator />);
      
      await waitFor(() => {
        expect(screen.getByText('Generate Schedule')).toBeInTheDocument();
      });
      
      // Mock conflict response
      schedulerService.checkConflicts.mockResolvedValue({
        data: {
          conflicts: [
            { date: '2025-01-01', reason: 'Holiday - New Year\'s Day' },
            { date: '2025-07-04', reason: 'Holiday - Independence Day' }
          ]
        }
      });
      
      // Mock generate response
      schedulerService.generateYearSchedule.mockResolvedValue({
        data: { weeks_generated: 52 }
      });
      
      await user.click(screen.getByText('Generate Schedule'));
      
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledWith(
          'Found 2 potential conflicts. Do you want to proceed anyway?'
        );
      });
    });
  });

  describe('Integration Flow', () => {
    test('complete workflow: create program, create vendor, generate schedule', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<App />);
      
      // Navigate to programs
      await user.click(screen.getByText('Programs'));
      
      await waitFor(() => {
        expect(screen.getByText('Program Management')).toBeInTheDocument();
      });
      
      // Add a program
      await user.type(screen.getByLabelText('House Name'), 'Integration Test House');
      await user.type(screen.getByLabelText('Short Name'), 'ITH');
      
      schedulerService.createProgram.mockResolvedValue({
        data: { id: 99, name: 'Integration Test House' }
      });
      
      await user.click(screen.getByText('Add Program'));
      
      await waitFor(() => {
        expect(schedulerService.createProgram).toHaveBeenCalled();
      });
      
      // Navigate to vendors
      await user.click(screen.getByText('Vendors'));
      
      await waitFor(() => {
        expect(screen.getByText('Vendor Management')).toBeInTheDocument();
      });
      
      // Add a vendor
      await user.type(screen.getByLabelText('Vendor Name'), 'Integration Test Vendor');
      
      schedulerService.createVendor.mockResolvedValue({
        data: { id: 99, name: 'Integration Test Vendor' }
      });
      
      await user.click(screen.getByText('Add Vendor'));
      
      await waitFor(() => {
        expect(schedulerService.createVendor).toHaveBeenCalled();
      });
      
      // Navigate to generate
      await user.click(screen.getByText('Generate'));
      
      await waitFor(() => {
        expect(screen.getByText('Schedule Generator')).toBeInTheDocument();
      });
      
      // Mock updated lists with new items
      schedulerService.getPrograms.mockResolvedValue({
        data: [
          { id: 1, name: 'Banyan House', short_name: 'BAN', color: '#FF5733' },
          { id: 2, name: 'Hedge House', short_name: 'HED', color: '#33FF57' },
          { id: 99, name: 'Integration Test House', short_name: 'ITH', color: '#3788d8' }
        ]
      });
      
      schedulerService.getVendors.mockResolvedValue({
        data: [
          { id: 1, name: 'Orlando Science Center', active: true },
          { id: 99, name: 'Integration Test Vendor', active: true }
        ]
      });
      
      // This should trigger a reload of programs and vendors
      await waitFor(() => {
        expect(screen.getByText('Integration Test House')).toBeInTheDocument();
        expect(screen.getByText('Integration Test Vendor')).toBeInTheDocument();
      });
    });
  });
});
