import api from './api';

export interface SimulationParams {
  headcount?: number;
  budget?: number;
  duration_weeks?: number;
  [key: string]: unknown;
}

export interface SimulationResult {
  projected_outcomes: number;
  estimated_cost: number;
  completion_probability: number;
  risk_score: number;
  timeline_weeks: number;
  weekly_breakdown: { week: number; progress: number }[];
}

export interface SimulationSnapshot {
  id: number;
  simulation_id: number;
  label: string | null;
  parameters: SimulationParams | null;
  result: SimulationResult | null;
  created_at: string | null;
}

export interface Simulation {
  id: number;
  name: string;
  description: string | null;
  status: string;
  parameters: SimulationParams | null;
  snapshot_count: number;
  created_at: string | null;
}

export async function listSimulations(): Promise<Simulation[]> {
  const res = await api.get<{ simulations: Simulation[] }>('/simulations');
  return res.data.simulations;
}

export async function createSimulation(payload: { name: string; description?: string; parameters?: SimulationParams }): Promise<Simulation> {
  const res = await api.post<{ simulation: Simulation }>('/simulations', payload);
  return res.data.simulation;
}

export async function getSimulation(id: number): Promise<{ simulation: Simulation; snapshots: SimulationSnapshot[] }> {
  const res = await api.get(`/simulations/${id}`);
  return res.data;
}

export async function runSimulation(id: number, parameters: SimulationParams, label?: string): Promise<SimulationSnapshot> {
  const res = await api.post<{ snapshot: SimulationSnapshot }>(`/simulations/${id}/run`, { parameters, label });
  return res.data.snapshot;
}

export async function deleteSimulation(id: number): Promise<void> {
  await api.delete(`/simulations/${id}`);
}