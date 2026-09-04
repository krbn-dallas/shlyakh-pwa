import { Link } from 'react-router-dom';
export function SosFab(){
  return (
    <Link to="/sos" aria-label="SOS" style={{
      position:'fixed', right:16, bottom:78, zIndex:25,
      width:64,height:64,borderRadius:'50%',background:'var(--red)',color:'var(--on-red)',
      display:'grid',placeItems:'center',textDecoration:'none',fontWeight:800,fontSize:18,boxShadow:'var(--shadow)',border:'3px solid var(--surface)'
    }}>
      SOS
      <span style={{position:'absolute',inset:-6,borderRadius:'50%',border:'2px solid var(--gold)',animation:'sos-pulse 2s infinite'}}/>
    </Link>
  );
}
