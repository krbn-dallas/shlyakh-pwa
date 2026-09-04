import { useEffect, useState } from 'react';
import type {
  CheckSection, City, Emergency, GuideSection, ItinDay, POI,
  Phrase, SafetyEntry, Taxi, TransportEntry, WalkRoute,
} from '@/shared/model/types';

/** Maps a data file to the shape it holds. Adding a file? Add it here. */
export interface DataFiles {
  cities: City[];
  emergency: Emergency[];
  taxi: Taxi[];
  poi: POI[];
  safety: SafetyEntry[];
  routes: WalkRoute[];
  itinerary: ItinDay[];
  checklist: CheckSection[];
  phrases: Phrase[];
  transport: TransportEntry[];
  guide: GuideSection[];
}

const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export function load<K extends keyof DataFiles>(name: K): Promise<DataFiles[K]> {
  if (cache.has(name)) return Promise.resolve(cache.get(name) as DataFiles[K]);
  let p = inflight.get(name) as Promise<DataFiles[K]> | undefined;
  if (!p) {
    p = fetch(`/data/${name}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`${name}.json: ${r.status}`);
        return r.json();
      })
      .then((json: DataFiles[K]) => {
        cache.set(name, json);
        inflight.delete(name);
        return json;
      })
      .catch((e) => {
        inflight.delete(name);
        throw e;
      });
    inflight.set(name, p);
  }
  return p;
}

export interface DataState<T> { data: T | null; loading: boolean; error: Error | null; }

/** Typed replacement for the twelve copies of `useEffect(() => { fetch(...) })`. */
export function useData<K extends keyof DataFiles>(name: K): DataState<DataFiles[K]> {
  const [state, setState] = useState<DataState<DataFiles[K]>>(() => ({
    data: (cache.get(name) as DataFiles[K]) ?? null,
    loading: !cache.has(name),
    error: null,
  }));

  useEffect(() => {
    let alive = true;
    if (cache.has(name)) {
      setState({ data: cache.get(name) as DataFiles[K], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    load(name)
      .then((data) => { if (alive) setState({ data, loading: false, error: null }); })
      .catch((error: Error) => { if (alive) setState({ data: null, loading: false, error }); });
    return () => { alive = false; };
  }, [name]);

  return state;
}
