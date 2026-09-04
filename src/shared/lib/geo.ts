import type { CityId } from '../model/types';
const BBOX: Record<CityId,[number,number,number,number]> = {
  kyiv:[50.36,30.35,50.59,30.72],
  chisinau:[46.92,28.78,47.10,28.97],
  marrakech:[31.57,-8.08,31.70,-7.93]
};
export function cityByCoord(lat:number, lon:number): CityId|null{
  for(const [id, bb] of Object.entries(BBOX)){
    const [latS,lonW,latN,lonE]=bb as [number,number,number,number];
    if(lat>=latS && lat<=latN && lon>=lonW && lon<=lonE) return id as CityId;
  }
  return null;
}
export function getBbox(id:CityId){ return BBOX[id]; }
