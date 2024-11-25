import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    priority: 'low',
    completed: false,
    createdAt: new Date().toISOString(),
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState('date'); // Sort by date or priority

  const API_URL = 'https://674448b0b4e2e04abea18f41.mockapi.io/api/v1/todo';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error('Unexpected data format:', data);
        Alert.alert('Error', 'Invalid data received from the server.');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Could not fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.name.trim() || !newTask.description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          createdAt: new Date().toISOString(), // Ensure createdAt is sent
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to add task:', errorText);
        Alert.alert('Error', 'Could not add task. Check server response.');
        return;
      }

      const createdTask = await response.json();
      setTasks((prevTasks) => [...prevTasks, createdTask]);
      resetNewTask();
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Could not add task. Network or server issue.');
    } finally {
      setLoading(false);
    }
  };

  const removeTask = async (id) => {
    try {
      setLoading(true);
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error removing task:', error);
      Alert.alert('Error', 'Could not remove task');
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async () => {
    if (!editingTask) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      const updatedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      resetNewTask();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Could not update task');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (id) => {
    try {
      const task = tasks.find((task) => task.id === id);
      if (!task) return;
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, completed: !task.completed }),
      });
      const updatedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    } catch (error) {
      console.error('Error toggling task completion:', error);
      Alert.alert('Error', 'Could not toggle task completion');
    }
  };

  const resetNewTask = () => {
    setNewTask({
      name: '',
      description: '',
      priority: 'low',
      completed: false,
      createdAt: new Date().toISOString(),
    });
    setEditingTask(null);
    setShowPriorityModal(false);
  };

  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  const filteredTasks = tasks
    .filter((task) =>
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === 'priority') {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt); // Default sorting by date
    });

  const priorityColor = {
    high: '#d9534f',
    medium: '#f0ad4e',
    low: '#5bc0de',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTask.name}
          onChangeText={(text) =>
            setNewTask((prev) => ({ ...prev, name: text }))
          }
          placeholder="Enter task name"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          value={newTask.description}
          onChangeText={(text) =>
            setNewTask((prev) => ({ ...prev, description: text }))
          }
          placeholder="Enter task description"
          placeholderTextColor="#888"
        />
        <TouchableOpacity
          style={styles.priorityButton}
          onPress={() => setShowPriorityModal(true)}
        >
          <Text style={styles.priorityText}>
            Priority: {capitalize(newTask.priority)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={editingTask ? updateTask : addTask}
        >
          <Text style={styles.addButtonText}>
            {editingTask ? 'Update Task' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Additional UI for search, task list, etc., as shown in your original code */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 80,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  priorityButton: {
    backgroundColor: '#e6e6e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  priorityText: {
    fontSize: 14,
    color: '#555',
  },
  addButton: {
    backgroundColor: '#5bc0de',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  searchInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  taskItem: {
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 6,
    marginBottom: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  taskDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  taskPriority: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 10,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#5bc0de',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#d9534f',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  modalOption: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: 200,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: 120,
    alignItems: 'center',
  },
});
