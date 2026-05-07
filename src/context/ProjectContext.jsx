import { createContext, useContext, useState, useCallback } from 'react';
import { getProjectsApi, createProjectApi, updateProjectApi, deleteProjectApi } from '../api/project.api';
import toast from 'react-hot-toast';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProjectsApi();
      setProjects(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (projectData) => {
    const { data } = await createProjectApi(projectData);
    setProjects((prev) => [data.data, ...prev]);
    toast.success('Project created');
    return data.data;
  };

  const updateProject = async (id, projectData) => {
    const { data } = await updateProjectApi(id, projectData);
    setProjects((prev) => prev.map((p) => (p._id === id ? data.data : p)));
    toast.success('Project updated');
    return data.data;
  };

  const deleteProject = async (id) => {
    await deleteProjectApi(id);
    setProjects((prev) => prev.filter((p) => p._id !== id));
    toast.success('Project deleted');
  };

  return (
    <ProjectContext.Provider value={{ projects, loading, fetchProjects, createProject, updateProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
};
