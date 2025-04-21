import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils/test-template';
import TaskManagement from '../TaskManagement';
import { useTasks } from '../../../hooks/useTasks';

// Mock the useTasks hook
jest.mock('../../../hooks/useTasks', () => ({
  useTasks: jest.fn(),
}));

describe('TaskManagement Component', () => {
  // Mock data
  const mockTasks = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Description for test task 1',
      status: 'todo',
      priority: 'medium',
      due_date: '2023-12-31',
      assigned_to: 'user1',
      assigned_to_name: 'John Doe',
      created_at: '2023-01-01',
      project_id: 'project1',
      tags: ['frontend', 'bug'],
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Description for test task 2',
      status: 'completed',
      priority: 'high',
      due_date: null,
      assigned_to: null,
      created_at: '2023-01-02',
      project_id: 'project1',
      tags: ['backend'],
    },
  ];

  const mockUsers = [
    { id: 'user1', email: 'john@example.com', full_name: 'John Doe' },
    { id: 'user2', email: 'jane@example.com', full_name: 'Jane Smith' },
  ];

  // Mock implementation of useTasks
  const mockUseTasks = {
    tasks: mockTasks,
    loading: false,
    users: mockUsers,
    statusFilter: 'all',
    setStatusFilter: jest.fn(),
    priorityFilter: 'all',
    setPriorityFilter: jest.fn(),
    assigneeFilter: 'all',
    setAssigneeFilter: jest.fn(),
    searchQuery: '',
    setSearchQuery: jest.fn(),
    hasFilters: false,
    clearFilters: jest.fn(),
    createTask: jest.fn().mockResolvedValue(true),
    updateTask: jest.fn().mockResolvedValue(true),
    deleteTask: jest.fn().mockResolvedValue(true),
    updateTaskStatus: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTasks as jest.Mock).mockReturnValue(mockUseTasks);
  });

  it('renders task management component with tasks', () => {
    render(<TaskManagement />);
    
    // Check if the title is rendered
    expect(screen.getByText('Task Management')).toBeInTheDocument();
    
    // Check if the add task button is rendered
    expect(screen.getByText('Add Task')).toBeInTheDocument();
    
    // Check if tasks are rendered
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    
    // Check if task details are rendered
    expect(screen.getByText('Description for test task 1')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('frontend, bug')).toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    (useTasks as jest.Mock).mockReturnValue({
      ...mockUseTasks,
      loading: true,
      tasks: [],
    });
    
    render(<TaskManagement />);
    
    // Check if loading indicator is shown
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty state when no tasks are available', () => {
    (useTasks as jest.Mock).mockReturnValue({
      ...mockUseTasks,
      tasks: [],
    });
    
    render(<TaskManagement />);
    
    // Check if empty state message is shown
    expect(screen.getByText('No Tasks Found')).toBeInTheDocument();
    expect(screen.getByText("You don't have any tasks yet. Create your first task to get started.")).toBeInTheDocument();
  });

  it('opens add task dialog when add task button is clicked', () => {
    render(<TaskManagement />);
    
    // Click add task button
    fireEvent.click(screen.getByText('Add Task'));
    
    // Check if dialog is opened
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByText('Create a new task with details below.')).toBeInTheDocument();
  });

  it('opens edit task dialog when edit button is clicked', async () => {
    render(<TaskManagement />);
    
    // Open dropdown menu for the first task
    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);
    
    // Click edit button
    try {
    const editButton = await screen.findByText('Edit');
    } catch (error) {
      // Handle error appropriately
    }
    fireEvent.click(editButton);
    
    // Check if edit dialog is opened
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByText('Update task details below.')).toBeInTheDocument();
    
    // Check if task data is loaded in the form
    const titleInput = screen.getByLabelText('Title*');
    expect(titleInput).toHaveValue('Test Task 1');
  });

  it('calls updateTaskStatus when task status is toggled', () => {
    render(<TaskManagement />);
    
    // Find the checkbox for the first task
    const checkbox = screen.getAllByRole('button')[2]; // The checkbox is a button
    fireEvent.click(checkbox);
    
    // Check if updateTaskStatus was called with correct parameters
    expect(mockUseTasks.updateTaskStatus).toHaveBeenCalledWith('1', 'completed');
  });

  it('calls deleteTask when delete button is clicked', async () => {
    render(<TaskManagement />);
    
    // Open dropdown menu for the first task
    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);
    
    // Click delete button
    try {
    const deleteButton = await screen.findByText('Delete');
    } catch (error) {
      // Handle error appropriately
    }
    fireEvent.click(deleteButton);
    
    // Check if deleteTask was called with correct parameters
    expect(mockUseTasks.deleteTask).toHaveBeenCalledWith('1');
  });

  it('creates a new task when form is submitted', async () => {
    render(<TaskManagement />);
    
    // Open add task dialog
    fireEvent.click(screen.getByText('Add Task'));
    
    // Fill the form
    fireEvent.change(screen.getByLabelText('Title*'), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New task description' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create Task'));
    
    // Check if createTask was called
    try {
    await waitFor(() => {
    } catch (error) {
      // Handle error appropriately
    }
      expect(mockUseTasks.createTask).toHaveBeenCalled();
    });
  });

  it('updates a task when edit form is submitted', async () => {
    render(<TaskManagement />);
    
    // Open dropdown menu for the first task
    const moreButtons = screen.getAllByRole('button', { name: /more/i });
    fireEvent.click(moreButtons[0]);
    
    // Click edit button
    try {
    const editButton = await screen.findByText('Edit');
    } catch (error) {
      // Handle error appropriately
    }
    fireEvent.click(editButton);
    
    // Update the form
    fireEvent.change(screen.getByLabelText('Title*'), { target: { value: 'Updated Task' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Update Task'));
    
    // Check if updateTask was called
    try {
    await waitFor(() => {
    } catch (error) {
      // Handle error appropriately
    }
      expect(mockUseTasks.updateTask).toHaveBeenCalled();
    });
  });
});
